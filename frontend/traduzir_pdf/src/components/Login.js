import { useState, useContext } from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "../context/AuthContext"
import { GoogleLogin } from "@react-oauth/google"

const API_URL = (process.env.REACT_APP_API_URL || "https://trqaduzir-pdf.onrender.com").replace(/\/+$/, "");

function Eye({off}){ return off ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><line x1="4" y1="4" x2="20" y2="20"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> }

function Login(){
    const [email,setEmail] = useState("")
    const [senha,setSenha] = useState("")
    const [mostrar,setMostrar] = useState(false)
    const [carregando,setCarregando]=useState(false)
    const [erro,setErro] = useState("")
    const {login}  = useContext(AuthContext)
    const navigate = useNavigate()
    const handleSubmit = async (e) =>{
        e.preventDefault(); setErro(""); setCarregando(true)
        try{
            const response = await fetch(`${API_URL}/usuarios/login`,{ method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({email,senha}) });
            if (response.ok) { const data = await response.json(); login(data.token,data.usuario); navigate("/"); }
            else{ const errorData = await response.json(); setErro(errorData.mensagem || "Verifique suas credenciais") }
        }catch{ setErro("Erro de conexão com o servidor") }
        setCarregando(false)
    }
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch(`${API_URL}/usuarios/google`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: credentialResponse.credential }) });
            const data = await res.json();
            if (res.ok) { login(data.token, data.usuario); navigate("/"); } else { setErro(data.erro || "Erro no login com Google"); }
        } catch { setErro("Erro de conexão com o servidor"); }
    };
    return (
    <div className="card">
        <h2>Entrar</h2>
        <p className="desc">Acesse sua conta para traduzir seus PDFs</p>
        {erro && <p style={{color:"#dc2626",fontSize:"13px",margin:"0 0 12px"}}>{erro}</p>}
        <form onSubmit={handleSubmit}>
            <div className="field"><label>Email</label><input className="input" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            <div className="field"><label>Senha</label><div style={{position:"relative"}}><input className="input" type={mostrar?"text":"password"} placeholder="mínimo 8 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} required style={{paddingRight:"40px"}} /><button type="button" onClick={()=>setMostrar(v=>!v)} style={{position:"absolute",right:"8px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#64748b"}}><Eye off={mostrar} /></button></div></div>
            <button className="btn btn-primary" type="submit" disabled={carregando} style={{width:"100%",marginTop:"8px",gap:"8px"}}>{carregando && <span className="spinner" />} {carregando?"Entrando...":"Entrar"}</button>
            <div style={{margin:"16px 0",borderTop:"1px solid #e2e8f0",paddingTop:"16px"}}><GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setErro("Falha ao fazer login com o Google")} /></div>
        </form>
    </div>
    )
}

export default Login
