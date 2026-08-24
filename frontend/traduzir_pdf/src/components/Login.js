import { useState } from "react"
import { useContext } from "react"
import {useNavigate} from "react-router-dom"
import {AuthContext} from "../context/AuthContext"
import { GoogleLogin } from "@react-oauth/google"

const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:3000").replace(/\/+$/, "");

function Login(){

    const [email,setEmail] = useState("")
    const [senha,setSenha] = useState("")
    const [erro,setErro] = useState("")

    const {login}  = useContext(AuthContext)
    const navigate = useNavigate()

    const handleSubmit = async (e) =>{
        e.preventDefault()
        setErro("")

        try{
            const response = await fetch(`${API_URL}/usuarios/login`,{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({email,senha}),
            });
            if (response.ok) {
                // Extrai token e usuario retornados pelo backend (status 200)
                const data = await response.json()

                login(data.token,data.usuario)
                navigate("/"); // redireciona para a home ou painel apos logar
            }
            else{
                const errorData = await response.json()
                setErro(errorData.mensagem || "Erro ao fazer o login. Verifique suas credenciais")
             }
        }catch(err){
            setErro("Erro de conexao com o servidor ")
        }
    }

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch(`${API_URL}/usuarios/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential })
            });
            const data = await res.json();
            if (res.ok) {
                login(data.token, data.usuario);
                navigate("/");
            } else {
                alert(data.erro || "Erro no login com google");
            }
        } catch (err) {
            alert("Erro de conexão com o servidor");
        }
    };

    return <div style={{padding:"20px", maxWidth:"400px", margin:" 0 auto "}}>  

    <h2>Login</h2>
    {erro && <p style={{color:"red"}}> {erro} </p>}

    <form onSubmit={handleSubmit}>
        <div style={{marginBottom:"15px"}}>
            <label>Email:</label>
            <br></br>
            <input type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{width:"100%",padding:"8px",marginTop:"5px"}}
            >
            </input>
        </div>

    <div style={{marginBottom:"15px"}}>
        <label>Senha:</label>
        <br></br>

    <input type="password"
    value={senha}
    onChange={(e) => setSenha(e.target.value)}
    required
    style={{width:"100%",padding:"8px",marginTop:"5px"}}
    >
    </input>
    </div>

    <div style={{marginTop:"20px", marginBottom:"15px"}}>
        <GoogleLogin
     onSuccess={handleGoogleSuccess}
            onError={() => alert("Falha ao fazer login com o Google")}
        />
    </div>


    <button
    type="submit"
    style={{padding:"10px 20px", cursor:"pointer"}}
    >Entrar</button>
        </form>
    
 
    </div>

}

export default Login