# Sistema de Patrimônio API

Backend API para o Sistema de Patrimônio usando **Fastify**, **Sequelize**, **PostgreSQL** e **TypeScript**.

Migração de SQLite (browser-based) para PostgreSQL (cloud database) com arquitetura relacional profissional.

---

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura-do-banco-de-dados)
- [Instalação](#-instalação)
- [Uso](#-uso)
- [API Endpoints](#-api-endpoints)
- [Autenticação](#-autenticação)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Tecnologias

### Backend
- **Fastify** - Framework web rápido e eficiente
- **Sequelize + TypeScript** - ORM com decorators TypeScript
- **PostgreSQL** - Banco de dados relacional
- **Zod** - Validação de schemas
- **JWT (jsonwebtoken)** - Autenticação com tokens
- **bcrypt** - Hash de senhas

### Estrutura
- TypeScript para type safety
- Migrations & Seeds com sequelize-cli
- Middleware de autenticação e validação
- Soft deletes com flag `ativo`
- Role-based access control (RBAC)

---

## 🏗️ Arquitetura do Banco de Dados

### Design Relacional (vs ENUMs)

Ao invés de usar ENUMs, implementamos **tabelas de referência** para maior flexibilidade:

```
┌─────────────┐      ┌──────────┐      ┌─────────┐
│   perfis    │◄─────│ usuarios │      │  bens   │
└─────────────┘      └──────────┘      └─────────┘
                           │                 ▲
                           │                 │
                           ▼                 │
┌─────────────┐      ┌──────────────┐       │
│   tipos_    │◄─────│movimentacoes │───────┘
│movimentacao │      └──────────────┘
└─────────────┘            │
                           │
┌─────────────┐            │
│ categorias  │◄───────────┘
└─────────────┘

┌─────────────┐
│localizacoes │◄───────(bens)
└─────────────┘
```

### Tabelas de Referência

1. **perfis** - Papéis de usuário (ADMIN, USER)
   - Armazena permissões em campo JSONB
   - Permite criar novos perfis dinamicamente

2. **categorias** - Categorias de bens
   - Móvel, Objeto Litúrgico, Eletrônico, etc.
   - Admins podem adicionar novas via API

3. **localizacoes** - Localizações físicas
   - Igreja Matriz, Igreja do P.O, etc.
   - Inclui endereço, responsável, telefone

4. **tipos_movimentacao** - Tipos de movimentação
   - Empréstimo, Devolução
   - Flag `requerDevolucao` indica se precisa retorno

### Tabelas Principais

5. **usuarios** - Usuários do sistema
   - Foreign key para `perfis`
   - Senha criptografada automaticamente (Sequelize hooks)
   - Soft delete com `ativo`

6. **bens** - Bens patrimoniais
   - Foreign keys para `categorias` e `localizacoes`
   - Tombo único
   - Suporta imagens em base64

7. **movimentacoes** - Empréstimos/Devoluções
   - Foreign keys para `bens`, `tipos_movimentacao`, `usuarios`
   - Campo `dataDevolucao` null = empréstimo ativo
   - Rastreia qual usuário registrou a movimentação

### Benefícios desta Arquitetura

✅ Admins podem adicionar categorias/localizações via UI (sem código)
✅ Melhor integridade de dados com foreign keys
✅ Fácil auditoria e relatórios
✅ Escalável para novos recursos
✅ Soft deletes preservam histórico

---

## 🔧 Instalação

### 1. Pré-requisitos

- Node.js 18+
- PostgreSQL 12+ (local ou cloud)
- Yarn ou npm

### 2. Configurar PostgreSQL

#### Opção A: PostgreSQL Local (macOS)
```bash
brew install postgresql
brew services start postgresql
createdb patrimonio_db
```

#### Opção B: PostgreSQL na Nuvem (Recomendado)

Escolha um provedor:

- **[Supabase](https://supabase.com)** - 500MB free, fácil setup
- **[Neon](https://neon.tech)** - Serverless PostgreSQL
- **[Railway](https://railway.app)** - $5 credit grátis
- **[Render](https://render.com)** - PostgreSQL free (90 dias)

Após criar, copie a **connection string**.

### 3. Instalar Dependências

```bash
cd sistema-de-patrimonio-api
yarn install
```

### 4. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

```env
# Database (Local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=patrimonio_db
DB_USER=postgres
DB_PASSWORD=your_password

# Database (Cloud - exemplo Supabase)
# DB_HOST=db.xxxxxxxxxxxxx.supabase.co
# DB_PORT=5432
# DB_NAME=postgres
# DB_USER=postgres
# DB_PASSWORD=your_supabase_password

# JWT Secret (MUDE EM PRODUÇÃO!)
JWT_SECRET=change-this-secret-in-production

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 5. Executar Migrations

```bash
yarn db:migrate
```

Isso cria todas as tabelas no banco.

### 6. Executar Seeds

```bash
yarn db:seed
```

Isso cria:
- ✅ Perfis padrão (ADMIN, USER)
- ✅ Categorias padrão
- ✅ Localizações padrão
- ✅ Tipos de movimentação
- ✅ Usuário admin: **admin@email.com** / **admin123**

---

## 🏃 Uso

### Desenvolvimento (com hot reload)
```bash
yarn dev
```

### Produção
```bash
yarn build
yarn start
```

Servidor rodará em: **http://localhost:3000**

### Health Check
```bash
curl http://localhost:3000/health
```

---

## 📚 API Endpoints

### Autenticação

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/login` | Login | Não |
| POST | `/api/auth/logout` | Logout | Sim |
| GET | `/api/auth/me` | Dados do usuário logado | Sim |
| POST | `/api/auth/recover-password` | Recuperar senha | Não |
| PUT | `/api/auth/change-password` | Alterar senha | Sim |

### Usuários

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | `/api/users` | Listar usuários | Admin |
| GET | `/api/users/:id` | Buscar usuário | Autenticado |
| POST | `/api/users` | Criar usuário | Admin |
| PUT | `/api/users/:id` | Atualizar usuário | Admin |
| DELETE | `/api/users/:id` | Excluir usuário | Admin |

### Bens

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | `/api/bens` | Listar bens | Autenticado |
| GET | `/api/bens/:id` | Buscar bem | Autenticado |
| GET | `/api/bens/tombo/:tombo` | Buscar por tombo | Autenticado |
| POST | `/api/bens` | Criar bem | Autenticado |
| PUT | `/api/bens/:id` | Atualizar bem | Autenticado |
| DELETE | `/api/bens/:id` | Excluir bem | Autenticado |

### Movimentações

| Método | Rota | Descrição | Permissão |
|--------|------|-----------|-----------|
| GET | `/api/movimentacoes` | Listar todas | Autenticado |
| GET | `/api/movimentacoes/active` | Empréstimos ativos | Autenticado |
| GET | `/api/movimentacoes/:id` | Buscar movimentação | Autenticado |
| POST | `/api/movimentacoes` | Criar movimentação | Autenticado |
| PUT | `/api/movimentacoes/:id` | Atualizar | Autenticado |
| POST | `/api/movimentacoes/:id/return` | Registrar devolução | Autenticado |

### Tabelas de Referência

Todas seguem o mesmo padrão:

| Método | Permissão |
|--------|-----------|
| GET | Qualquer usuário autenticado |
| POST/PUT/DELETE | Admin apenas |

**Endpoints:**
- `/api/categorias`
- `/api/localizacoes`
- `/api/perfis`
- `/api/tipos-movimentacao`

---

## 🔐 Autenticação

A API usa **JWT (JSON Web Tokens)**.

### 1. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@email.com",
    "password": "admin123"
  }'
```

Resposta:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### 2. Usar Token

Inclua o token no header `Authorization`:

```bash
curl http://localhost:3000/api/bens \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### 3. Expiração

Token expira em **7 dias** (configurável via `JWT_EXPIRES_IN` no `.env`).

---

## 🧪 Testes

### Método 1: curl (Terminal)

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@email.com","password":"admin123"}' \
  | jq -r '.data.token')

# 2. Listar categorias
curl http://localhost:3000/api/categorias \
  -H "Authorization: Bearer $TOKEN"

# 3. Criar bem
curl -X POST http://localhost:3000/api/bens \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tombo": "001",
    "nome": "Cadeira",
    "categoriaId": "UUID_DA_CATEGORIA",
    "localizacaoId": "UUID_DA_LOCALIZACAO",
    "sala": "Sala 1"
  }'
```

### Método 2: Thunder Client (VS Code)

1. Instale a extensão **Thunder Client**
2. Crie uma collection "Sistema Patrimônio"
3. Variáveis de ambiente:
   - `baseUrl`: `http://localhost:3000`
   - `token`: (será preenchido após login)

4. Configure auto-save token no login:
   ```javascript
   // Tab "Tests" no request de login
   if (tc.response.json.success) {
     tc.setVar("token", tc.response.json.data.token);
   }
   ```

5. Use `{{baseUrl}}` e `{{token}}` nas requisições

### Método 3: Postman

Similar ao Thunder Client, mas com interface mais robusta.

---

## 🚢 Deploy (100% Free)

### Recommended: Render + Supabase ($0/month)

This guide shows you how to deploy completely free using:
- **Render** (API hosting - Free tier)
- **Supabase** (PostgreSQL database - Free tier)

---

### Step 1: Setup Supabase Database

#### 1.1. Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up with GitHub (free)
3. Click **"New Project"**

#### 1.2. Create Database
- **Name**: sistema-patrimonio-db (or any name)
- **Database Password**: Create a strong password (save it!)
- **Region**: Choose closest to your users
- **Pricing Plan**: Free
- Click **"Create new project"** (takes ~2 minutes)

#### 1.3. Get Connection Details
1. Go to **Project Settings** (gear icon) → **Database**
2. Scroll to **Connection Info**
3. Copy these values:
   ```
   Host: db.xxxxxxxxxxxxx.supabase.co
   Port: 5432
   Database: postgres
   User: postgres
   Password: [your password from step 1.2]
   ```

Keep this tab open - you'll need these values for Render!

---

### Step 2: Deploy API on Render

#### 2.1. Push Code to GitHub
```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/sistema-patrimonio-api.git
git branch -M main
git push -u origin main
```

#### 2.2. Create Render Account
1. Go to [https://render.com](https://render.com)
2. Sign up with GitHub (free)
3. Click **"New +"** → **"Web Service"**

#### 2.3. Connect Repository
1. Click **"Connect repository"**
2. Select your `sistema-patrimonio-api` repository
3. Click **"Connect"**

#### 2.4. Configure Web Service

**Basic Settings:**
- **Name**: `sistema-patrimonio-api` (or any name)
- **Region**: Oregon (Free)
- **Branch**: `main`
- **Runtime**: Node
- **Build Command**: `yarn install && yarn build`
- **Start Command**: `node dist/server.js`
- **Instance Type**: **Free**

**Environment Variables:**
Click **"Advanced"** and add these variables using your Supabase connection info:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `10000` | Render default port |
| `HOST` | `0.0.0.0` | |
| `DB_HOST` | `db.xxxxx.supabase.co` | From Supabase Step 1.3 |
| `DB_PORT` | `5432` | |
| `DB_NAME` | `postgres` | |
| `DB_USER` | `postgres` | |
| `DB_PASSWORD` | `your-supabase-password` | From Supabase Step 1.2 |
| `JWT_SECRET` | Click "Generate" | Render will create a secure secret |
| `JWT_EXPIRES_IN` | `7d` | |
| `FRONTEND_URL` | `http://localhost:5173` | Update later with your frontend URL |

Click **"Create Web Service"**

#### 2.5. Wait for Deployment
- First build takes ~3-5 minutes
- Watch logs in Render dashboard
- Once you see "Live" status, API is deployed!

---

### Step 3: Initialize Database

#### 3.1. Open Render Shell
1. In Render dashboard, click your service
2. Go to **"Shell"** tab (top right)
3. This opens a terminal in your deployed app

#### 3.2. Run Database Setup
```bash
# Run migrations and seeds
bash scripts/setup-db.sh
```

This will:
- Create all database tables
- Insert default data (perfis, categorias, localizacoes)
- Create admin user

**Default Credentials:**
- Email: `admin@email.com`
- Password: `admin123`

⚠️ **IMPORTANT**: Change admin password after first login!

---

### Step 4: Test Your API

#### 4.1. Get API URL
Your API is now live at:
```
https://sistema-patrimonio-api.onrender.com
```
(Replace with your actual Render URL from dashboard)

#### 4.2. Test Health Check
```bash
curl https://sistema-patrimonio-api.onrender.com/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-12-04T..."}
```

#### 4.3. Test Login
```bash
curl -X POST https://sistema-patrimonio-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@email.com","password":"admin123"}'
```

Should return a JWT token!

---

### Step 5: Update Frontend URL (Optional)

When you deploy your frontend:

1. Go to Render dashboard → Your service
2. **Environment** tab
3. Edit `FRONTEND_URL` to your frontend URL
4. Click **"Save Changes"** (auto-redeploys)

---

### Deployment Notes

#### Free Tier Limitations
- **Cold starts**: API spins down after 15 mins of inactivity
  - First request after inactivity: ~30 seconds delay
  - Subsequent requests: instant
  - Perfect for internal parish use
- **750 hours/month**: Enough for 24/7 uptime
- **No credit card required**

#### Auto-Deploy
- Every `git push` to `main` branch triggers automatic deployment
- Check logs in Render dashboard to monitor deployments

#### Database Backups
- Supabase free tier: 7 days backup retention
- Can export database manually anytime

---

### Alternative Deployment Options

#### Railway (Alternative)
```bash
# Install CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Add PostgreSQL
railway add postgresql

# Run migrations
railway run yarn db:migrate
railway run yarn db:seed
```

#### Fly.io (No Cold Starts)
Better performance but more complex setup. See [Fly.io docs](https://fly.io/docs).

---

### Troubleshooting Deployment

#### Error: Cannot connect to database
**Solution:**
- Verify Supabase connection details in Render environment variables
- Check DB_HOST, DB_PASSWORD are correct
- Ensure Supabase project is active (not paused)

#### Error: Migrations failed
**Solution:**
```bash
# In Render Shell, check database connection
yarn db:migrate:undo:all
yarn db:migrate
```

#### Error: Port already in use
**Solution:**
- Render automatically sets PORT=10000
- Ensure your code reads `process.env.PORT` (already configured in src/server.ts)

#### Cold start is too slow
**Solutions:**
- Upgrade to Render Starter ($7/month) for no cold starts
- Or use Fly.io free tier (no cold starts)
- Or keep a browser tab open pinging `/health` every 10 mins

#### Check deployment logs
```bash
# View logs in real-time
# Go to Render dashboard → Your service → Logs tab
```

---

## 🐛 Troubleshooting

### Erro: Cannot connect to database

**Solução:**
```bash
# Verificar se PostgreSQL está rodando
pg_isready

# Testar conexão
psql -U postgres -d patrimonio_db

# Verificar credenciais
cat .env
```

### Erro: Token inválido ou expirado

**Solução:**
- Faça login novamente
- Token expira em 7 dias
- Formato: `Authorization: Bearer <token>`

### Erro: Port 3000 já em uso

**Solução:**
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou mudar porta no .env
PORT=3001
```

### Erro: Migration já executada

**Solução:**
```bash
# Reverter última migration
yarn db:migrate:undo

# Ou reverter todas
yarn db:migrate:undo:all

# Re-executar
yarn db:migrate
```

### Reset completo do banco

```bash
yarn db:seed:undo:all
yarn db:migrate:undo:all
yarn db:migrate
yarn db:seed
```

---

## 📊 Scripts Disponíveis

```bash
# Desenvolvimento
yarn dev              # Inicia servidor com hot reload

# Build
yarn build            # Compila TypeScript para JavaScript

# Produção
yarn start            # Inicia servidor de produção

# Database
yarn db:migrate       # Executa migrations
yarn db:migrate:undo  # Reverte última migration
yarn db:seed          # Executa seeds
yarn db:seed:undo:all # Remove todos os seeds
```

---

## 🔒 Segurança

### Implementado

✅ JWT com expiração configurável
✅ Senhas criptografadas (bcrypt, 10 rounds)
✅ Validação de input (Zod schemas)
✅ CORS configurado
✅ Role-based access control (ADMIN/USER)
✅ Verificação de perfil no banco (não apenas JWT)
✅ Soft deletes (preserva dados)
✅ Proteção contra SQL injection (Sequelize ORM)

### Recomendações para Produção

- [ ] Use HTTPS (Let's Encrypt)
- [ ] Configure rate limiting
- [ ] Implemente logs estruturados
- [ ] Backup automático do banco
- [ ] Monitore erros (Sentry, etc.)
- [ ] Use secrets manager para credenciais

---

## 👥 Credenciais Padrão

Após executar `yarn db:seed`:

**Email:** admin@email.com
**Senha:** admin123
**Perfil:** ADMIN

⚠️ **IMPORTANTE:** Mude a senha após o primeiro login em produção!

---

## 📝 Changelog

### v1.0.0 (2024-12-04)

- ✅ Arquitetura relacional com tabelas de referência
- ✅ 40+ endpoints REST completos
- ✅ Autenticação JWT com RBAC
- ✅ Migrations e seeds configurados
- ✅ Documentação completa
- ✅ Pronto para deploy

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

---

## 📄 Licença

MIT

---

## 🆘 Suporte

Dúvidas ou problemas?

1. Verifique os logs do servidor
2. Teste conexão com banco de dados
3. Confirme que migrations rodaram
4. Revise as variáveis de ambiente

---

**Desenvolvido com ❤️ para gerenciamento de patrimônio de nossa paróquia**
