# 📱 WhatsApp com Z-API (Alternativa à Meta)

**Tempo:** ~15 minutos
**Custo:** R$ 29/mês (7 dias grátis)
**Dificuldade:** ⭐⭐ Fácil

## ✅ Vantagens do Z-API

- 🇧🇷 **Brasileiro** - Suporte em português
- ⚡ **Rápido** - Sem aprovação da Meta
- 📱 **Qualquer número** - WhatsApp pessoal ou Business
- 🔄 **Webhooks** - Recebe mensagens em tempo real
- 💰 **Preço justo** - A partir de R$ 29/mês
- 🆓 **Trial grátis** - 7 dias para testar

---

## 📋 Pré-requisitos

- ✅ WhatsApp instalado no celular
- ✅ Aplicação Next.js já configurada
- ✅ Backend com Gemini funcionando
- ✅ Deploy na Vercel concluído

---

## 🚀 Passo a Passo

### 1. Criar Conta no Z-API

#### 1.1 Acessar Site
```
https://www.z-api.io/
```

#### 1.2 Criar Conta
1. Clique em **"Começar Agora"** ou **"Criar Conta"**
2. Preencha seus dados
3. Confirme o email

#### 1.3 Criar Nova Instância
1. No painel, clique em **"Nova Instância"**
2. Escolha o plano:
   - **Básico**: R$ 29/mês (1 instância)
   - **Profissional**: R$ 79/mês (3 instâncias)
3. Escolha **"7 dias grátis"** para testar
4. Preencha os dados de pagamento

---

### 2. Conectar WhatsApp

#### 2.1 Obter QR Code
1. No painel Z-API, clique na instância criada
2. Clique em **"Conectar WhatsApp"**
3. Um **QR Code** aparecerá na tela

#### 2.2 Escanear QR Code
1. Abra o **WhatsApp** no celular
2. Toque em **⋮** (menu) → **Aparelhos conectados**
3. Toque em **"Conectar um aparelho"**
4. **Escaneie o QR Code** da tela do Z-API

✅ **Status:** Deve aparecer "Conectado" em verde

---

### 3. Copiar Credenciais

#### 3.1 Obter Instance ID e Token
No painel Z-API:

1. Clique em **"Configurações"** ou **"Settings"**
2. Copie as seguintes informações:

```
Instance ID: 3D5F2A8B9C1E4
Token: 8B7C6D5E4F3A2B1C0
Client Token: opcional_para_seguranca
```

#### 3.2 Adicionar ao .env
Edite o arquivo `.env` do seu projeto:

```bash
# Z-API Configuration
ZAPI_URL="https://api.z-api.io"
ZAPI_INSTANCE_ID="3D5F2A8B9C1E4"
ZAPI_TOKEN="8B7C6D5E4F3A2B1C0"
ZAPI_CLIENT_TOKEN="seu_client_token"  # Opcional
```

---

### 4. Configurar Webhook

#### 4.1 Obter URL do Webhook
Sua URL será:
```
https://seu-app.vercel.app/api/zapi/webhook
```

Exemplo:
```
https://dental-assistant.vercel.app/api/zapi/webhook
```

#### 4.2 Configurar no Z-API
1. No painel Z-API, vá em **"Webhooks"**
2. Clique em **"Configurar Webhook"**
3. Cole a URL do seu webhook
4. Selecione os eventos:
   - ✅ **Message Received** (Mensagem Recebida)
   - ✅ **Messages Upsert** (Mensagens)
5. Clique em **"Salvar"**

#### 4.3 Testar Webhook (Opcional)
No painel Z-API:
1. Vá em **"Testes"** ou **"Tests"**
2. Clique em **"Testar Webhook"**
3. Deve aparecer: ✅ **"Webhook respondeu com sucesso"**

---

### 5. Fazer Deploy

#### 5.1 Fazer Push para Git
```bash
git add .
git commit -m "feat: integração Z-API WhatsApp"
git push origin master
```

#### 5.2 Deploy Automático Vercel
- Vercel detecta o push automaticamente
- Deploy é feito em ~2 minutos
- Verifique os logs no painel Vercel

#### 5.3 Adicionar Variáveis na Vercel
```bash
vercel env add ZAPI_URL
vercel env add ZAPI_INSTANCE_ID
vercel env add ZAPI_TOKEN
vercel env add ZAPI_CLIENT_TOKEN
```

Ou adicione manualmente no painel:
1. Vercel Dashboard → Seu Projeto
2. Settings → Environment Variables
3. Adicione cada variável

---

### 6. Testar Tudo Funcionando

#### 6.1 Enviar Mensagem de Teste
1. Abra o WhatsApp no celular
2. Envie mensagem para o **número conectado**:
   ```
   Olá! Quero agendar uma consulta
   ```

