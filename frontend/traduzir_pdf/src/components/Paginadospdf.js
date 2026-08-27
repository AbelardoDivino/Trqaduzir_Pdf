import { useState,useContext } from "react"
import {AuthContext} from '../context/AuthContext'
import PagamentoPix from "./Pagamentopix"
import { Link } from "react-router-dom"
const API_URL = (process.env.REACT_APP_API_URL || "https://trqaduzir-pdf.onrender.com").replace(/\/+$/, "");
function Paginadospdf() {
  const [arquivo, setArquivo] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [progresso, setProgresso] = useState(0)
  const [mensagem, setMensagem] = useState("")
  const [requerPix, setRequerPix] = useState(false)
  const {token} = useContext(AuthContext)
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!arquivo) { setMensagem("Selecione um PDF primeiro"); return }
    setCarregando(true); setProgresso(0); setMensagem("Iniciando..."); setRequerPix(false)
    const formData = new FormData(); formData.append("pdf", arquivo)
    try {
      const res = await fetch(`${API_URL}/traduzir-progress`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData })
      if (!res.ok) { const err = await res.json().catch(()=>({erro:"Erro na tradução"})); if (res.status===402 || err.requerPagamento) { setRequerPix(true); throw new Error(err.erro) } if (res.status===429) { setRequerPix(true); throw new Error(err.erro) } throw new Error(err.erro || "Erro na tradução") }
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = ""
      while (true) {
        const { done, value } = await reader.read(); if (done) break
        buffer += decoder.decode(value, { stream: true }); const parts = buffer.split("\n\n"); buffer = parts.pop() || ""
        for (const part of parts) {
          const line = part.trim(); if (!line.startsWith("data:")) continue
          const data = JSON.parse(line.slice(5))
          if (data.erro) throw new Error(data.erro)
          if (data.pct !== undefined) { setProgresso(data.pct); if(data.msg) setMensagem(data.msg) }
          if (data.done && data.pdfBase64) {
            const bytes = Uint8Array.from(atob(data.pdfBase64), c=>c.charCodeAt(0)); const blob = new Blob([bytes], { type: "application/pdf" })
            const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=data.filename; a.click(); URL.revokeObjectURL(url)
            setMensagem("Tradução concluída!"); setProgresso(100)
          }
        }
      }
    } catch (err) { setMensagem("Erro: " + err.message) }
    setCarregando(false)
  }
  return (
    <div className="card" style={{maxWidth:"520px"}}>
      <h2>Traduzir PDF</h2>
      <p className="desc">Até 10 páginas por arquivo. 3 traduções gratuitas por dia.</p>
      <form onSubmit={handleUpload}>
        <input type="file" accept=".pdf" onChange={(e) => setArquivo(e.target.files[0])} style={{margin:"16px 0",fontSize:"14px"}} />
        <button className="btn btn-primary" type="submit" disabled={carregando} style={{width:"100%"}}>{carregando ? `Traduzindo ${progresso}%` : "Traduzir PDF"}</button>
      </form>
      {carregando && (<><div className="progress-track"><div className="progress-fill" style={{width:`${progresso}%`}} /></div><p className="meta">{progresso}% — {mensagem}</p></>)}
      {!carregando && mensagem && <p className="meta" style={{color: mensagem.startsWith("Erro") ? "#dc2626" : "#0f172a"}}>{mensagem}</p>}
      {requerPix && (<div style={{marginTop:"16px"}}><PagamentoPix onCredito={()=>setRequerPix(false)} /><Link to="/painel" className="btn" style={{width:"100%",marginTop:"12px"}}>Ir para o Painel e ver créditos</Link></div>)}
    </div>
  )
}
export default Paginadospdf
