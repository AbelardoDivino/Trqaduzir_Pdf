const express = require("express");
const { Payment } = require("mercadopago");
const { v4: uuid } = require("uuid");
const client = require("../config/mercadoPago.js");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const router = express.Router();

function getUserId(req) {
  try {
    const h = req.headers.authorization || "";
    const t = h.split(" ")[1];
    if (!t) return null;
    const d = jwt.verify(t, process.env.JWT_SECRET);
    return d.id;
  } catch { return null; }
}

router.post("/criar-pix", async (req, res) => {
  try {
    const usuarioId = getUserId(req);
    if (!usuarioId) return res.status(401).json({ erro: "Token não fornecido" });
    let { valor } = req.body;
    valor = Number(valor);
    if (!valor || valor < 1) valor = 10;
    const creditos = Math.floor(valor);
    const Usuario = mongoose.model("Usuario");
    const user = await Usuario.findById(usuarioId);
    if (!user) return res.status(404).json({ erro: "Usuário não encontrado" });

    const payment = new Payment(client);
    const resultado = await payment.create({
      body: {
        transaction_amount: valor,
        description: `${creditos} créditos - Traduzir PDF`,
        payment_method_id: "pix",
        payer: { email: user.email, first_name: user.nome || "Cliente" }
      },
      requestOptions: { idempotencyKey: uuid() }
    });

    const Pagamento = mongoose.model("Pagamento");
    await Pagamento.create({
      usuarioId,
      mpId: String(resultado.id),
      valor,
      creditos,
      status: resultado.status
    });

    res.json({
      id: resultado.id,
      status: resultado.status,
      creditos,
      qr_code: resultado.point_of_interaction?.transaction_data?.qr_code,
      qr_base64: resultado.point_of_interaction?.transaction_data?.qr_code_base64
    });
  } catch (erro) {
    console.log("Erro ao gerar PIX:", erro);
    res.status(500).json({ erro: "Erro ao gerar PIX", detalhe: erro.message });
  }
});

router.get("/consultar-pagamento/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payment = new Payment(client);
    const resultado = await payment.get({ id });
    let status = resultado.status;

    if (status === "approved") {
      const Pagamento = mongoose.model("Pagamento");
      const pag = await Pagamento.findOne({ mpId: String(id) });
      if (pag && !pag.creditado) {
        const Usuario = mongoose.model("Usuario");
        await Usuario.findByIdAndUpdate(pag.usuarioId, { $inc: { creditos: pag.creditos } });
        pag.status = "approved";
        pag.creditado = true;
        await pag.save();
      }
    }

    res.json({ id: resultado.id, status });
  } catch (erro) {
    console.log("Erro ao consultar pagamento:", erro);
    res.status(500).json({ erro: "Erro ao consultar pagamento" });
  }
});

router.post("/webhook/mercadopago", async (req, res) => {
  try {
    const { type, data } = req.body;
    if (type === "payment" && data?.id) {
      const payment = new Payment(client);
      const resultado = await payment.get({ id: data.id });
      if (resultado.status === "approved") {
        const Pagamento = mongoose.model("Pagamento");
        const pag = await Pagamento.findOne({ mpId: String(data.id) });
        if (pag && !pag.creditado) {
          const Usuario = mongoose.model("Usuario");
          await Usuario.findByIdAndUpdate(pag.usuarioId, { $inc: { creditos: pag.creditos } });
          pag.status = "approved";
          pag.creditado = true;
          await pag.save();
        }
      }
    }
    res.sendStatus(200);
  } catch (e) { console.log("webhook erro", e.message); res.sendStatus(200); }
});

router.get("/usuario/creditos", async (req, res) => {
  const usuarioId = getUserId(req);
  if (!usuarioId) return res.status(401).json({ erro: "Token não fornecido" });
  const Usuario = mongoose.model("Usuario");
  const user = await Usuario.findById(usuarioId, "creditos usoDiario");
  res.json({ creditos: user?.creditos || 0, usoDiario: user?.usoDiario });
});

module.exports = router;
