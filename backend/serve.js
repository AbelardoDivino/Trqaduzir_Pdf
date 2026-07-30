// validar dados de login
// arrumar api do mercado pago 
require('dotenv').config()
const mysql = require('mysql2')
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const app = express()
app.use(express.json());
app.use(cors())
const JWT_SECRET = process.env.JWT_SECRET //add chave secreta


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

const traduzirRoute = require("./rotas_para_traduçao/traduzir")
app.use(vereficarteoken,traduzirRoute)

app.listen(PORT,()=>{
console.log("servidor rodando na porta",PORT)
})

app.get('/usuarios',vereficarteoken,(req,res)=>{
conectar.query(
 'select * from usuarios',
  (err,result)=>{
    if (err) {
        return res.status(500).json(err)
    }
    res.json(result)
  }
);
})

app.get('/usuarios/:id',vereficarteoken,(req,res)=>{
    const {id} = req.params;
conectar.query(
'select * from usuarios where id = ?',
[id],
(err,result)=>{
    if (err) {
        return res.status(500).json(err)
    }
    res.json(result)
}
);
})

app.get('/admin',vereficarteoken,(req,res)=>{
    conectar.query(
        'select * from admin',
        (err,result)=>{
            if (err) {
                return res.status(500).json(err)
            }
            res.json(result)
        }
    );
})

app.get('/admin/:id',vereficarteoken,(req,res)=>{
    const {id} = req.params
    conectar.query(
        'select * from admin where id = ?',
        [id],
        (err,result)=>{
            if (err) {
                return res.status(500).json(err)
            }
            res.json(result)
        }
    );
})

app.post('/usuarios/cadastro',async (req,res)=>{

const {nome,senha,email} = req.body;

try{
    // criptografar senha  antes de entrar no banco
    const senhaHash = await bcrypt.hash(senha,10)
    conectar.query(
'insert into usuarios (nome,senha,email) values (?,?,?)',
[nome,senhaHash,email],
(err,result)=>{
    if (err) {
        return res.status(500).json({
            erro:err.message
        })
    }
    res.status(201).json({
        mensagem:"cadastro realizado com sucesso",
        id:result.insertId
    })
  }
);
} catch (err){
    res.status(500).json({
        erro:err.message
    })
}
})

function vereficarteoken(req,res,next){
    const autheader = req.headers['authorization']
    if (!autheader) {
        return res.status(401).json({erro:"Token não fornecido"})
    }
    const token = autheader.split(' ')[1]
    try{
        const decoded = jwt.verify(token,JWT_SECRET)
        req.usuario = decoded
        next()
    }
    catch{
        return res.status(401).json({erro:"token invalido ou expirado"})
    }
}

app.post('/usuarios/login',(req,res)=>{
    const {email,senha} = req.body;

    conectar.query(
        'select * from usuarios where email = ?',
        [email],
        async (err,result) =>{
            if (err) {
    return res.status(500).json({erro:err.message
});
            }
            if (result.length === 0) {
return res.status(401).json({mensagem:"usuario nao encontrado"})
            }
            const usuario = result[0]
            const senhacorreta = await bcrypt.compare(
                senha,
                usuario.senha
            );
            if (!senhacorreta) {
                return res.status(401).json({mensagem:"senha incorreta"})
            }
            const token = jwt.sign(
           {
            id:usuario.id,
            nome:usuario.nome,
            email:usuario.email,
            tipo:"usuario"
           },
           JWT_SECRET,
           {
            expiresIn:"30m"
           }
            );
            res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } })
        }
    );
})


app.post('/admin/cadastro',async (req,res)=>{
    const {nome,senha} = req.body;

try {
     // criptografar a senha
     const senhaHash = await bcrypt.hash(senha,10)
    conectar.query(
        'insert into admin(nome,senha) values(?,?)',
        [nome,senhaHash],
        (err,result)=>{
            if (err) {
                return res.status(500).json({
                    erro:err.message
                })
            }
            res.status(201).json({
                mensagem:"Administrator cadastrado com sucesso",
                id:result.insertId
            })
        }
    );
} catch (err){
    res.status(500).json({
        erro:err.message
    })
}
})

app.post('/admin/login',(req,res)=>{
    const {senha,email} = req.body;
    conectar.query(
        'select * from admin where email = ?',
        [email],
       async (err,result)=>{
            if (err) {
                return res.status(500).json({erro:err.message})
            }
            if (result.length === 0) {
                return res.status(401).json({mensagem:"admin nao encontrado"})
            }
            const admin = result[0]
             const senhacorreta = await bcrypt.compare(
                senha,
                admin.senha
            );
             if (!senhacorreta) {
                return res.status(401).json({mensagem:"senha incorreta"})
            }
            const token = jwt.sign(
                {id:admin.id,nome:admin.nome,email:admin.email,tipo:"admin"},
                JWT_SECRET,
                {expiresIn:"30m"}
            )
            res.json({ token, usuario: { id: admin.id, nome: admin.nome, email: admin.email, tipo: 'admin' } })

        }
    );
})

app.put('/usuarios/:id',vereficarteoken, async (req,res)=>{
    const {id} = req.params;
    const {nome,senha,email} = req.body;

    try{
        const senhaHash = await bcrypt.hash(senha,10)

            conectar.query(
        'update usuarios set nome = ? , senha =  ?, email = ? where id = ?',
        [nome,senhaHash,email,id],
        (err,result)=>{
            if (err) {
                return res.status(500).json({erro:err.message})
            }
            res.json({mensagem:"usuario atualizado"})
        }
    );
    }catch(err){
        return res.status(500).json({erro:err.message})
    }

})

app.put('/admin/:id',vereficarteoken, async(req,res)=>{
const {id} = req.params;
const {nome,senha} = req.body;

try{
    const senhaHash = await bcrypt.hash(senha,10)
conectar.query(
    'update admin set nome = ?, senha =? where id = ?',
    [nome,senhaHash,id],
    (err,result)=>{
        if (err) {
            return res.status(500).json({erro:err.message
})
        }
        res.json({mensagem:"administrador cadastrado"})
    }
);
}catch(err){
return res.status(500).json({erro:err.message})
}



})

app.delete('/usuarios/deletar/:id',vereficarteoken,(req,res)=>{
    const  {id} = req.params;
    conectar.query(
        'delete  from usuarios where id = ?',
        [id],
        (err,result)=>{
            if (err) {
                return res.status(500).json({erro:err.message})
            }
            res.json({mensagem:"usuario deletado"})
        }
    );
})


app.delete('/admin/deletar/:id',vereficarteoken,(req,res)=>{

    const {id} = req.params;
    conectar.query(
        'delete  from admin where id = ?',
        [id],
        (err,result)=>{
            if (err) {
                return res.status(500).json({erro:err.message})
            }
            res.json({mensagem:"admin deletado com sucesso"})
        }
    );

})


// A estrutura do seu código já está bem melhor do que no início. Agora o foco é prestar atenção aos nomes das variáveis. A maioria dos erros restantes não é de lógica, mas de digitação (result, resultado, res, reseult).

// Quando corrigir esses nomes e criptografar as senhas com bcrypt.hash() no cadastro, o login estará