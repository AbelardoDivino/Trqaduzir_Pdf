const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const PDFDocument = require("pdfkit");
const translate = require("google-translate-api-x");


const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/traduzir", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: "Nenhum PDF enviado." });
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
