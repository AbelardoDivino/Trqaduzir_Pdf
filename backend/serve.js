require('dotenv').config()
const mysql = require('mysql2')
const expres = require('express')
const cors = require('cors')
const app = expres()
app.use(cors())


const conectar = mysql.createConnection({
host:process.env.DB_HOST,
user:process.env.DB_USER,
password:process.env.DB_PASSWORD,
database:process.env.DB_NAME
})

conectar.connect((err)=>{
    if (err) {
        console.log("erro ao conectar",err)
    }
    console.log("conectado")
})

const PORT = process.env.PORT 

app.listen(PORT,()=>{
console.log("servidor rodando na porta",PORT)
})

app.get('/',(req,res)=>{

})

app.get('/',(req,res)=>{

})

app.post('',(req,res)=>{

})

app.put('',(req,res)=>{

})


app.delete('',()=>{
    
})
