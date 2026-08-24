import { useState, useEffect, useContext } from "react"
import { AuthContext } from '../context/AuthContext'

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

function PagamentoPix() {
  const [pix, setPix] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [statusPagamento, setStatusPagamento] = useState("")
  const { usuario } = useContext(AuthContext)

  const gerarPix = async () => {
    setCarregando(true)
    try {
      const res = await fetch(`${API_URL}/criar-pix`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          valor: 10.00,
          nome: usuario?.nome || "Cliente",
          email: usuario?.email || "cliente@gmail.com"
        })
      })

      const data = await res.json()
      if (res.ok) {
        setPix(data)
        setStatusPagamento("Pendente")
      } else {
        alert(data.erro || "Erro ao gerar o Pix")
      }
    } catch (err) {
      alert("Erro de conexão com o servidor")
    }
    setCarregando(false)
  }

  // polling para verificar o pagamento a cada 3 segundos
  useEffect(() => {
    if (!pix?.id) {
      return;
    }

    const intervalo = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/consultar-pagamento/${pix.id}`)
        const data = await res.json()

        if (data.status === "approved") {
          setStatusPagamento("Aprovado! Créditos adicionados.")
          clearInterval(intervalo)
        }
      } catch (err) {
        console.log("Erro ao checar status")
      }
    }, 3000)

    return () => clearInterval(intervalo)

  }, [pix?.id])

  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h2>Pagamento via PIX</h2>
      <button onClick={gerarPix} disabled={carregando} style={{ padding: "10px 20px", cursor: "pointer" }}>
        {carregando ? "Gerando PIX..." : "Gerar QR Code PIX (R$ 10,00)"}
      </button>

      {pix && (
        <div style={{ margin: "20px" }}>
          <p><strong>Status:</strong> {statusPagamento}</p>
          <img src={`data:image/png;base64,${pix.qr_base64}`} alt="QR code PIX" width={250} />
          <br /><br />
          <p>Ou copie o código PIX Copia e Cola:</p>
          <textarea readOnly value={pix.qr_code} rows={4} style={{ width: "80%", maxWidth: "400px" }} />
        </div>
      )}
    </div>
  )
}

export default PagamentoPix