import {Children, createContext, useEffect,useState } from "react"

// criaçao do contexto
export const AuthContext = createContext();

export const AuthProvider = ({Children}) =>{
    const [token,setToken] = useState(null);
    const [usuario,setUsuario] = useState(null);


    // no carregamento  inicial (useEffect), le o localstorage e restaura a sessao

 
     useEffect(()=> {
        const savedTokjen = localStorage.getItem("token");
        const savedUsuario = localStorage.getItem("usuario");

        if (savedTokjen) {
            setToken(savedTokjen)
        }
        if (savedUsuario) {
            try{
                setUsuario(JSON.parse(savedUsuario));
            }
            catch (e){
                setUsuario(savedUsuario);
            }   
        }
     },[]);


     // funçao logout: limpa o estado do localstoroge

     const logout = () =>{
        setToken(null);
        setUsuario(null);
        localStorage.removeItem("token");
        localStorage.removeItem("usuario")
     };

     return(
        <AuthContext.Provider value={{token,usuario,login,logout}}>
            {children}
        </AuthContext.Provider>
     );
};

export default AuthContext;