import { useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"

function Navbar(){
    const { usuario, logout } = useContext(AuthContext);
    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="brand">Traduzir PDF</Link>
                <div className="nav-links">
                    {usuario ? (
                        <>
                            <Link to="/traduzir">Traduzir</Link>
                            <Link to="/painel">Painel</Link>
                            <span className="nav-user">{usuario.nome || usuario.email}</span>
                            <button className="btn" onClick={logout}>Sair</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Entrar</Link>
                            <Link to="/cadastrar" className="btn btn-primary">Criar conta</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar
