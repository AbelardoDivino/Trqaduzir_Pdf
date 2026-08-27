import { useState } from "react"
import { useNavigate } from "react-router-dom"

const API_URL = (process.env.REACT_APP_API_URL || "https://trqaduzir-pdf.onrender.com").replace(/\/+$/, "");

function Eye({off}){ return off ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><line x1="4" y1="4" x2="20" y2="20"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> }

function Cadastrar(){
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mostrar,setMostrar]=useState(false)
    const [mostrar2,setMostrar2]=useState(false)
    const [carregando,setCarregando]=useState(false)
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault(); setMensagem(""); setErro("");
        if (senha !== confirmarSenha) { setErro("As senhas não coincidem!"); return; }
        setCarregando(true)
        try {
            const response = await fetch(`${API_URL}/usuarios/cadastro`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome, email, senha }) });
            if (response.ok) { setMensagem("Cadastro realizado! Redirecionando..."); setTimeout(() => navigate("/login"), 1500); }
            else { const errorData = await response.json(); setErro(errorData.mensagem || "Erro ao realizar cadastro."); }
        } catch { setErro("Erro de conexão com o servidor."); }
        setCarregando(false)
    };
    return (
        <div className="card">
            <h2>Criar conta</h2>
            <p className="desc">Comece a traduzir em segundos</p>
            {mensagem && <p style={{color:"#16a34a",fontSize:"13px"}}>{mensagem}</p>}
            {erro && <p style={{color:"#dc2626",fontSize:"13px"}}>{erro}</p>}
            <form onSubmit={handleSubmit}>
                <div className="field"><label>Nome</label><input className="input" type="text" placeholder="Seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required /></div>
                <div className="field"><label>Email</label><input className="input" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div className="field"><label>Senha</label><div style={{position:"relative"}}><input className="input" type={mostrar?"text":"password"} placeholder="mínimo 8 caracteres" minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} required style={{paddingRight:"40px"}} /><button type="button" onClick={()=>setMostrar(v=>!v)} style={{position:"absolute",right:"8px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#64748b"}}><Eye off={mostrar} /></button></div></div>
                <div className="field"><label>Confirmar senha</label><div style={{position:"relative"}}><input className="input" type={mostrar2?"text":"password"} placeholder="repita a senha" minLength={8} value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required style={{paddingRight:"40px"}} /><button type="button" onClick={()=>setMostrar2(v=>!v)} style={{position:"absolute",right:"8px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#64748b"}}><Eye off={mostrar2} /></button></div></div>
                <button className="btn btn-primary" type="submit" disabled={carregando} style={{width:"100%",marginTop:"8px",gap:"8px"}}>{carregando && <span className="spinner" style={{borderColor:"rgba(255,255,255,.35)",borderTopColor:"#fff"}} />} {carregando?"Criando...":"Criar conta"}</button>
            </form>
        </div>
    );
}

export default Cadastrar
