import { useState } from "react"
import { useNavigate } from "react-router-dom"

const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:3000").replace(/\/+$/, "");

function Cadastrar(){
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagem("");
        setErro("");

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem!");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/usuarios/cadastro`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nome, email, senha }),
            });

            if (response.ok) {
                setMensagem("Cadastro realizado com sucesso! Redirecionando para o login...");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                const errorData = await response.json();
                setErro(errorData.mensagem || "Erro ao realizar cadastro.");
            }
        } catch (err) {
            setErro("Erro de conexão com o servidor.");
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
            <h2>Cadastro</h2>
            {mensagem && <p style={{ color: "green" }}>{mensagem}</p>}
            {erro && <p style={{ color: "red" }}>{erro}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "15px" }}>
                    <label>Nome:</label>
                    <br />
                    <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>Email:</label>
                    <br />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>Senha:</label>
                    <br />
                    <input
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </div>

                <div style={{ marginBottom: "15px" }}>
                    <label>Confirmar Senha:</label>
                    <br />
                    <input
                        type="password"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        required
                        style={{ width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </div>

                <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
                    Cadastrar
                </button>
            </form>
        </div>
    );
}

export default Cadastrar