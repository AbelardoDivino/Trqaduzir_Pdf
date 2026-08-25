import { useState,useContext } from "react"
import {AuthContext} from '../context/AuthContext'

const API_URL = (process.env.REACT_APP_API_URL || "https://trqaduzir-pdf.onrender.com").replace(/\/+$/, "");

function Paginadospdf() {
  const [arquivo, setArquivo] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [mensagem, setMensagem] = useState("")
  const {token} = useContext(AuthContext)

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!arquivo) { setMensagem("Selecione um PDF primeiro"); return }
    setCarregando(true); setProgresso(0); setMensagem("Iniciando...")
    const formData = new FormData()
    formData.append("pdf", arquivo)
    try {
      const res = await fetch(`${API_URL}/traduzir-progress`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(()=>({erro:"Erro na tradução"}))
        if (res.status===402 || res.status===429) throw new Error(err.erro + " Faça pagamento PIX para continuar.")
        throw new Error(err.erro || "Erro na tradução")
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n\n")
        buffer = parts.pop() || ""
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith("data:")) continue
          const data = JSON.parse(line.slice(5))
          if (data.erro) throw new Error(data.erro)
          if (data.pct !== undefined) { setProgresso(data.pct); if(data.msg) setMensagem(data.msg) }
          if (data.done && data.pdfBase64) {
            const bytes = Uint8Array.from(atob(data.pdfBase64), c=>c.charCodeAt(0))
            const blob = new Blob([bytes], { type: "application/pdf" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a"); a.href=url; a.download=data.filename; a.click()
            URL.revokeObjectURL(url)
            setMensagem("Tradução concluída!"); setProgresso(100)
          }
        }
      }
    } catch (err) {
      setMensagem("Erro: " + err.message)
    }
    setCarregando(false)
  }

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Traduzir PDF</h2>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".pdf" onChange={(e) => setArquivo(e.target.files[0])} style={{ margin: "20px" }} />
        <br />
        <button type="submit" disabled={carregando} style={{ padding: "10px 30px", fontSize: "16px", cursor: carregando ? "wait" : "pointer" }}>
          {carregando ? `Traduzindo ${progresso}%...` : "Traduzir PDF"}
        </button>
      </form>
      {carregando && (
        <div style={{ maxWidth: "400px", margin: "20px auto", background: "#eee", borderRadius: "8px", overflow: "hidden", height: "22px" }}>
          <div style={{ width: `${progresso}%`, height: "100%", background: "#007bff", transition: "width 0.3s", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px" }}>{progresso}%</div>
        </div>
      )}
      {mensagem && <p style={{ marginTop: "20px" }}>{mensagem}</p>}
      <p style={{ marginTop: "10px", fontSize: "13px", color: "#666" }}>Limite gratuito: até 10 páginas, 3 traduções por dia. Após isso, 1 crédito (PIX) por tradução.</p>
    </div>
  )
}

export default Paginadospdf
