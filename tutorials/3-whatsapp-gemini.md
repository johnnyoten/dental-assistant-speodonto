# 📱 Tutorial WhatsApp + Gemini - Clínica Speodonto

## O que vamos fazer

Conectar o WhatsApp Business com a IA Gemini para:

- ✅ Receber mensagens dos clientes
- ✅ IA responder automaticamente
- ✅ Agendar consultas via conversa natural
- ✅ Salvar agendamentos no banco
- ✅ Enviar confirmação

**Tudo 100% GRÁTIS!** 💰

---

## 📋 Pré-requisitos

- [ X ] Backend funcionando (tutorial 1)
- [ ] Deploy na Vercel feito
- [ X ] Gemini configurado e funcionando
- [ ] URL da Vercel anotada

---

## 🚀 Passo 1: Criar App no Meta (3 min)

### 1.1 Acessar Meta for Developers

🔗 **https://developers.facebook.com/**

### 1.2 Criar Conta/Login

- Use sua conta Facebook/Instagram
- Aceite os termos

### 1.3 Criar Novo App

1. Clique em **"Meus Apps"** ou **"My Apps"**
2. Clique em **"Criar App"** ou **"Create App"**
3. Escolha: **"Business"** (Negócios)
4. Clique em **"Avançar"**

### 1.4 Preencher Dados

```
Nome do App: Clínica Speodonto
(ou o nome do seu consultório)

Email: seu@email.com

Conta de Negócios: [Criar nova]
(se não tiver)
```

5. Clique em **"Criar App"**
6. Complete verificação de segurança (se pedir)

✅ App criado!

---

## 📞 Passo 2: Adicionar WhatsApp (2 min)

### 2.1 Encontrar WhatsApp

Na página do app, procure o card **"WhatsApp"**

### 2.2 Configurar

Clique em **"Configurar"** ou **"Set Up"**

Aguarde carregar...

✅ WhatsApp adicionado!

---

## 🔑 Passo 3: Copiar Credenciais (3 min)

Você está na página **"API Setup"**. Aqui tem tudo que precisa:

### 3.1 Copiar Access Token

Procure: **"Temporary access token"** ou **"Token de acesso temporário"**

```
EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

1. Clique em **"Copy"**
2. Salve no Bloco de Notas

⚠️ **Importante:** Este token expira em 24h!

### 3.2 Copiar Phone Number ID

Procure: **"Phone number ID"**

```
123456789012345
```

1. Copie este número (15 dígitos)
2. Salve no Bloco de Notas

### 3.3 Escolher Verify Token

**Você escolhe!** Pode ser qualquer texto seguro:

```
meu_token_verificacao_123
```

1. Anote este token
2. **Use o mesmo depois no webhook!**

---

## 📝 Passo 4: Configurar .env (1 min)

Edite o arquivo `.env`:

```env
# WhatsApp API
WHATSAPP_API_TOKEN="EAAxxxxxxxxx..."
WHATSAPP_PHONE_NUMBER_ID="123456789012345"
WHATSAPP_VERIFY_TOKEN="meu_token_verificacao_123"
```

Cole os 3 valores que você copiou/escolheu!

---

## 🌐 Passo 5: Atualizar Deploy (2 min)

### 5.1 Adicionar Variáveis na Vercel

```bash
vercel env add WHATSAPP_API_TOKEN
```

Cole o token EAAxxxx...

```bash
vercel env add WHATSAPP_PHONE_NUMBER_ID
```

Cole o phone ID

```bash
vercel env add WHATSAPP_VERIFY_TOKEN
```

Cole o verify token que você escolheu

### 5.2 Novo Deploy

```bash
vercel --prod
```

Aguarde...

✅ Deploy atualizado com WhatsApp configurado!

---

## 🔗 Passo 6: Configurar Webhook (3 min)

### 6.1 Ir para Configuration

No painel do Meta, clique em **"Configuration"** (menu lateral esquerdo)

### 6.2 Configurar Webhook

Procure a seção **"Webhook"**

Clique em **"Edit"** ou **"Configurar"**

### 6.3 Preencher Dados

```
Callback URL:
https://seu-app.vercel.app/api/whatsapp/webhook

