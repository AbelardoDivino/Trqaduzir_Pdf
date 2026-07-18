import { useState } from "react"
import Login from "../Login"
import Cadastrar from "../Cadastrar"
import Footer from "./Footer"

function Navbar(){

return  <div>

<button onClick={Cadastrar}>Cadastrar</button>
<button onClick={Login}>Entrar</button>
<div>
    <Footer></Footer>

</div>
    </div>
}

export default Navbar