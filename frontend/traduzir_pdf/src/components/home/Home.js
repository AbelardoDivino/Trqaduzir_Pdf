import { Link } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../../context/AuthContext"

function Home(){
    const { usuario } = useContext(AuthContext)
    return (
        <div className="hero">
            <h1>Traduza PDFs do inglês para o português com precisão</h1>
            <p>Envie seu arquivo, acompanhe o progresso de 0 a 100% e baixe o documento traduzido. Até 10 páginas por arquivo, 3 traduções gratuitas por dia.</p>
            <div className="hero-actions">
                {usuario ? <Link to="/traduzir" className="btn btn-primary">Traduzir agora</Link> : <><Link to="/cadastrar" className="btn btn-primary">Começar gratuito</Link><Link to="/login" className="btn">Entrar</Link></>}
            </div>
        </div>
    );
}

export default Home