Verify Token:
meu_token_verificacao_123
(o MESMO que você escolheu no passo 3.3!)
```

⚠️ **Atenção:** URL deve terminar com `/api/whatsapp/webhook`

### 6.4 Verificar

Clique em **"Verify and Save"** ou **"Verificar e Salvar"**

**Deve aparecer:**

```
✅ Webhook verified successfully!
```

Se der erro:

- Verify Token está diferente do `.env`
- URL está errada
- Deploy não terminou

### 6.5 Subscribe aos Eventos

Ainda na página Configuration:

1. Procure: **"Webhook fields"**
2. Marque: ☑️ **"messages"**
3. Clique em **"Subscribe"**

✅ Webhook configurado!

---

## 📱 Passo 7: Adicionar Seu Número (2 min)

### 7.1 Voltar para API Setup

Menu lateral > **"API Setup"**

### 7.2 Adicionar Número de Teste

Procure: **"To"** (Para)

Clique em **"Manage phone number list"**

### 7.3 Adicionar Seu WhatsApp

Digite seu número:

```
+55 11 99999-9999
```

Formato: `+[país] [DDD] [número]`

Clique em **"Send Code"**

### 7.4 Confirmar Código

1. Abra o WhatsApp no celular
2. Você receberá uma mensagem com código
3. Digite o código na tela do Meta
4. Clique em **"Verify"**

✅ Seu número autorizado!

---

## 🧪 Passo 8: TESTAR! (2 min)

### 8.1 Encontrar Número de Teste

Na página **API Setup**, veja:

```
From: +1 555 0100
(ou outro número)
```

Este é o número do bot!

### 8.2 Enviar Mensagem

1. Abra WhatsApp
2. Adicione o número de teste
3. Envie: **"Olá"**

### 8.3 Ver Resposta da IA

A IA deve responder algo como:

```
Olá! Bem-vindo ao nosso consultório odontológico.
Como posso ajudá-lo?
```

✅ **FUNCIONOU!** 🎉

---

## 💬 Passo 9: Testar Agendamento (3 min)

### Conversação Completa:

```
Você: Quero agendar uma consulta

IA: Claro! Vou te ajudar com isso.
    Qual é o seu nome completo?

Você: João Silva

IA: Prazer, João! Qual tipo de serviço você precisa?
    Temos limpeza, canal, extração, avaliação...

Você: Limpeza

IA: Perfeito! Para qual data você gostaria de agendar?

Você: Amanhã

IA: E qual horário prefere?
    Atendemos de segunda a sexta, das 8h às 18h.

Você: 14h

IA: ✅ Agendamento confirmado!

    📋 Resumo:
    Nome: João Silva
    Serviço: Limpeza
    Data: 11/10/2025
    Horário: 14:00

    Nos vemos em breve! 😊
```

### Verificar no Painel

1. Abra: `https://seu-app.vercel.app`
2. Faça login
3. Vá em **"Agenda"**
4. Deve aparecer o agendamento do João Silva!

✅ Agendamento criado automaticamente!

---

## 🔄 Passo 10: Gerar Token Permanente (10 min)

O token temporário expira em 24h. Para produção, gere um permanente:

### 10.1 Acessar Business Settings

1. No Meta for Developers
2. Procure **"Business Settings"** (menu superior)
3. Ou acesse: https://business.facebook.com/settings

### 10.2 Criar System User

1. Menu lateral: **"System Users"** (Usuários do Sistema)
2. Clique em **"Add"** (Adicionar)
3. Nome: **"WhatsApp Bot"**
4. Role: **"Admin"**
5. Clique em **"Create System User"**

### 10.3 Gerar Token

1. Clique no System User criado ("WhatsApp Bot")
2. Clique em **"Generate New Token"**
3. Selecione seu app: **"Clínica Speodonto"**
4. Marque permissões:
   - ☑️ `whatsapp_business_messaging`
   - ☑️ `whatsapp_business_management`
5. Clique em **"Generate Token"**

### 10.4 Copiar Token Permanente

⚠️ **IMPORTANTE:** Copie AGORA! Não vai aparecer de novo!

```
EAAxxxxxxxxxxxxxxxxxxxx...
```

1. Copie e salve em lugar MUITO seguro
2. Este token vale por 60 dias

### 10.5 Atualizar no Projeto

**.env local:**

```env
WHATSAPP_API_TOKEN="novo_token_permanente"
```

**Vercel:**

```bash
vercel env rm WHATSAPP_API_TOKEN
vercel env add WHATSAPP_API_TOKEN
# Cole o novo token

vercel --prod
```

✅ Token permanente configurado!

---

## 🎯 Como Funciona (Explicação Técnica)

### Fluxo Completo:

```
1. Cliente envia mensagem
   ↓
2. WhatsApp Cloud API recebe
   ↓
3. Meta envia para seu webhook
   POST /api/whatsapp/webhook
   ↓
4. Seu backend recebe
   ↓
5. Busca conversa no banco (ou cria nova)
   ↓
6. Monta histórico de mensagens
   ↓
7. Envia para Gemini AI
   ↓
8. Gemini analisa e responde
   ↓
9. Backend salva resposta no banco
   ↓
10. Verifica se agendamento está completo
   ↓
11a. Se SIM: cria no banco
   ↓
11b. Se NÃO: continua coletando dados
   ↓
12. Envia resposta via WhatsApp API
   ↓
13. Cliente recebe mensagem
```

### Arquivo Principal:

`app/api/whatsapp/webhook/route.ts`

**Funções:**

- `GET` - Verifica webhook (Meta faz isso)
- `POST` - Recebe mensagens e processa

**Integra:**

