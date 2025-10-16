# 🦷 Dental Assistant

Sistema completo de agendamento inteligente para consultórios odontológicos com WhatsApp + IA.

## ✨ Funcionalidades

- 📱 **Agendamento via WhatsApp** - Clientes agendam conversando com IA
- 🤖 **IA Conversacional** - Google Gemini (100% grátis)
- 📊 **Painel Admin Mobile-First** - Gerenciar agendamentos pelo celular
- 📝 **Sistema de Receitas** - Templates prontos
- 📈 **Dashboard com Estatísticas** - Gráficos e métricas
- 💰 **100% Gratuito** - Stack free tier (Vercel + Neon + Gemini)

---

## 🚀 Stack Tecnológica

| Camada | Tecnologia | Custo |
|--------|-----------|-------|
| **Frontend** | Next.js 14 + Tailwind | Grátis |
| **Backend** | Next.js API Routes | Grátis |
| **Banco de Dados** | PostgreSQL (Neon.tech) | Grátis |
| **IA** | Google Gemini | Grátis |
| **WhatsApp** | Meta Cloud API | Grátis* |
| **Deploy** | Vercel | Grátis |

\* 1000 conversas/mês grátis. Respostas ilimitadas!

**Custo total: $0/mês** 💰

---

## 📚 Tutoriais

Siga os tutoriais na ordem:

1. **[Backend - PostgreSQL + Gemini](tutorials/1-backend.md)** (~15 min)
   - Configurar banco de dados
   - Configurar IA Gemini (grátis)
   - Deploy na Vercel
   - Testar APIs

2. **[Frontend - Painel Mobile](tutorials/2-frontend.md)** (~10 min)
   - Entender estrutura
   - Testar no celular
   - Personalizar (opcional)

3. **[WhatsApp + IA](tutorials/3-whatsapp-gemini.md)** (~20 min)
   - Configurar WhatsApp Business
   - Conectar webhook
   - Testar agendamento automático

**Total: ~45 minutos** ⏱️

---

## ⚡ Início Rápido

```bash
# 1. Instalar
git clone <seu-repo>
cd dental-assistant
npm install

# 2. Configurar .env
cp .env.example .env
# Edite o .env com suas credenciais

# 3. Inicializar banco
npm run db:generate
npm run db:push

# 4. Rodar
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🗂️ Estrutura do Projeto

```
dental-assistant/
├── app/
│   ├── api/                    # 10 API endpoints
│   ├── admin/                  # 8 páginas do painel
│   └── login/                  # Autenticação
├── components/                 # 6 componentes reutilizáveis
├── lib/                        # Serviços (IA, WhatsApp, Prisma)
├── prisma/                     # Schema do banco (4 tabelas)
├── tutorials/                  # 🎯 COMECE AQUI!
│   ├── 1-backend.md
│   ├── 2-frontend.md
│   └── 3-whatsapp-gemini.md
└── .env.example                # Template de configuração
```

---

## 🎯 Fluxo de Uso

### Para Clientes (WhatsApp)

```
Cliente: Olá, quero agendar uma consulta
IA: Claro! Qual é o seu nome?
Cliente: João Silva
IA: Qual serviço você precisa?
Cliente: Limpeza
IA: Para qual data?
Cliente: Amanhã às 14h
IA: ✅ Agendamento confirmado!
```

→ Agendamento criado automaticamente no banco

### Para Dentistas (Painel)

- 📊 Ver dashboard com estatísticas
- 📅 Gerenciar agenda (criar, editar, deletar)
- 📋 Criar receitas com templates
- 📈 Visualizar gráficos e métricas
- 📱 Tudo otimizado para celular!

---

## 📱 Design Mobile-First

Interface projetada para celular com:
- ✅ Bottom navigation (4 seções)
- ✅ Botões grandes e touch-friendly
- ✅ Cards visuais
- ✅ Formulários simples
- ✅ 100% responsivo

---

## 🔐 Variáveis de Ambiente

```env
# Database (Neon.tech)
DATABASE_URL="postgresql://..."

# WhatsApp (Meta Cloud API)
WHATSAPP_API_TOKEN="EAAxxxx..."
WHATSAPP_PHONE_NUMBER_ID="123456..."
WHATSAPP_VERIFY_TOKEN="seu_token_123"

