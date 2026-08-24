const express = require("express");
const { Payment } = require("mercadopago");
const { v4: uuid } = require("uuid");
const client = require("../config/mercadoPago.js");

const router = express.Router();

router.post("/criar-pix", async (req, res) => {
  try {
    const { valor, nome, email } = req.body;

    const payment = new Payment(client);

    const resultado = await payment.create({
      body: {
        transaction_amount: Number(valor),
        description: "Pagamento de Créditos de Tradução - Traduzir PDF",
        payment_method_id: "pix",
        payer: {
          email: email || "cliente@email.com",
          first_name: nome || "Cliente"
        }
      },
      requestOptions: {
        idempotencyKey: uuid()
      }
    });

    res.json({
      id: resultado.id,
      status: resultado.status,
      qr_code: resultado.point_of_interaction.transaction_data.qr_code,
      qr_base64: resultado.point_of_interaction.transaction_data.qr_code_base64
    });
  } catch (erro) {
    console.log("Erro ao gerar PIX:", erro);
    res.status(500).json({ erro: "Erro ao gerar PIX", detalhe: erro.message });
  }
});

// Rota para consultar o status do pagamento
router.get("/consultar-pagamento/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const payment = new Payment(client);
    const resultado = await payment.get({ id });

    res.json({
      id: resultado.id,
      status: resultado.status
    });
  } catch (erro) {
    console.log("Erro ao consultar pagamento:", erro);
    res.status(500).json({ erro: "Erro ao consultar pagamento" });
  }
});

module.exports = router;
