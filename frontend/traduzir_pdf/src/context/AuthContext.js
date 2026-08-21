import { createContext, useEffect, useState } from "react"

// criaçao do contexto
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [usuario, setUsuario] = useState(null);

    // no carregamento inicial (useEffect), le o localstorage e restaura a sessao
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUsuario = localStorage.getItem("usuario");

        if (savedToken) {
            setToken(savedToken)
        }
        if (savedUsuario) {
            try {
                setUsuario(JSON.parse(savedUsuario));
            }
            catch (e) {
                setUsuario(savedUsuario);
            }   
        }
    }, []);

    // funcao login: salva no estado + localStorage
    const login = (newToken, novoUsuario) => {
        setToken(newToken);
        setUsuario(novoUsuario);
        localStorage.setItem("token", newToken);
        localStorage.setItem("usuario", JSON.stringify(novoUsuario));
    };

    // funçao logout: limpa o estado do localstoroge
    const logout = () => {
        setToken(null);
        setUsuario(null);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
    };

    return (
        <AuthContext.Provider value={{ token, usuario, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;