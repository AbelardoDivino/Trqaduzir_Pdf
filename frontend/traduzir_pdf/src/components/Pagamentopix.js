import { useState, useEffect, useContext } from "react"
import { AuthContext } from '../context/AuthContext'

const API_URL = (process.env.REACT_APP_API_URL || "https://trqaduzir-pdf.onrender.com").replace(/\/+$/, "");

function PagamentoPix({ onCredito }) {
  const [pix, setPix] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [statusPagamento, setStatusPagamento] = useState("")
  const [valor, setValor] = useState(10)
  const { token, usuario } = useContext(AuthContext)

  const gerarPix = async () => {
    setCarregando(true)
    try {
      const res = await fetch(`${API_URL}/criar-pix`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ valor: Number(valor), nome: usuario?.nome, email: usuario?.email })
      })
      const data = await res.json()
      if (res.ok) { setPix(data); setStatusPagamento("Pendente — escaneie o QR") }
      else alert(data.erro || "Erro ao gerar PIX")
    } catch { alert("Erro de conexão com o servidor") }
    setCarregando(false)
  }

  useEffect(() => {
    if (!pix?.id) return;
    const intervalo = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/consultar-pagamento/${pix.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (data.status === "approved") {
          setStatusPagamento("Aprovado! Créditos adicionados.")
          clearInterval(intervalo)
          if (onCredito) onCredito()
        }
      } catch {}
    }, 3000)
    return () => clearInterval(intervalo)
  }, [pix?.id])

  return (
    <div style={{border:"1px solid #e2e8f0",borderRadius:"10px",padding:"20px",background:"#fff",marginTop:"16px"}}>
      <h3 style={{margin:"0 0 8px",fontSize:"16px"}}>Comprar créditos — R$1 = 1 crédito</h3>
      <p style={{margin:"0 0 12px",color:"#64748b",fontSize:"13px"}}>Após as 3 traduções gratuitas do dia, cada tradução custa 1 crédito.</p>
      <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
        {[5,10,20].map(v => (
          <button key={v} onClick={()=>setValor(v)} className={valor===v ? "btn btn-primary" : "btn"} style={{flex:1}}>{v} créditos — R$ {v},00</button>
        ))}
      </div>
      <button onClick={gerarPix} disabled={carregando} className="btn btn-primary" style={{width:"100%"}}>{carregando ? "Gerando..." : `Gerar PIX R$ ${valor},00`}</button>
      {pix && (
        <div style={{marginTop:"16px",textAlign:"center"}}>
          <p style={{fontSize:"13px"}}><strong>Status:</strong> {statusPagamento}</p>
          {pix.qr_base64 && <img src={`data:image/png;base64,${pix.qr_base64}`} alt="QR PIX" width={200} style={{border:"1px solid #e2e8f0",borderRadius:"8px",padding:"8px"}} />}
          <p style={{fontSize:"12px",color:"#64748b",marginTop:"8px"}}>Ou copie o código PIX:</p>
          <textarea readOnly value={pix.qr_code} rows={3} className="input" style={{fontSize:"11px"}} />
        </div>
      )}
    </div>
  )
}

export default PagamentoPix
