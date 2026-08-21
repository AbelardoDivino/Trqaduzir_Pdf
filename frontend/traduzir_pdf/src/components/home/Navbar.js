import { useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import Footer from "./Footer"

function Navbar(){
    const { usuario, logout } = useContext(AuthContext);

    return (
        <nav style={{ padding: "15px", background: "#f4f4f4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <Link to="/">Home</Link>
                {usuario ? (
                    <>
                        <Link to="/traduzir">Traduzir PDF</Link>
                        <Link to="/painel">Painel</Link>
                        <span>Olá, {usuario.nome || usuario.email || "Usuário"}</span>
                        <button onClick={logout}>Sair</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Entrar</Link>
                        <Link to="/cadastrar">Cadastrar</Link>
                    </>
                )}
            </div>
            <div>
                <Footer />
            </div>
        </nav>
    );
}

export default Navbar