#### 6.2 Verificar Resposta
A IA deve responder algo como:
```
Olá! Ficarei feliz em ajudar com seu agendamento! 😊

Para começar, qual é o seu nome completo?
```

#### 6.3 Testar Fluxo Completo
Continue a conversa:
```
Você: João Silva
IA: Prazer, João! Qual serviço você precisa?
Você: Limpeza
IA: Perfeito! Para qual data você gostaria?
Você: Amanhã às 14h
IA: ✅ Agendamento confirmado!
```

✅ **Funcionou?** Parabéns! WhatsApp integrado!

---

## 🔧 Solução de Problemas

### ❌ Webhook não responde

**Solução:**
```bash
# 1. Testar endpoint manualmente
curl https://seu-app.vercel.app/api/zapi/webhook

# 2. Verificar logs na Vercel
vercel logs

# 3. Reconfigurar webhook no painel Z-API
```

### ❌ Mensagens não chegam

**Solução:**
1. Verificar se WhatsApp está conectado (painel Z-API)
2. Reconectar QR Code se necessário
3. Verificar eventos selecionados no webhook

### ❌ IA não responde corretamente

**Solução:**
```bash
# Verificar variável Gemini
echo $GEMINI_API_KEY

# Testar API diretamente
curl https://seu-app.vercel.app/api/zapi/webhook \
  -X GET
```

---

## 📊 Diferenças: Z-API vs Meta API

| Característica | Z-API | Meta Business API |
|----------------|-------|-------------------|
| **Aprovação** | ❌ Não precisa | ✅ Precisa Business Manager |
| **Custo** | 💰 R$ 29/mês | 🆓 Grátis (1000 conversas) |
| **Setup** | ⏱️ 15 minutos | ⏱️ 2-3 dias |
| **Número WhatsApp** | 📱 Qualquer | 📱 Apenas Business |
| **Suporte** | 🇧🇷 Português | 🌎 Inglês |
| **Estabilidade** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Trial** | 🆓 7 dias | ❌ Não tem |

---

## 🎯 Funcionalidades do Z-API

### ✅ O que você pode fazer:

- 📤 **Enviar mensagens de texto**
- 🖼️ **Enviar imagens e documentos**
- 🔘 **Botões interativos**
- 📋 **Listas de opções**
- 👥 **Múltiplas instâncias**
- 📊 **Dashboard de métricas**
- 🔄 **Webhooks em tempo real**

### ✅ Exemplos de Código

**Enviar mensagem com botões:**
```typescript
await zapiService.sendButtonMessage(
  '5511999999999',
  'Escolha um serviço:',
  [
    { id: 'limpeza', label: 'Limpeza' },
    { id: 'canal', label: 'Canal' },
    { id: 'extracao', label: 'Extração' }
  ]
)
```

**Enviar lista:**
```typescript
await zapiService.sendListMessage(
  '5511999999999',
  'Nossos Serviços',
  'Escolha um serviço abaixo',
  'Ver Serviços',
  [
    {
      title: 'Preventivos',
      rows: [
        { id: '1', title: 'Limpeza' },
        { id: '2', title: 'Avaliação' }
      ]
    },
    {
      title: 'Tratamentos',
      rows: [
        { id: '3', title: 'Canal' },
        { id: '4', title: 'Extração' }
      ]
    }
  ]
)
```

---

## 📱 Próximos Passos

Agora que o WhatsApp está funcionando:

1. ✅ **Testar com clientes reais**
2. ✅ **Personalizar mensagens da IA**
3. ✅ **Adicionar botões interativos**
4. ✅ **Configurar mensagens automáticas**
5. ✅ **Monitorar métricas no painel Z-API**

---

## 🆘 Precisa de Ajuda?

**Suporte Z-API:**
- 📧 Email: suporte@z-api.io
- 💬 Chat: No painel Z-API
- 📚 Docs: https://developer.z-api.io/

**Suporte do Sistema:**
- 📖 Ver: [README.md](../README.md)
- 🔧 Problemas: Abrir issue no GitHub

---

## ✅ Checklist Final

- [ ] Conta Z-API criada
- [ ] WhatsApp conectado via QR Code
- [ ] Credenciais copiadas para `.env`
- [ ] Webhook configurado no painel
- [ ] Deploy na Vercel concluído
- [ ] Variáveis adicionadas na Vercel
- [ ] Mensagem de teste enviada
- [ ] IA respondeu corretamente
- [ ] Agendamento foi criado no banco

---

**🎉 Parabéns! WhatsApp + IA funcionando com Z-API!**

Agora seus clientes podem agendar consultas conversando no WhatsApp! 🦷✨
