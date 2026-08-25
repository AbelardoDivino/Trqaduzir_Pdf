require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client("22878989052-r2d4br0ntugjf63makag0finmfach8g5.apps.googleusercontent.com");
const JWT_SECRET = process.env.JWT_SECRET || 'F$M7yXc*GFYX%e8';

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://aaaaaaaaaaasafafe_db_user:VriJ4bwVoKj385cZ@cluster0.fylkysy.mongodb.net/traduzirpdf?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Conectado ao MongoDB Atlas com sucesso!"))
  .catch((err) => console.log("Erro ao conectar ao MongoDB:", err));

app.get('/', (req, res) => {
  res.json({ status: "API do Traduzir PDF online", dbState: mongoose.connection.readyState });
});

function isEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

// Schemas do Mongoose
const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  senha: { type: String, default: "" },
  creditos: { type: Number, default: 3 },
  usoDiario: {
    data: { type: String, default: "" },
    traducoes: { type: Number, default: 0 },
    paginas: { type: Number, default: 0 }
  }
}, { timestamps: true });

const Usuario = mongoose.model('Usuario', UsuarioSchema);

const AdminSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, default: "" },
  senha: { type: String, required: true }
}, { timestamps: true });

const Admin = mongoose.model('Admin', AdminSchema);

// Rotas do Mercado Pago (PIX) e Tradução
const pixRoutes = require("./routes/pix");
app.use(pixRoutes);

const traduzirRoute = require("./rotas_para_traduçao/traduzir");
app.use(traduzirRoute);

// Middleware de verificação de token JWT
function vereficarteoken(req, res, next) {
  const autheader = req.headers['authorization'];
  if (!autheader) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }
  const token = autheader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch {
    return res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}

function vereficarAdmin(req, res, next) {
  if (req.usuario.tipo !== 'admin') {
    return res.status(403).json({ mensagem: "Acesso negado" });
  }
  next();
}

// Rotas da API
app.get('/usuarios', vereficarteoken, async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, '-senha');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get('/usuarios/:id', vereficarteoken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id, '-senha');
    if (!usuario) return res.status(404).json({ mensagem: "Usuário não encontrado" });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post('/usuarios/cadastro', async (req, res) => {
  let { nome, senha, email } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: "Preencha todos os campos" });
  }
  email = String(email).toLowerCase().trim();
  if (!isEmailValido(email)) {
    return res.status(400).json({ mensagem: "E-mail inválido" });
  }
  if (senha.length < 6) {
    return res.status(400).json({ mensagem: "Senha deve ter no mínimo 6 caracteres" });
  }

  try {
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ mensagem: "E-mail já cadastrado" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const novoUsuario = await Usuario.create({ nome, email, senha: senhaHash });

    res.status(201).json({
      mensagem: "Cadastro realizado com sucesso",
      id: novoUsuario._id
    });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    res.status(500).json({ erro: err.message });
  }
});

app.post('/usuarios/login', async (req, res) => {
  let { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ mensagem: "Informe e-mail e senha" });
  }
  email = String(email).toLowerCase().trim();

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ mensagem: "Usuário não encontrado" });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: usuario._id, nome: usuario.nome, email: usuario.email, tipo: "usuario" },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.json({
      token,
      usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email }
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post('/usuarios/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "22878989052-r2d4br0ntugjf63makag0finmfach8g5.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let usuario = await Usuario.findOne({ email });
    if (!usuario) {
      usuario = await Usuario.create({ nome: name, email, senha: "" });
    }

    const appToken = jwt.sign(
      { id: usuario._id, nome: usuario.nome, email: usuario.email, tipo: "usuario" },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.json({
      token: appToken,
      usuario: { id: usuario._id, nome: usuario.nome, email: usuario.email }
    });
  } catch (error) {
    res.status(401).json({ erro: "Token do Google inválido", detalhe: error.message });
  }
});

app.post('/admin/cadastro', async (req, res) => {
  const { nome, senha, email } = req.body;
  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const novoAdmin = await Admin.create({ nome, email: email || "", senha: senhaHash });
    res.status(201).json({
      mensagem: "Administrador cadastrado com sucesso",
      id: novoAdmin._id
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post('/admin/login', async (req, res) => {
  const { nome, senha } = req.body;
  if (!nome || !senha) {
    return res.status(400).json({ mensagem: "Informe nome e senha" });
  }

  try {
    const admin = await Admin.findOne({ nome });
    if (!admin) {
      return res.status(401).json({ mensagem: "Admin não encontrado" });
    }

    const senhaCorreta = await bcrypt.compare(senha, admin.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: "Senha incorreta" });
    }

    const token = jwt.sign(
      { id: admin._id, nome: admin.nome, tipo: "admin" },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.json({
      token,
      usuario: { id: admin._id, nome: admin.nome, tipo: "admin" }
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.delete('/usuarios/deletar/:id', vereficarteoken, async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    res.json({ mensagem: "Usuário deletado" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
