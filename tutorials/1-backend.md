# 🔧 Tutorial Backend - Dental Assistant

## Stack do Backend

- **Next.js 14** - API Routes
- **PostgreSQL** - Banco de dados (Neon.tech)
- **Prisma** - ORM
- **Google Gemini** - IA (GRÁTIS)
- **WhatsApp Cloud API** - Meta
- **Vercel** - Deploy

---

## 📋 Passo 1: Instalar Dependências (2 min)

```bash
cd dental-assistant
npm install
```

**Pacotes principais:**

- Next.js, React, TypeScript
- Prisma (ORM)
- Axios (HTTP client)
- Zod (validação)
- Date-fns (datas)

---

## 🗄️ Passo 2: Configurar PostgreSQL (5 min)

### 2.1 Criar Banco no Neon.tech

1. Acesse: **https://neon.tech**
2. Faça login/cadastro (grátis)
3. Clique em **"New Project"**
4. Dê um nome: `dental-assistant`
5. Escolha região mais próxima
6. Clique em **"Create Project"**

### 2.2 Copiar Connection String

1. Na dashboard do projeto, procure **"Connection string"**
2. Copie a string completa (começa com `postgresql://`)

**Exemplo:**

```
postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 2.3 Configurar no Projeto

Crie/edite o arquivo `.env`:

```env
DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

---

## 🤖 Passo 3: Configurar Google Gemini (3 min)

### 3.1 Obter API Key (GRÁTIS)

1. Acesse: **https://makersuite.google.com/app/apikey**
2. Faça login com conta Google
3. Clique em **"Create API Key"**
4. Copie a chave gerada (começa com `AIza...`)

### 3.2 Adicionar no .env

```env
GEMINI_API_KEY="AIzaxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 3.3 Configurar no Código

Edite: `app/api/whatsapp/webhook/route.ts`

**Linha 3 - Trocar de:**

```typescript
import { aiService } from "@/lib/ai-service";
```

**Para:**

```typescript
import { geminiAIService as aiService } from "@/lib/ai-service-gemini";
```

✅ Agora o sistema usa Gemini (grátis) ao invés de OpenAI!

---

## 🗃️ Passo 4: Configur'ar Admin Token (30 seg)

Escolha um token seguro para acessar o painel:

```env
ADMIN_TOKEN="meu_token_super_secreto_12345"
```

💡 **Dica:** Use uma senha forte! Este token dá acesso total ao painel.

---

## 🏗️ Passo 5: Inicializar Banco de Dados (2 min)

### 5.1 Gerar Prisma Client

```bash
npm run db:generate
```

Isso cria o cliente Prisma baseado no schema.

### 5.2 Criar Tabelas no Banco

```bash
npm run db:push
```

Isso cria as 4 tabelas:

- ✅ `Appointment` - Agendamentos
- ✅ `Conversation` - Conversas do WhatsApp
- ✅ `Message` - Mensagens
- ✅ `Prescription` - Receitas

### 5.3 Verificar (Opcional)

```bash
npm run db:studio
```

Abre interface visual do banco em: `http://localhost:5555`

---

## 🧪 Passo 6: Testar Backend Local (1 min)

### 6.1 Seu .env deve estar assim:

```env
# Database
DATABASE_URL="postgresql://user:pass@host.neon.tech/db"

# IA (Gemini - Grátis)
GEMINI_API_KEY="AIza..."

# Admin
ADMIN_TOKEN="seu_token_admin_123"

# WhatsApp (vamos configurar depois)
WHATSAPP_API_TOKEN="pendente"
WHATSAPP_PHONE_NUMBER_ID="pendente"
WHATSAPP_VERIFY_TOKEN="pendente"

# App URL (vai mudar depois do deploy)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 6.2 Rodar Servidor

```bash
npm run dev
```

Abra: **http://localhost:3000**

Você deve ver a tela de login! 🎉

---

## 📡 Passo 7: Testar APIs (Opcional)

### 7.1 Testar Login

1. Acesse: `http://localhost:3000`
2. Digite o `ADMIN_TOKEN` que você configurou
3. Deve entrar no painel!

### 7.2 Testar API Diretamente

**Criar Agendamento:**

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Authorization: Bearer seu_token_admin_123" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "João Teste",
    "customerPhone": "11999999999",
    "service": "Limpeza",
    "date": "2025-10-15",
    "time": "14:00",
    "status": "CONFIRMED"
  }'
```

**Listar Agendamentos:**

```bash
curl http://localhost:3000/api/appointments \
  -H "Authorization: Bearer seu_token_admin_123"