- Prisma (banco)
- Gemini (IA)
- WhatsApp API (envio)

---

## ✅ Checklist WhatsApp

- [ ] App criado no Meta
- [ ] WhatsApp adicionado
- [ ] Access Token copiado
- [ ] Phone Number ID copiado
- [ ] Verify Token escolhido
- [ ] Variáveis no `.env`
- [ ] Deploy Vercel atualizado
- [ ] Webhook configurado ✅
- [ ] Campo "messages" subscrito ✅
- [ ] Meu número adicionado e confirmado
- [ ] Enviei "Olá" e recebi resposta
- [ ] Testei agendamento completo
- [ ] Agendamento apareceu no painel
- [ ] (Opcional) Token permanente gerado

---

## 🐛 Problemas Comuns

### ❌ "Webhook verification failed"

**Causa:** Verify Token diferente

**Solução:**

1. Verifique o `WHATSAPP_VERIFY_TOKEN` no `.env`
2. Deve ser EXATAMENTE igual ao que você digitou no Meta
3. Sem espaços, case-sensitive
4. Faça novo deploy: `vercel --prod`

---

### ❌ Bot não responde

**Possíveis causas:**

**1. Número não está na lista de teste**

Solução:

- API Setup > To > Adicionar número
- Confirmar código

**2. Campo "messages" não subscrito**

Solução:

- Configuration > Webhook fields
- Marcar "messages" ✅

**3. Deploy não terminou**

Solução:

- Aguarde o deploy terminar
- Verifique em: https://vercel.com/dashboard

**4. Gemini sem créditos/erro**

Solução:

- Verifique: https://makersuite.google.com/app/apikey
- Gere nova chave se necessário

---

### ❌ "Token expired"

**Causa:** Token temporário expirou (24h)

**Solução:**

1. Gere token permanente (Passo 10)
2. OU copie novo token temporário
3. Atualize na Vercel
4. Novo deploy

---

### ❌ Mensagem não envia

**Causa:** Token inválido ou expirado

**Solução:**

1. Verifique o token no Meta
2. Gere novo se necessário
3. Atualize `.env` e Vercel

---

## 🎨 Personalizar Prompt da IA

### Editar Comportamento do Bot

Arquivo: `lib/ai-service-gemini.ts`

Linha ~16:

```typescript
private buildSystemPrompt(context?: ConversationContext): string {
  const basePrompt = `Você é um assistente virtual...`
```

**Personalizações:**

**1. Mudar horários:**

```typescript
3. Horários disponíveis: Segunda a Sábado, 9h às 19h
```

**2. Adicionar serviços:**

```typescript
- Serviço desejado (limpeza, canal, extração, avaliação,
  clareamento, aparelho, implante, prótese)
```

**3. Mudar tom:**

```typescript
1. Seja super amigável e use emojis 😊
```

**4. Adicionar informações:**

```typescript
8. Nosso endereço: Rua ABC, 123 - Centro
9. Aceitamos convênios: Unimed, Bradesco
```

### Aplicar Mudanças

```bash
# Commit
git add lib/ai-service-gemini.ts
git commit -m "feat: personalizar prompt da IA"

# Deploy
vercel --prod
```

---

## 💰 Custos (Resumo)

| Serviço          | Custo | Limite               |
| ---------------- | ----- | -------------------- |
| **WhatsApp API** | $0    | 1000 conversas/mês\* |
| **Gemini AI**    | $0    | 60 req/min           |
| **Vercel**       | $0    | 100GB/mês            |
| **PostgreSQL**   | $0    | 0.5GB                |

**Total: $0/mês** ✨

\* Mensagens de **resposta** são ILIMITADAS!
Só mensagens iniciadas pelo bot contam no limite.

---

## 🚀 Usar em Produção (Clientes Reais)

### Requisitos:

1. **Verificar Negócio**

   - Enviar CNPJ/documentos
   - Aprovação leva 1-3 dias

2. **Adicionar Número Real**

   - Comprar número novo OU
   - Migrar número existente

3. **Solicitar Produção**
   - Preencher formulário de uso
   - Aguardar aprovação

### Limites Produção:

- Começa: 250 conversas/dia
- Aumenta automaticamente com uso
- Até 100.000/dia (para negócios grandes)

---

## 🎯 Resumo

Você configurou:

✅ WhatsApp Business Cloud API (grátis)
✅ Gemini AI para conversação (grátis)
✅ Webhook funcionando
✅ Agendamento automático
✅ Confirmação via WhatsApp

**Custo: $0/mês** 💰

**Sistema 100% funcional!** 🎉

---

## 📚 Próximos Passos

1. ✅ Personalize o prompt da IA
2. ✅ Teste com amigos/família
3. ✅ Ajuste conforme necessário
4. ✅ Quando estiver satisfeito, verifique seu negócio no Meta
5. ✅ Adicione número real
6. ✅ Comece a usar com clientes!

**Parabéns! Seu sistema está completo e funcionando! 🚀**
