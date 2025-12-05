# Asset Management System API

Backend API for the Asset Management System using **Fastify**, **Sequelize**, **PostgreSQL** and **TypeScript**.

Migration from SQLite (browser-based) to PostgreSQL (cloud database) with professional relational architecture.

---

## 📋 Table of Contents

- [Technologies](#-technologies)
- [Database Architecture](#-database-architecture)
- [Installation](#-installation)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Technologies

### Backend
- **Fastify** - Fast and efficient web framework
- **Sequelize + TypeScript** - ORM with TypeScript decorators
- **PostgreSQL** - Relational database
- **Zod** - Schema validation
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcrypt** - Password hashing

### Structure
- TypeScript for type safety
- Migrations & Seeds with sequelize-cli
- Authentication and validation middleware
- Soft deletes with `ativo` flag
- Role-based access control (RBAC)

---

## 🏗️ Database Architecture

### Relational Design (vs ENUMs)

Instead of using ENUMs, we implemented **reference tables** for greater flexibility:

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

### Reference Tables

1. **perfis** - User roles (ADMIN, USER)
   - Stores permissions in JSONB field
   - Allows creating new profiles dynamically

2. **categorias** - Asset categories
   - Furniture, Liturgical Objects, Electronics, etc.
   - Admins can add new ones via API

3. **localizacoes** - Physical locations
   - Main Church, Secondary Church, etc.
   - Includes address, responsible person, phone

4. **tipos_movimentacao** - Movement types
   - Loan, Return
   - `requerDevolucao` flag indicates if return is required

### Main Tables

5. **usuarios** - System users
   - Foreign key to `perfis`
   - Password automatically encrypted (Sequelize hooks)
   - Soft delete with `ativo`

6. **bens** - Assets
   - Foreign keys to `categorias` and `localizacoes`
   - Unique `tombo` identifier
   - Supports base64 images

7. **movimentacoes** - Loans/Returns
   - Foreign keys to `bens`, `tipos_movimentacao`, `usuarios`
   - `dataDevolucao` null = active loan
   - Tracks which user registered the movement

### Architecture Benefits

✅ Admins can add categories/locations via UI (no code changes)
✅ Better data integrity with foreign keys
✅ Easy auditing and reporting
✅ Scalable for new features
✅ Soft deletes preserve history

---

## 🔧 Installation

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 12+ (local or cloud)
- Yarn or npm

### 2. Setup PostgreSQL

#### Option A: Local PostgreSQL (macOS)
```bash
brew install postgresql
brew services start postgresql
createdb patrimonio_db
```

#### Option B: Cloud PostgreSQL (Recommended)

Choose a provider:

- **[Supabase](https://supabase.com)** - 500MB free, easy setup
- **[Neon](https://neon.tech)** - Serverless PostgreSQL
- **[Railway](https://railway.app)** - $5 free credit
- **[Render](https://render.com)** - Free PostgreSQL (90 days)

After creating, copy the **connection string**.

### 3. Install Dependencies

```bash
cd sistema-de-patrimonio-api
yarn install
```

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database (Local)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=patrimonio_db
DB_USER=postgres
DB_PASSWORD=your_password

# Database (Cloud - Supabase example)
# DB_HOST=db.xxxxxxxxxxxxx.supabase.co
# DB_PORT=5432
# DB_NAME=postgres
# DB_USER=postgres
# DB_PASSWORD=your_supabase_password

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=change-this-secret-in-production

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 5. Run Migrations

```bash
yarn db:migrate
```

This creates all tables in the database.

### 6. Run Seeds

```bash
yarn db:seed
```

This creates:
- ✅ Default profiles (ADMIN, USER)
- ✅ Default categories
- ✅ Default locations
- ✅ Movement types
- ✅ Admin user: **admin@email.com** / **admin123**

---

## 🏃 Usage

### Development (with hot reload)
```bash
yarn dev
```

### Production
```bash
yarn build
yarn start
```

Server will run at: **http://localhost:3000**

### Health Check
```bash
curl http://localhost:3000/health
```

---

## 📚 API Endpoints

### Authentication

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/logout` | Logout | Yes |
| GET | `/api/auth/me` | Get current user data | Yes |
| POST | `/api/auth/recover-password` | Recover password | No |
| PATCH | `/api/auth/change-password` | Change password | Yes |

### Users

| Method | Route | Description | Permission |
|--------|-------|-------------|------------|
| GET | `/api/users` | List users | Admin |
| GET | `/api/users/:id` | Get user | Authenticated |
| POST | `/api/users` | Create user | Admin |
| PATCH | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

### Assets (Bens)

| Method | Route | Description | Permission |
|--------|-------|-------------|------------|
| GET | `/api/bens` | List assets | Authenticated |
| GET | `/api/bens/:id` | Get asset | Authenticated |
| GET | `/api/bens/tombo/:tombo` | Get by tombo | Authenticated |
| POST | `/api/bens` | Create asset | Authenticated |
| PATCH | `/api/bens/:id` | Update asset | Authenticated |
| DELETE | `/api/bens/:id` | Delete asset | Authenticated |

### Movements (Movimentações)

| Method | Route | Description | Permission |
|--------|-------|-------------|------------|
| GET | `/api/movimentacoes` | List all | Authenticated |
| GET | `/api/movimentacoes/active` | Active loans | Authenticated |
| GET | `/api/movimentacoes/:id` | Get movement | Authenticated |
| POST | `/api/movimentacoes` | Create movement | Authenticated |
| PATCH | `/api/movimentacoes/:id` | Update movement | Authenticated |
| POST | `/api/movimentacoes/:id/return` | Register return | Authenticated |

### Reference Tables

All follow the same pattern:

| Method | Permission |
|--------|------------|
| GET | Any authenticated user |
| POST/PATCH/DELETE | Admin only |

**Endpoints:**
- `/api/categorias`
- `/api/localizacoes`
- `/api/perfis`
- `/api/tipos-movimentacao`

---

## 🔐 Authentication

The API uses **JWT (JSON Web Tokens)**.

### 1. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@email.com",
    "password": "admin123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### 2. Using Token

Include the token in the `Authorization` header:

```bash
curl http://localhost:3000/api/bens \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Expiration

Token expires in **7 days** (configurable via `JWT_EXPIRES_IN` in `.env`).

---

## 🧪 Testing

### Method 1: curl (Terminal)

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@email.com","password":"admin123"}' \
  | jq -r '.data.token')

# 2. List categories
curl http://localhost:3000/api/categorias \
  -H "Authorization: Bearer $TOKEN"

# 3. Create asset
curl -X POST http://localhost:3000/api/bens \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tombo": "001",
    "nome": "Chair",
    "categoriaId": "CATEGORY_UUID",
    "localizacaoId": "LOCATION_UUID",
    "sala": "Room 1"
  }'
```

### Method 2: Thunder Client (VS Code)

1. Install **Thunder Client** extension
2. Create a collection "Asset Management System"
3. Environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `token`: (will be filled after login)

4. Configure auto-save token on login:
   ```javascript
   // "Tests" tab in login request
   if (tc.response.json.success) {
     tc.setVar("token", tc.response.json.data.token);
   }
   ```

5. Use `{{baseUrl}}` and `{{token}}` in requests

### Method 3: Postman

Similar to Thunder Client, but with a more robust interface.

---

## 🚢 Deployment (100% Free)

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

### Error: Cannot connect to database

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d patrimonio_db

# Verify credentials
cat .env
```

### Error: Invalid or expired token

**Solution:**
- Login again
- Token expires in 7 days
- Format: `Authorization: Bearer <token>`

### Error: Port 3000 already in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or change port in .env
PORT=3001
```

### Error: Migration already executed

**Solution:**
```bash
# Undo last migration
yarn db:migrate:undo

# Or undo all
yarn db:migrate:undo:all

# Re-run
yarn db:migrate
```

### Complete database reset

```bash
yarn db:seed:undo:all
yarn db:migrate:undo:all
yarn db:migrate
yarn db:seed
```

---

## 📊 Available Scripts

```bash
# Development
yarn dev              # Start server with hot reload

# Build
yarn build            # Compile TypeScript to JavaScript

# Production
yarn start            # Start production server

# Database
yarn db:migrate       # Run migrations
yarn db:migrate:undo  # Undo last migration
yarn db:seed          # Run seeds
yarn db:seed:undo:all # Remove all seeds
```

---

## 🔒 Security

### Implemented

✅ JWT with configurable expiration
✅ Encrypted passwords (bcrypt, 10 rounds)
✅ Input validation (Zod schemas)
✅ CORS configured
✅ Role-based access control (ADMIN/USER)
✅ Profile verification in database (not just JWT)
✅ Soft deletes (preserves data)
✅ SQL injection protection (Sequelize ORM)

### Production Recommendations

- [ ] Use HTTPS (Let's Encrypt)
- [ ] Configure rate limiting
- [ ] Implement structured logging
- [ ] Automatic database backups
- [ ] Monitor errors (Sentry, etc.)
- [ ] Use secrets manager for credentials

---

## 👥 Default Credentials

After running `yarn db:seed`:

**Email:** admin@email.com
**Password:** admin123
**Profile:** ADMIN

⚠️ **IMPORTANT:** Change password after first login in production!

---

## 📝 Changelog

### v1.0.0 (2024-12-04)

- ✅ Relational architecture with reference tables
- ✅ 40+ complete REST endpoints
- ✅ JWT authentication with RBAC
- ✅ Configured migrations and seeds
- ✅ Complete documentation
- ✅ Ready for deployment

---

## 🤝 Contributing

1. Fork the project
2. Create a branch: `git checkout -b feature/new-feature`
3. Commit: `git commit -m 'Add new feature'`
4. Push: `git push origin feature/new-feature`
5. Open a Pull Request

---

## 📄 License

MIT

---

## 🆘 Support

Questions or problems?

1. Check server logs
2. Test database connection
3. Confirm migrations ran
4. Review environment variables

---

**Developed with ❤️ for our parish asset management**