```

---

## 🚀 Passo 8: Deploy na Vercel (5 min)

### 8.1 Instalar CLI da Vercel

```bash
npm i -g vercel
```

### 8.2 Fazer Deploy

```bash
vercel
```

Responda:

- **Set up and deploy?** → Yes
- **Which scope?** → Sua conta
- **Link to existing project?** → No
- **Project name?** → dental-assistant
- **Directory?** → ./ (deixe em branco)
- **Override settings?** → No

Aguarde o deploy (1-2 min)...

### 8.3 Anotar URL

No final do deploy, você verá:

```
✅ Production: https://dental-assistant-xxxx.vercel.app
```

**Anote esta URL!** Vai precisar depois.

### 8.4 Configurar Variáveis de Ambiente

```bash
vercel env add DATABASE_URL
```

Cole a connection string do Neon.tech

```bash
vercel env add GEMINI_API_KEY
```

Cole a API key do Gemini

```bash
vercel env add ADMIN_TOKEN
```

Cole seu token de admin

```bash
vercel env add NEXT_PUBLIC_APP_URL
```

Cole a URL da Vercel (ex: `https://dental-assistant-xxxx.vercel.app`)

### 8.5 Novo Deploy (com variáveis)

```bash
vercel --prod
```

Aguarde...

✅ **Backend no ar!**

Acesse: `https://dental-assistant-xxxx.vercel.app`

---

## 🗂️ Estrutura do Backend

```
app/api/
├── appointments/
│   ├── route.ts              # GET (listar), POST (criar)
│   └── [id]/route.ts         # GET, PATCH, DELETE
├── prescriptions/
│   └── route.ts              # GET, POST
├── dashboard/
│   └── stats/route.ts        # GET (estatísticas)
└── whatsapp/
    └── webhook/route.ts      # GET (verify), POST (receber msgs)

lib/
├── prisma.ts                 # Cliente Prisma
├── ai-service-gemini.ts      # Serviço IA (Gemini)
├── ai-service-groq.ts        # Serviço IA (Groq)
├── ai-service.ts             # Serviço IA (OpenAI)
└── whatsapp-service.ts       # Serviço WhatsApp

prisma/
└── schema.prisma             # Schema do banco
```

---

## 📊 Endpoints da API

### Agendamentos

```
GET    /api/appointments              Listar
POST   /api/appointments              Criar
GET    /api/appointments/[id]         Buscar
PATCH  /api/appointments/[id]         Atualizar
DELETE /api/appointments/[id]         Deletar
```

### Receitas

```
GET    /api/prescriptions             Listar
POST   /api/prescriptions             Criar
```

### Dashboard

```
GET    /api/dashboard/stats           Estatísticas
```

### WhatsApp

```
GET    /api/whatsapp/webhook          Verificação
POST   /api/whatsapp/webhook          Receber mensagens
```

---

## ✅ Checklist Backend

- [ ] `npm install` rodado
- [ ] PostgreSQL criado no Neon.tech
- [ ] `DATABASE_URL` no `.env`
- [ ] Google Gemini API Key obtida
- [ ] `GEMINI_API_KEY` no `.env`
- [ ] Import trocado para `geminiAIService` no webhook
- [ ] `ADMIN_TOKEN` definido
- [ ] `npm run db:generate` rodado
- [ ] `npm run db:push` rodado
- [ ] Servidor local funcionando (`npm run dev`)
- [ ] Login funcionando (acesso ao painel)
- [ ] Deploy na Vercel feito
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] App funcionando na URL da Vercel

---

## 🐛 Problemas Comuns

### "Cannot find module '@prisma/client'"

**Solução:**

```bash
npm run db:generate
```

### "Error: P1001: Can't reach database server"

**Causas:**

- Connection string incorreta
- Firewall bloqueando
- Banco não existe

**Solução:**

- Verifique a connection string no Neon.tech
- Copie novamente e cole no `.env`
- Certifique-se que tem `?sslmode=require` no final

### "IA não responde / Erro 401"

**Causa:** API Key do Gemini incorreta

**Solução:**

1. Verifique a chave em: https://makersuite.google.com/app/apikey
2. Copie novamente
3. Cole no `.env` (sem espaços extras)

### "Unauthorized" nas APIs

**Causa:** Token de admin incorreto

**Solução:**

- Verifique o `ADMIN_TOKEN` no `.env`
- Use exatamente o mesmo no header: `Authorization: Bearer seu_token`

---

## 🎯 Resumo

Você configurou:

✅ PostgreSQL no Neon.tech (grátis)
✅ Google Gemini para IA (grátis)
✅ Prisma ORM com 4 tabelas
✅ 10 endpoints de API
✅ Sistema de autenticação
✅ Deploy na Vercel (grátis)

**Custo total: $0/mês** 💰

---

## ⏭️ Próximo Passo

Continue no: **[2-frontend.md](2-frontend.md)**

Lá você vai configurar o painel administrativo mobile!
