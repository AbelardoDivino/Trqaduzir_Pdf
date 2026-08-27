import { useContext, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import PagamentoPix from "./Pagamentopix"

const API_URL = (process.env.REACT_APP_API_URL || "https://trqaduzir-pdf.onrender.com").replace(/\/+$/, "");

function Campousu(){
    const { usuario, token } = useContext(AuthContext);
    const [creditos, setCreditos] = useState(null)
    const [uso, setUso] = useState(null)

    const carregar = async () => {
      try {
        const res = await fetch(`${API_URL}/usuario/creditos`, { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        if (res.ok) { setCreditos(data.creditos); setUso(data.usoDiario) }
      } catch {}
    }
    useEffect(()=>{ if(token) carregar() },[token])

    if (!usuario) return <div className="card"><p>Você precisa estar logado. <Link to="/login">Entrar</Link></p></div>

    return (
        <div style={{maxWidth:"640px",margin:"24px auto",padding:"0 16px"}}>
            <div className="card" style={{maxWidth:"640px",margin:"0"}}>
                <h2>Painel</h2>
                <p className="desc">{usuario.nome} — {usuario.email}</p>
                <div style={{display:"flex",gap:"12px",margin:"12px 0"}}>
                    <div style={{flex:1,border:"1px solid #e2e8f0",borderRadius:"8px",padding:"12px",textAlign:"center"}}><div style={{fontSize:"22px",fontWeight:700}}>{creditos ?? "—"}</div><div style={{fontSize:"12px",color:"#64748b"}}>créditos</div></div>
                    <div style={{flex:1,border:"1px solid #e2e8f0",borderRadius:"8px",padding:"12px",textAlign:"center"}}><div style={{fontSize:"22px",fontWeight:700}}>{uso ? `${uso.traducoes}/3` : "—"}</div><div style={{fontSize:"12px",color:"#64748b"}}>traduções hoje</div></div>
                </div>
                <Link to="/traduzir" className="btn btn-primary" style={{width:"100%",marginTop:"8px"}}>Traduzir PDF</Link>
            </div>
            <PagamentoPix onCredito={carregar} />
        </div>
    );
}

export default Campousu