# IA (Google Gemini - GRÁTIS)
GEMINI_API_KEY="AIzaxxxx..."

# Admin
ADMIN_TOKEN="seu_token_admin"

# App URL (Vercel)
NEXT_PUBLIC_APP_URL="https://seu-app.vercel.app"
```

Veja [.env.example](.env.example) para mais detalhes.

---

## 🤖 Trocar de IA (Opcional)

O sistema suporta 3 opções de IA:

| IA | Grátis? | Como Usar |
|----|---------|-----------|
| **Google Gemini** | ✅ Sim | Já configurado! |
| **Groq (Llama)** | ✅ Sim | Veja [1-backend.md](tutorials/1-backend.md) |
| **OpenAI** | ❌ Pago | Troque o import |

Para trocar, edite `app/api/whatsapp/webhook/route.ts`:

```typescript
// Gemini (grátis)
import { geminiAIService as aiService } from '@/lib/ai-service-gemini'

// Groq (grátis)
import { groqAIService as aiService } from '@/lib/ai-service-groq'

// OpenAI (pago)
import { aiService } from '@/lib/ai-service'
```

---

## 🗄️ Banco de Dados

4 tabelas criadas automaticamente:

- **Appointment** - Agendamentos (nome, telefone, serviço, data, hora)
- **Conversation** - Conversas do WhatsApp (histórico)
- **Message** - Mensagens (user, assistant, system)
- **Prescription** - Receitas médicas

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
npm i -g vercel
vercel
```

### Configurar Variáveis

```bash
vercel env add DATABASE_URL
vercel env add GEMINI_API_KEY
vercel env add WHATSAPP_API_TOKEN
vercel env add WHATSAPP_PHONE_NUMBER_ID
vercel env add WHATSAPP_VERIFY_TOKEN
vercel env add ADMIN_TOKEN
vercel env add NEXT_PUBLIC_APP_URL
```

### Novo Deploy

```bash
vercel --prod
```

---

## 📊 API Endpoints

Todos os endpoints exigem autenticação:
```
Authorization: Bearer SEU_ADMIN_TOKEN
```

### Agendamentos
```
GET    /api/appointments           Lista
POST   /api/appointments           Cria
GET    /api/appointments/[id]      Busca
PATCH  /api/appointments/[id]      Atualiza
DELETE /api/appointments/[id]      Remove
```

### Receitas
```
GET    /api/prescriptions          Lista
POST   /api/prescriptions          Cria
```

### Dashboard
```
GET    /api/dashboard/stats        Estatísticas
```

### WhatsApp
```
GET    /api/whatsapp/webhook       Verifica (Meta)
POST   /api/whatsapp/webhook       Recebe mensagens
```

---

## 🐛 Problemas Comuns

### Webhook não verifica?
→ `WHATSAPP_VERIFY_TOKEN` deve ser igual no Meta e no `.env`

### IA não responde?
→ Verifique `GEMINI_API_KEY` em https://makersuite.google.com/

### Banco não conecta?
→ Copie a connection string correta do Neon.tech

### Mais problemas?
→ Veja os tutoriais em [tutorials/](tutorials/)

---

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run start        # Servidor produção
npm run db:generate  # Gera Prisma Client
npm run db:push      # Sync schema com banco
npm run db:studio    # Interface visual do banco
```

---

## 🎨 Personalizar

### Cores

Edite `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    600: '#0284c7',  // Azul principal
  },
}
```

### Prompt da IA

Edite `lib/ai-service-gemini.ts`:

```typescript
const basePrompt = `Você é um assistente virtual...`
```

### Horários Disponíveis

Edite o prompt no mesmo arquivo:

```typescript
3. Horários disponíveis: Segunda a Sexta, 8h às 18h
```

---

## 📄 Licença

MIT

---

## 🤝 Contribuir

Pull requests são bem-vindos!

---

## 📞 Suporte

Dúvidas? Veja os tutoriais em [tutorials/](tutorials/)

---

**Desenvolvido com ❤️ usando Next.js, Tailwind, Prisma, Gemini e WhatsApp API**

**Stack 100% gratuita para consultórios odontológicos! 🦷✨**
