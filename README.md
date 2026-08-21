# Traduzir PDF — Sistema Completo com Autenticação e Pagamento PIX

Aplicação web desenvolvida para tradução de arquivos PDF, contendo sistema completo de autenticação de usuários (JWT), painel administrativo/usuário e integração de pagamentos via PIX (Mercado Pago).

---

## 🚀 Funcionalidades

- **Autenticação de Usuários:** Cadastro, login com criptografia de senha (`bcrypt`) e controle de sessões via JWT (JSON Web Token) e Context API.
- **Tradução de PDF:** Envio de arquivos PDF protegidos por token de autenticação para tradução e download do arquivo traduzido.
- **Painel do Usuário (`Campousu`):** Exibição de dados da conta e acesso rápido aos serviços.
- **Pagamento via PIX:** Integração com o Mercado Pago (Checkout Transparente) gerando QR Code em base64, código "Copia e Cola" e verificação automática de status de pagamento por *polling*.
- **Rotas Protegidas:** Gerenciamento de rotas no frontend (`react-router-dom`) com restrição para usuários autenticados e administradores.

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- React.js
- React Router DOM
- Context API (`AuthContext`)

### **Backend**
- Node.js & Express
- MySQL (`mysql2`)
- JSON Web Token (`jsonwebtoken`)
- Bcrypt (`bcrypt`)
- Mercado Pago SDK (`mercadopago`)
- UUID (`uuid`)

---

## ⚙️ Como Executar o Projeto

### 1. Configurar o Banco de Dados (MySQL)
Crie um banco de dados e as tabelas necessárias (`usuarios`, `admin`, `pagamentos`).

### 2. Configurar o Backend
1. Acesse a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz do backend com as variáveis de ambiente:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_NAME=seu_banco
   JWT_SECRET=sua_chave_secreta_jwt
   MP_ACCESS_TOKEN=seu_access_token_do_mercado_pago
   ```
4. Inicie o servidor:
   ```bash
   node serve.js
   ```

### 3. Configurar o Frontend
1. Acesse a pasta do frontend:
   ```bash
   cd frontend/traduzir_pdf
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie a aplicação React:
   ```bash
   npm start
   ```

---

## 📅 Próximos Passos
- Implementação de Login / Cadastro com Google (Gmail).
