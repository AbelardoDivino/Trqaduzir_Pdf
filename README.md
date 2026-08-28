![Status](https://img.shields.io/badge/status-online-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=white)
![Node](https://img.shields.io/badge/node.js-express%205-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/mongodb-atlas-47A248?logo=mongodb&logoColor=white)
![PIX](https://img.shields.io/badge/pagamento-PIX%20%2F%20Mercado%20Pago-00B2A9)
[![Acessar app](https://img.shields.io/badge/acessar%20app-trqaduzir--livros.vercel.app-orange?logo=vercel&logoColor=white)](https://trqaduzir-livros.vercel.app/)

# Traduzir PDF — Inglês → Português com PIX e Créditos

> ✅ **Projeto concluído e em produção** — [**acesse aqui: trqaduzir-livros.vercel.app**](https://trqaduzir-livros.vercel.app/)

 [trqaduzir-livros.vercel.app](https://trqaduzir-livros.vercel.app/) 

Plataforma web que traduz PDFs do inglês para o português, com autenticação (JWT + Google), progresso de tradução em tempo real e um modelo freemium: uso gratuito limitado por dia, com créditos comprados via PIX (Mercado Pago) para volumes maiores.

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Como funciona](#como-funciona)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Rotas da API](#rotas-da-api)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Como rodar localmente](#como-rodar-localmente)
- [Deploy](#deploy)
- [Teste do PIX](#teste-do-pix)
- [Notas técnicas e melhorias futuras](#notas-técnicas-e-melhorias-futuras)
- [Licença](#licença)

## Sobre o projeto

Artigo científico, contrato, manual ou material de estudo em inglês: em vez de copiar e colar trechos em um tradutor, o usuário envia o PDF inteiro e recebe de volta um novo arquivo já traduzido, mantendo o texto em parágrafos legíveis. O plano gratuito cobre uso ocasional (10 páginas por arquivo, 3 traduções por dia); acima disso, o próprio app oferece a compra de créditos via PIX sem sair da tela.

## Funcionalidades

- **Autenticação:** cadastro/login com `bcrypt` + JWT (expira em 30 min), Google Login (`@react-oauth/google` + `google-auth-library`), validação de e-mail e senha com **mínimo de 8 caracteres**, campo com olho para ver a senha e loading spinner
- **Tradução:** `pdftotext` extrai o texto, `google-translate-api-x` traduz em chunks de até 500 caracteres (com retry automático) e `pdfkit` remonta o PDF traduzido
- **Progresso em tempo real:** `POST /traduzir-progress` usa Server-Sent Events (SSE) para atualizar a barra de 0 a 100% no front conforme cada chunk é traduzido
- **Limite gratuito:** 10 páginas por arquivo e 3 traduções por dia; ao exceder, a tela de pagamento PIX aparece inline. Arquivos com mais de 10 páginas sempre consomem `ceil(páginas / 10)` créditos, independentemente do limite diário
- **Créditos via PIX:** `POST /criar-pix` (R$1 = 1 crédito, opções de 5/10/20), QR code em base64 + copia e cola, confirmação automática por consulta (`GET /consultar-pagamento/:id`) ou webhook (`POST /webhook/mercadopago`), crédito aplicado de forma idempotente
- **Painel do usuário:** `GET /usuario/creditos` (sem cache) mostra saldo de créditos e uso diário
- **Design:** tema editorial claro, tipografia Inter, cards com borda, navbar sticky, hero minimalista

## Como funciona

1. Usuário se cadastra (e-mail/senha ou Google) e recebe um token JWT
2. Envia um PDF na tela de tradução
3. O front acompanha o progresso em tempo real via SSE (`/traduzir-progress`) enquanto o back extrai, traduz em chunks e remonta o PDF
4. O PDF traduzido é baixado automaticamente ao final
5. Se o arquivo tem mais de 10 páginas, ou é a 4ª tradução do dia, a API responde `402`/`429` e o front mostra a tela de compra de créditos via PIX
6. Assim que o Mercado Pago aprova o pagamento (via consulta ou webhook), os créditos são somados à conta do usuário automaticamente

## Tecnologias

| | |
|---|---|
| **Front** | React 19, React Router 7, Context API, `@react-oauth/google` |
| **Back** | Node + Express 5, Mongoose 9 (Atlas), `jsonwebtoken`, `bcrypt`, `mercadopago` 3, `google-translate-api-x`, `pdfkit`, `multer` |
| **Infra** | Vercel (front), Render (back), MongoDB Atlas |

## Estrutura do projeto

```
Trqaduzir_Pdf/
├── backend/
│   ├── config/mercadoPago.js            # SDK do Mercado Pago
│   ├── routes/pix.js                    # Rotas ativas de créditos, PIX e webhook
│   ├── rotas_para_tradução/traduzir.js  # Rotas de tradução (/traduzir, /traduzir-progress)
│   ├── rota_pagamento/pagamento.js      # Versão anterior das rotas de PIX — não usada, ver Notas
│   ├── serve.js                         # Entry point: models Mongoose, auth, rotas de usuário/admin
│   └── uploads/                         # PDFs temporários (apagados após cada tradução)
└── frontend/traduzir_pdf/src/
    ├── components/
    │   ├── home/                        # Home, Navbar, Header, Footer
    │   ├── Login.js / Cadastrar.js
    │   ├── Paginadospdf.js              # Tela de upload e tradução
    │   ├── Pagamentopix.js              # Tela de compra de créditos
    │   ├── Campousu.js                  # Painel do usuário (créditos/uso)
    │   └── Campoadmin.js                # Painel administrativo
    └── context/AuthContext.js           # Estado de autenticação (JWT)
```

## Rotas da API

### Autenticação

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/usuarios/cadastro` | — | Cria conta (nome, e-mail, senha ≥ 8 caracteres) |
| POST | `/usuarios/login` | — | Login por e-mail/senha, retorna JWT (30 min) |
| POST | `/usuarios/google` | — | Login/cadastro via Google OAuth |
| GET | `/usuarios/:id` | JWT | Busca um usuário pelo ID |
| GET | `/usuarios` | JWT | Lista todos os usuários (sem senha) |
| DELETE | `/usuarios/deletar/:id` | JWT | Remove um usuário |
| POST | `/admin/cadastro` | — | Cria uma conta de administrador |
| POST | `/admin/login` | — | Login de administrador |

### Tradução

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/traduzir-progress` | JWT* | Traduz o PDF com progresso em tempo real (SSE); retorna o PDF em base64 ao final |
| POST | `/traduzir` | JWT* | Traduz o PDF e devolve o arquivo direto via download, sem barra de progresso |

\* A checagem de limite (10 páginas/arquivo, 3 traduções/dia) só roda quando um JWT válido é enviado — ver [Notas técnicas](#notas-técnicas-e-melhorias-futuras).

### Créditos e pagamento (PIX / Mercado Pago)

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/criar-pix` | JWT | Gera cobrança PIX (`valor` em R$ = créditos); retorna QR code + copia e cola |
| GET | `/consultar-pagamento/:id` | — | Consulta status de um pagamento; credita automaticamente se aprovado |
| POST | `/webhook/mercadopago` | — | Webhook do Mercado Pago; credita pagamentos aprovados |
| GET | `/usuario/creditos` | JWT | Saldo de créditos e uso diário do usuário logado |

## Variáveis de ambiente

Nenhum segredo está hardcoded — tudo via `process.env`. Arquivos `.env` estão no `.gitignore`; o repo traz apenas `*.env.example` com placeholders.

### Backend `backend/.env` (obrigatórias, sem fallback)

| Variável | Para que serve | Onde obter | Exemplo |
|---|---|---|---|
| `PORT` | Porta do Express (Render injeta automaticamente) | Qualquer porta livre | `3000` |
| `MONGO_URI` | Conexão Mongoose Atlas | Atlas → Database → Connect → Drivers → Connection String | `mongodb+srv://usuario:senha@cluster0.xxx.mongodb.net/traduzirpdf?retryWrites=true&w=majority` |
| `JWT_SECRET` | Assina/verifica JWT | Gere: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | `a1b2c3...64 hex` |
| `GOOGLE_CLIENT_ID` | Valida `idToken` do Google | Google Cloud → APIs e Serviços → Credenciais → ID do cliente OAuth 2.0 | `22878989052-xxx.apps.googleusercontent.com` |
| `MP_ACCESS_TOKEN` | Cria/consulta PIX no MP | Mercado Pago Developers → Suas integrações → Credenciais → Access Token (produção `APP_USR-...` ou teste `TEST-...`) | `APP_USR-4179...` |

> **Importante:** no Atlas, libere **Network Access → Add IP Address → Allow Access from Anywhere `0.0.0.0/0`**, senão o Render retorna 500. No Google Cloud, adicione em **Origens JS** `http://localhost:3000`, `http://127.0.0.1:3000` e `https://seu-front.vercel.app`. No Mercado Pago, ative uma **Chave PIX** em `mercadopago.com.br → Pix → Minhas chaves`, senão a API retorna `Collector without key enabled`.

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

## Como rodar localmente

**Pré-requisitos:**

- Node.js 18+
- **`poppler-utils`** instalado no sistema — fornece os binários `pdftotext` e `pdfinfo`, usados diretamente pelo backend. Sem isso, a tradução falha mesmo com `npm install` completo.
  - Ubuntu/Debian: `sudo apt install poppler-utils`
  - macOS: `brew install poppler`
- Conta no MongoDB Atlas, Google Cloud (OAuth) e Mercado Pago — ver [Variáveis de ambiente](#variáveis-de-ambiente)

```bash
cd backend && npm install && npm start                  # http://localhost:3000
cd frontend/traduzir_pdf && npm install && npm start     # http://localhost:3001
```

## Deploy

- **Render (Back):** Root `backend`, Build `npm install`, Start `npm start`, envs da seção acima
- **Vercel (Front):** Root `frontend/traduzir_pdf`, Build `npm run build`, envs `REACT_APP_*` acima
- **Webhook MP:** `https://seu-backend.onrender.com/webhook/mercadopago`

## Teste do PIX

Em produção com `APP_USR-` cobra de verdade. Para testar sem custo, use credenciais de **teste** (`TEST-...`) e um usuário de teste do Mercado Pago Developers.

## Notas técnicas e melhorias futuras

- A checagem de limite gratuito só roda quando a requisição traz um JWT válido (`getAuthUser` retorna `null` silenciosamente se o token faltar ou for inválido, e `checkLimite` é pulado nesse caso). Se o objetivo é impedir uso anônimo ilimitado, vale exigir token nas rotas de tradução.
- `GET /usuarios` retorna a lista completa de usuários para qualquer usuário autenticado, não só admin — o projeto já tem um middleware `vereficarAdmin` pronto que pode ser aplicado aqui.
- `rota_pagamento/pagamento.js` é uma versão anterior da lógica de PIX (sem vínculo com usuário/créditos) e não está mais em uso — as rotas ativas são as de `routes/pix.js`. Pode ser removida para simplificar o repositório.
- `docker-compose.yml` ainda referencia variáveis de um setup antigo com MySQL (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`); o projeto atual usa MongoDB via `MONGO_URI`. O `Dockerfile` do backend também não instala `poppler-utils`, então rodar via Docker hoje falha na etapa de tradução até isso ser ajustado.
- `package.json` do backend ainda lista dependências não usadas no código atual (`mysql2`, `pdf-lib`, `pdf-parse`, `pdfjs-dist`, `tesseract.js`, `@google-cloud/translate`) — provavelmente sobras de iterações anteriores do projeto.

## Licença

MIT
