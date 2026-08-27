# Traduzir PDF — Tradução Inglês → Português com PIX e Créditos

Plataforma para tradução de PDFs com autenticação JWT + Google, limite gratuito e pagamento por créditos via PIX (Mercado Pago).

## Funcionalidades

- **Auth:** Cadastro/login com `bcrypt` + JWT, Login com Google (`@react-oauth/google` + `google-auth-library`), validação de e-mail e senha mínimo 8 caracteres
- **Tradução:** Upload de PDF, extração via `pdftotext`, tradução em chunks `google-translate-api-x` e geração `pdfkit` com progresso **0–100% SSE** (`POST /traduzir-progress`)
- **Limite gratuito:** Até **10 páginas por arquivo, 3 traduções por dia**. Após isso cada tradução consome **1 crédito**
- **Créditos/PIX:** `POST /criar-pix` (R$1=1 crédito), QR base64 + copia e cola, `GET /consultar-pagamento/:id` e `POST /webhook/mercadopago` creditam automaticamente, `GET /usuario/creditos` mostra saldo
- **Painel:** Saldo de créditos e uso diário, botão Traduzir e compra de créditos integrada
- **Design:** Tema editorial profissional (claro, tipografia Inter, cards com borda, barra fina escura), olho para ver senha e loading spinner

## Tecnologias

**Front:** React 19, React Router 7, Context API, `@react-oauth/google`
**Back:** Node + Express 5, Mongoose 9 (MongoDB Atlas), `jsonwebtoken`, `bcrypt`, `mercadopago` 3, `google-translate-api-x`, `pdfkit`, `multer`

## Executar local

### Backend
```bash
cd backend
npm install
```
Crie `backend/.env`:
```
PORT=3000
MONGO_URI=mongodb+srv://USUARIO:SENHA@cluster0.mongodb.net/traduzirpdf?retryWrites=true&w=majority
JWT_SECRET=sua_chave_32_chars
GOOGLE_CLIENT_ID=seu_id.apps.googleusercontent.com
MP_ACCESS_TOKEN=APP_USR-seu_token
```
```bash
npm start # http://localhost:3000
```

### Frontend
```bash
cd frontend/traduzir_pdf
npm install
```
Crie `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_GOOGLE_CLIENT_ID=seu_id.apps.googleusercontent.com
```
```bash
npm start # http://localhost:3001
```

## Deploy

- **Backend Render:** Root `backend`, Build `npm install`, Start `npm start`, envs `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `MP_ACCESS_TOKEN`
- **Frontend Vercel:** Root `frontend/traduzir_pdf`, Build `npm run build`, envs `REACT_APP_API_URL=https://seu-backend.onrender.com` e `REACT_APP_GOOGLE_CLIENT_ID`
- **Google Cloud:** Origens JS `http://localhost:3000`, `http://127.0.0.1:3000`, `https://seu-front.vercel.app`
- **Mercado Pago:** Webhook `https://seu-backend.onrender.com/webhook/mercadopago`

## Rotas principais

`POST /usuarios/cadastro` `POST /usuarios/login` `POST /usuarios/google` `GET /usuario/creditos` `POST /traduzir` `POST /traduzir-progress` `POST /criar-pix` `GET /consultar-pagamento/:id` `POST /webhook/mercadopago`

## Variáveis expostas

Nenhum segredo hardcoded no código — tudo via `process.env`. `.env` está no `.gitignore`, commitar apenas `*.env.example`.
