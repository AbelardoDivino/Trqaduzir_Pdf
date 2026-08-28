const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const PDFDocument = require("pdfkit");
const translate = require("google-translate-api-x");


const router = express.Router();
const upload = multer({ dest: "uploads/" });

function getAuthUser(req) {
  try {
    const h = req.headers.authorization || "";
    const t = h.split(" ")[1];
    if (!t) return null;
    const jwt = require("jsonwebtoken");
    return jwt.verify(t, process.env.JWT_SECRET);
  } catch { return null; }
}

async function checkLimite(usuarioId, numPaginas) {
  const mongoose = require("mongoose");
  const Usuario = mongoose.model("Usuario");
  const hoje = new Date().toISOString().slice(0,10);
  const user = await Usuario.findById(usuarioId);
  if (!user) return { permitido: false, erro: "Usuário não encontrado" };
  if (!user.usoDiario || user.usoDiario.data !== hoje) {
    user.usoDiario = { data: hoje, traducoes: 0, paginas: 0 };
  }
  if (numPaginas > 10) {
    const needed = Math.ceil(numPaginas / 10);
    if ((user.creditos || 0) < needed) return { permitido: false, erro: `PDF com ${numPaginas} páginas requer ${needed} créditos. Você tem ${user.creditos||0}.`, requerPagamento: true };
    user.creditos -= needed;
    user.usoDiario.traducoes += 1;
    user.usoDiario.paginas += numPaginas;
    await user.save();
    return { permitido: true };
  }
  if (user.usoDiario.traducoes >= 3) {
    if ((user.creditos || 0) < 1) return { permitido: false, erro: "Limite diário de 3 traduções atingido. Compre créditos.", requerPagamento: true };
    user.creditos -= 1;
  }
  user.usoDiario.traducoes += 1;
  user.usoDiario.paginas += numPaginas;
  await user.save();
  return { permitido: true };
}

router.post("/traduzir-progress", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ erro: "Nenhum PDF enviado." });
    let numPaginas = 1;
    try {
      const out = execSync(`pdfinfo "${req.file.path}" 2>/dev/null | grep Pages || echo "Pages: 1"`, { encoding: "utf-8" });
      const m = out.match(/Pages:\s+(\d+)/); if (m) numPaginas = parseInt(m[1], 10);
    } catch {}
    const authUser = getAuthUser(req);
    if (authUser && authUser.id) {
      const limite = await checkLimite(authUser.id, numPaginas);
      if (!limite.permitido) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(limite.requerPagamento ? 402 : 429).json({ erro: limite.erro, requerPagamento: limite.requerPagamento || false });
      }
    }
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    let textoOriginal = execSync(`pdftotext "${req.file.path}" -`, { encoding: "utf-8", timeout: 30000 }).trim();
    let textoTraduzido = "";
    const send = (pct, msg) => res.write(`data: ${JSON.stringify({ pct, msg })}\n\n`);
    send(5, "Extraindo texto...");
    if (textoOriginal.trim().length > 20) {
      const partes = textoOriginal.match(/.{1,500}/g) || [];
      for (let i = 0; i < partes.length; i++) {
        let r = null; let tent = 0;
        while (tent < 3) {
          try { r = await translate(partes[i], { from: "en", to: "pt", rejectOnPartialFail: false, forceBatch: false, tld: "com" }); break; }
          catch(e){ tent++; if(tent>=3) throw e; await new Promise(x=>setTimeout(x,2000)); }
        }
        textoTraduzido += (r?.text || partes[i]) + " ";
        send(Math.round(5 + ((i+1)/partes.length)*80), `Traduzindo ${i+1}/${partes.length}...`);
        await new Promise(x=>setTimeout(x,200));
      }
    } else { textoTraduzido = textoOriginal; }
    send(90, "Gerando PDF...");
    const pdfPath = await gerarPDF(textoTraduzido, req.file.originalname);
    send(100, "Concluído");
    const pdfB64 = fs.readFileSync(pdfPath).toString("base64");
    res.write(`data: ${JSON.stringify({ done: true, pdfBase64: pdfB64, filename: req.file.originalname.replace(".pdf","_traduzido.pdf") })}\n\n`);
    res.end();
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
  } catch(e){ try{ res.write(`data: ${JSON.stringify({ erro: e.message })}\n\n`); res.end(); }catch{} if(req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); }
});

router.post("/traduzir", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum PDF enviado." });
    }

    let numPaginas = 1;
    try {
      const out = execSync(`pdfinfo "${req.file.path}" 2>/dev/null | grep Pages || echo "Pages: 1"`, { encoding: "utf-8" });
      const m = out.match(/Pages:\s+(\d+)/);
      if (m) numPaginas = parseInt(m[1], 10);
    } catch {}
    const authUser = getAuthUser(req);
    if (authUser && authUser.id) {
      const limite = await checkLimite(authUser.id, numPaginas);
      if (!limite.permitido) {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(limite.requerPagamento ? 402 : 429).json({ erro: limite.erro, requerPagamento: limite.requerPagamento || false });
      }
    }

    let textoOriginal = execSync(`pdftotext "${req.file.path}" -`, {
      encoding: "utf-8",
      timeout: 30000,
    }).trim();
    let textoTraduzido = "";

    if (textoOriginal.trim().length > 20) {
      const partes = textoOriginal.match(/.{1,500}/g) || [];
      console.log(`[traduzir] ${partes.length} chunks para traduzir`);
      for (let i = 0; i < partes.length; i++) {
        let tentativas = 0;
        let resultado = null;
        while (tentativas < 3) {
          try {
            resultado = await translate(partes[i], {
              from: "en",
              to: "pt",
              rejectOnPartialFail: false,
              forceBatch: false,
              tld: "com",
            });
            break;
          } catch (e) {
            tentativas++;
            console.log(`[traduzir] chunk ${i}/${partes.length} tentativa ${tentativas} falhou: ${e.message.substring(0, 80)}`);
            if (tentativas >= 3) throw e;
            await new Promise(r => setTimeout(r, 2000));
          }
        }
        if (!resultado) {
          textoTraduzido += partes[i] + " ";
        } else {
          textoTraduzido += (resultado.text || partes[i]) + " ";
        }
        await new Promise(r => setTimeout(r, 800));
      }
    }

    const pdfPath = await gerarPDF(textoTraduzido, req.file.originalname);

    res.download(pdfPath, req.file.originalname.replace(".pdf", "_traduzido.pdf"), () => {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    });

  } catch (erro) {
    console.error(erro);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(500).json({ erro: erro.message });
  }
});

function gerarPDF(texto, nomeOriginal) {
  return new Promise((resolve, reject) => {
    const outputPath = path.join("uploads", `traduzido_${Date.now()}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(16).text("PDF Traduzido", { align: "center" });
    doc.fontSize(9).fillColor("#666").text(`Original: ${nomeOriginal}`, { align: "center" });
    doc.moveDown(2);
    doc.fillColor("#000");

    const linhas = texto.split("\n");
    let y = doc.y;
    for (const linha of linhas) {
      if (y > 700) {
        doc.addPage();
        y = doc.y;
      }
      if (linha.trim() === "") {
        doc.moveDown(0.3);
        y = doc.y;
      } else {
        doc.fontSize(11).text(linha, { align: "justify", lineGap: 2 });
        y = doc.y;
      }
    }

    doc.end();
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
}

module.exports = router;
