// validar dados de login
require('dotenv').config()
const mysql = require('mysql2')
const expres = require('express')
const cors = require('cors')
const bcrypt = require('bcrypt')
const app = expres()
app.use(expres.json());
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

const traduzirRoute = require("./rotas_para_traduçao/traduzir")
app.use(traduzirRoute)

app.listen(PORT,()=>{
console.log("servidor rodando na porta",PORT)
})

app.get('/usuarios',(req,res)=>{
conectar.query(
 'select * from usuarios',
  (err,res)=>{
    if (err) {
        return res.status(500).json(err)
    }
    res.json(res)
  }
);
})

app.get('/usuarios/id',(req,res)=>{
conectar.query(
'select * from usuarios where id = ?',
[id],
(err,res)=>{
    if (err) {
        return res.status(500).json(err)
    }
    res.json(res)
}
);
})

app.get('/admin',(req,res)=>{
    conectar.query(
        'select * from admin',
        (err,res)=>{
            if (err) {
                return res.status(500).json(err)
            }
            res.json(res)
        }
    );
})

app.get('/admin/id',(req,res)=>{
    conectar.query(
        'select * from admin where id = ?',
        [id],
        (err,res)=>{
            if (err) {
                return res.status(500).json(err)
            }
            res.json(res)
        }
    );
})

app.post('/usuarios/cadastro',(req,res)=>{

const {nome,senha,email} = req.body;
    conectar.query(
'insert into usuarios (nome,senha,email) values (?,?,?)',
[nome,senha,email],
(err,res)=>{
    if (err) {
        return res.status(500).json({
            erro:err.message
        })
    }
    res.status(201).json({
        mensagem:"cadastro realizado com sucesso",
        id:res.insertId
    })
}
);
})

app.post('/usuarios/login',(req,res)=>{
    const {email,senha} = req.body;

    conectar.query(
        'select * from usuarios where email = ?',
        [email],
        async (err,reseult) =>{
            if (err) {
    return reseult.status(500).json({erro:err.message});
            }
            if (result.length === 0) {
return result.status(401).json({mensagem:"usuario nao encontrado"})
            }
            const usuario = res[0]
            const senhacorreta = await bcrypt.compare(
                senha,
                usuario.senha
            );
            if (!senhacorreta) {
                return result.status(401).json({mensagem:"senha incorreta"})
            }
            result.json({mensagem:"login realizado com sucesso"})
        }
    );
})


app.post('/admin/cadastro',(req,res)=>{
    const {nome,senha} = req.body;

    conectar.query(
        'insert into admin(nome,senha) values(?,?)',
        [nome,senha],
        (err,res)=>{
            if (err) {
                return res.status(500).json({
                    erro:err.message
                })
            }
            res.status(201).json({
                mensagem:"Administrator cadastrado com sucesso",
                id:res.insertId
            })
        }
    );
})

app.post('/admin/login',(req,res)=>{
    const {senha,email} = req.body;
    conectar.query(
        'select * from admin where email = ?',
        [email],
       async (err,result)=>{
            if (err) {
                return reseult.status(500).json({erro:err.message})
            }
            if (result.length === 0) {
                return result.status(401).json({mensagem:"admin nao encontrado"})
            }
            const admin = res[0]
             const senhacorreta = await bcrypt.compare(
                senha,
                admin.senha
            );
             if (!senhacorreta) {
                return result.status(401).json({mensagem:"senha incorreta"})
            }
            result.json({mensagem:"login realizado com sucesso"})
        }
    );
})

app.put('/usuarios/:id',(req,res)=>{
    const {id} = req.params;
    const {nome,senha,email} = req.body;
    conectar.query(
        'update usuarios set nome = ? , senha =  ?, email = ?, where id = ?',
        (err,res)=>{
            if (err) {
                return res.status(500).json({erro:err.message})
            }
            res.json({mensagem:"usuario atualizado"})
        }
    );
})

app.put('/admin/:id',(req,res)=>{
const {id} = req.params;
const {nome,senha} = req.body;
conectar.query(
    'update admin set nome = ?, senha =? , where id = ?',
    (err,res)=>{
        if (err) {
            return res.status(500).json({erro:err.message})
        }
        res.json({mensagem:"administrador cadastrado"})
    }
);


})

app.delete('/usuarios/deletar/:id',(req,res)=>{
    const  {id} = req.params;
    conectar.query(
        'delete * from usuarios where id = ?',
        (err,res)=>{
            if (err) {
                return res.status(500).json({erro:err.mensage})
            }
            res.json({mensagem:"usuario deletado"})
        }
    );
})


app.delete('/admin/deletar/:id',(req,res)=>{

    const {id} = req.params;
    conectar.query(
        'delete * from admin where id = ?',
        (err,res)=>{
            if (err) {
                return res.status(500).json({erro:err.message})
            }
            res.json({mensagem:"admin deletado com sucesso"})
        }
    );

})


// A estrutura do seu código já está bem melhor do que no início. Agora o foco é prestar atenção aos nomes das variáveis. A maioria dos erros restantes não é de lógica, mas de digitação (result, resultado, res, reseult).

// Quando corrigir esses nomes e criptografar as senhas com bcrypt.hash() no cadastro, o login estará