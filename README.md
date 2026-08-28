# Traduzir PDF — Inglês → Português com PIX e Créditos

> ✅ **Projeto concluído e em produção**

Demo: **Front** https://trqaduzir-livros.vercel.app · **API** https://trqaduzir-pdf.onrender.com

Plataforma para tradução de PDFs com auth JWT + Google, progresso 0–100% e pagamento por créditos via PIX (Mercado Pago).

## Funcionalidades entregues

- **Auth:** Cadastro/login `bcrypt` + JWT 30m, Google Login (`@react-oauth/google` + `google-auth-library`), validação `isEmailValido` e senha **mínimo 8 caracteres** com olho para ver senha e loading spinner
- **Tradução:** `pdftotext` + `google-translate-api-x` em chunks + `pdfkit` com **SSE `POST /traduzir-progress`** e barra 0–100% no front
- **Limite:** Gratuito **10 páginas por arquivo, 3 traduções/dia**; excedeu mostra tela de PIX inline. `>10p` custa `ceil(páginas/10)` créditos
- **Créditos/PIX:** `POST /criar-pix` (R$1=1 crédito, escolha 5/10/20), QR base64 + copia e cola, `GET /consultar-pagamento/:id` e `POST /webhook/mercadopago` creditam idempotente, `GET /usuario/creditos` (no-store) exibe saldo no Painel
- **Design:** Tema editorial claro, tipografia Inter, cards com borda, navbar sticky, hero minimalista

## Tecnologias

**Front:** React 19, React Router 7, Context API, `@react-oauth/google`
**Back:** Node + Express 5, Mongoose 9 (Atlas), `jsonwebtoken`, `bcrypt`, `mercadopago` 3, `google-translate-api-x`, `pdfkit`, `multer`

## Variáveis de ambiente — explicação detalhada

Nenhum segredo está hardcoded — tudo via `process.env`. Arquivos `.env` estão no `.gitignore`; o repo traz apenas `*.env.example` com placeholders.

### Backend `backend/.env` (obrigatórias, sem fallback)

| Variável | Para que serve | Onde obter | Exemplo |
|---|---|---|---|
| `PORT` | Porta do Express (Render injeta automaticamente) | Qualquer porta livre | `3000` |
| `MONGO_URI` | Conexão Mongoose Atlas | Atlas > Database > Connect > Drivers > Connection String | `mongodb+srv://usuario:senha@cluster0.xxx.mongodb.net/traduzirpdf?retryWrites=true&w=majority` |
| `JWT_SECRET` | Assina/verifica JWT | Gere: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | `a1b2c3...64 hex` |
| `GOOGLE_CLIENT_ID` | Valida `idToken` do Google | Google Cloud > APIs e Serviços > Credenciais > ID do cliente OAuth 2.0 | `22878989052-xxx.apps.googleusercontent.com` |
| `MP_ACCESS_TOKEN` | Cria/consulta PIX no MP | Mercado Pago Developers > Suas integrações > Credenciais > Access Token (produção `APP_USR-...` ou teste `TEST-...`) | `APP_USR-4179...` |

> **Importante:** No Atlas libere **Network Access > Add IP Address > Allow Access from Anywhere `0.0.0.0/0`** senão o Render retorna 500. No Google Cloud adicione em **Origens JS** `http://localhost:3000`, `http://127.0.0.1:3000` e `https://seu-front.vercel.app`. No MP ative uma **Chave PIX** em `mercadopago.com.br > Pix > Minhas chaves` senão retorna `Collector without key enabled`.

Crie o arquivo:
```bash
cp backend/.env.example backend/.env
# edite com seus valores reais
```

### Frontend `frontend/traduzir_pdf/.env` (obrigatórias, build-time)

| Variável | Para que serve | Exemplo |
|---|---|---|
| `REACT_APP_API_URL` | URL da API sem barra final | `http://localhost:3000` (local) ou `https://trqaduzir-pdf.onrender.com` (prod) |
| `REACT_APP_GOOGLE_CLIENT_ID` | Mesmo ID do backend para `GoogleOAuthProvider` | `22878989052-xxx.apps.googleusercontent.com` |

```bash
cp frontend/.env.example frontend/.env
```

## Executar local

```bash
cd backend && npm install && npm start # http://localhost:3000
cd frontend/traduzir_pdf && npm install && npm start # http://localhost:3001
```

## Deploy

- **Render (Back):** Root `backend`, Build `npm install`, Start `npm start`, envs acima
- **Vercel (Front):** Root `frontend/traduzir_pdf`, Build `npm run build`, envs `REACT_APP_*` acima
- **Webhook MP:** `https://seu-backend.onrender.com/webhook/mercadopago`

## Rotas

`POST /usuarios/cadastro` `POST /usuarios/login` `POST /usuarios/google` `GET /usuario/creditos` `POST /traduzir` `POST /traduzir-progress` `POST /criar-pix` `GET /consultar-pagamento/:id` `POST /webhook/mercadopago`

## Teste PIX

Em produção com `APP_USR-` cobra de verdade. Para testar sem custo use credenciais de **teste** (`TEST-...`) e um usuário de teste do MP Developers.

## Licença

MIT
