import { useContext } from "react"
import { Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

function Campousu(){
    const { usuario } = useContext(AuthContext);

    return (
        <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto" }}>
            <h2>Painel do Usuário</h2>
            {usuario ? (
                <div>
                    <p><strong>Nome:</strong> {usuario.nome || "Não informado"}</p>
                    <p><strong>Email:</strong> {usuario.email || "Não informado"}</p>
                    
                    <div style={{ marginTop: "20px" }}>
                        <Link to="/traduzir" style={{ padding: "10px 20px", background: "#007bff", color: "#fff", textDecoration: "none", borderRadius: "4px" }}>
                            Traduzir PDF
                        </Link>
                    </div>

                    <div style={{ marginTop: "40px", padding: "15px", border: "1px dashed #ccc" }}>
                        <h3>Área de Pagamento / PIX</h3>
                        <p>(Em breve)</p>
                    </div>
                </div>
            ) : (
                <p>Você precisa estar logado para acessar o painel. <Link to="/login">Entrar</Link></p>
            )}
        </div>
    );
}

export default Campousu