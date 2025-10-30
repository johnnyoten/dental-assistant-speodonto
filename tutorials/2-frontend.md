# 🎨 Tutorial Frontend - Clínica Speodonto

## Stack do Frontend

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem
- **Tailwind CSS** - Estilos
- **Heroicons** - Ícones
- **Recharts** - Gráficos
- **Design Mobile-First** - Responsivo

---

## 📱 Características

✅ **Mobile-First** - Projetado primeiro para celular
✅ **Bottom Navigation** - Navegação fixa no rodapé (como apps)
✅ **Touch-Friendly** - Botões grandes e espaçados
✅ **Responsivo** - Funciona em mobile, tablet e desktop
✅ **PWA-Ready** - Pode ser instalado no celular

---

## 🎯 Passo 1: Entender a Estrutura (2 min)

### Páginas Principais

```
app/
├── page.tsx                    # Home (redireciona)
├── login/page.tsx              # Login com token
└── admin/
    ├── page.tsx                # Dashboard
    ├── appointments/
    │   ├── page.tsx            # Lista de agendamentos
    │   ├── new/page.tsx        # Novo agendamento
    │   └── [id]/page.tsx       # Detalhes/Edição
    ├── prescriptions/
    │   ├── page.tsx            # Lista de receitas
    │   └── new/page.tsx        # Nova receita
    └── stats/
        └── page.tsx            # Estatísticas
```

### Componentes Reutilizáveis

```
components/
├── Layout.tsx              # Layout com bottom nav
├── Card.tsx                # Cards visuais
├── Button.tsx              # Botões estilizados
├── Input.tsx               # Inputs de formulário
└── Select.tsx              # Selects customizados
```

---

## 🚀 Passo 2: Já Está Pronto! (0 min)

O frontend já está 100% implementado! Você só precisa:

1. ✅ Fazer login com o `ADMIN_TOKEN`
2. ✅ Navegar pelo painel
3. ✅ Testar funcionalidades

---

## 📱 Passo 3: Testar no Mobile (3 min)

### 3.1 No Computador

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### 3.2 No Celular (Mesma Rede WiFi)

#### Descobrir IP do Computador:

**Windows:**

```bash
ipconfig
```

Procure por `IPv4 Address` (ex: 192.168.1.100)

**Mac/Linux:**

```bash
ifconfig | grep inet
```

#### Acessar no Celular:

No navegador do celular: `http://192.168.1.100:3000`

✅ Você verá o app mobile-optimized!

### 3.3 Testar Navegação

- Barra inferior com 4 ícones
- Todos clicáveis
- Transições suaves
- Botões grandes (fácil de tocar)

---

## 🎨 Passo 4: Personalizar Cores (Opcional)

### 4.1 Editar Cores Principais

Arquivo: `tailwind.config.ts`

```typescript
colors: {
  primary: {
    50: '#f0f9ff',    // Azul muito claro
    100: '#e0f2fe',
    // ...
    600: '#0284c7',   // Azul principal
    // ...
  },
}
```

**Trocar azul por verde:**

```typescript
colors: {
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',   // Verde
    600: '#16a34a',
    700: '#15803d',
  },
}
```

### 4.2 Aplicar Mudanças

```bash
# Reinicie o servidor
npm run dev
```

---

## 🧩 Passo 5: Entender Componentes

### Button

```tsx
<Button
  variant="primary|secondary|danger|success"
  size="sm|md|lg"
  fullWidth={true}
  onClick={() => {}}
>
  Texto
</Button>
```

**Exemplos:**

```tsx
// Botão primário grande
<Button variant="primary" size="lg">
  Salvar
</Button>

// Botão de perigo pequeno
<Button variant="danger" size="sm">
  Excluir
</Button>

// Botão full width
<Button fullWidth>
  Criar Agendamento
</Button>
```

### Card

```tsx
<Card onClick={() => {}}>
  <p>Conteúdo do card</p>
</Card>
```

### Input

```tsx
<Input
  label="Nome"
  value={nome}
  onChange={(e) => setNome(e.target.value)}
  placeholder="Digite o nome"
  error="Mensagem de erro"
/>
```

### Select

```tsx
<Select
  label="Serviço"
  value={servico}
  onChange={(e) => setServico(e.target.value)}
  options={[
    { value: "limpeza", label: "Limpeza" },
    { value: "canal", label: "Canal" },
  ]}
/>
```

---

## 📊 Passo 6: Páginas Principais

### 1. Login (`/login`)

**Funcionalidade:**

- Input para token
- Validação ao tentar logar
- Redireciona para `/admin` se válido
- Salva token no localStorage

**Fluxo:**

1. Usuário digita `ADMIN_TOKEN`
2. Sistema testa fazendo request à API
3. Se válido → salva e redireciona
4. Se inválido → mostra erro

---

### 2. Dashboard (`/admin`)

**Widgets:**

- 4 cards de estatísticas
- Lista de próximas consultas (5)
- Ações rápidas (Nova consulta, Nova receita)

**Dados mostrados:**

- Total de agendamentos
- Agendamentos este mês
- Total de conversas
- Próximos agendamentos

**Design:**

- Grid 2x2 no mobile
- Cards coloridos
- Ícones visuais

---

### 3. Agendamentos (`/admin/appointments`)

**Funcionalidades:**

- Lista agrupada por data
- Filtros: Hoje | Próximos | Todos
- Cards clicáveis (vai para detalhes)
- Status colorido
- Link para WhatsApp

**Layout Mobile:**

```
┌─────────────────────┐
│ Agendamentos  [+]   │
├─────────────────────┤
│ [Hoje] [Próximos]   │
├─────────────────────┤
│ Segunda, 14 out     │
│ ┌─────────────────┐ │
│ │ 14:00 Confirmado│ │
│ │ João Silva      │ │
│ │ Limpeza         │ │
│ │ 📞 (11) 9999... │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 16:00 Pendente  │ │
│ │ Maria Santos    │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

### 4. Novo Agendamento (`/admin/appointments/new`)

**Formulário:**

- Nome \*
- Telefone \*
- Serviço (dropdown) \*
- Data (date picker) \*
- Horário (time picker) \*
- Status (dropdown)
- Observações (textarea)

**Validação:**

- Campos obrigatórios marcados
- Erro visual se campo vazio
- Botão desabilitado enquanto salva

---

### 5. Detalhes Agendamento (`/admin/appointments/[id]`)

**2 Modos:**

**Visualização:**

- Mostra todos os dados
- Botão "Editar"
- Botão "WhatsApp" (abre conversa)
- Botão "Excluir" (confirma antes)

**Edição:**

- Formulário preenchido
- Botão "Salvar"
- Botão "Cancelar"
- Atualiza em tempo real

---

### 6. Receitas (`/admin/prescriptions`)

**Funcionalidades:**

- Lista de receitas criadas
- Busca por nome do paciente
- Botão "Copiar" em cada receita
- Preview (primeiros 150 chars)

**Design:**

- Cards com nome do paciente
- Data de criação
- Texto da receita (preview)
- Botão "Copiar para Clipboard"

---

### 7. Nova Receita (`/admin/prescriptions/new`)

**Funcionalidades:**

- 4 templates prontos:
  1. Antibiótico + Analgésico
  2. Pós-extração
  3. Anti-inflamatório
  4. Analgésico simples
- Editor de texto livre
- Botão "Copiar"
- Fonte monospace (code)

**Fluxo:**

1. Usuário escolhe template (ou escreve do zero)
2. Edita conforme necessário
3. Salva OU copia

---

### 8. Estatísticas (`/admin/stats`)

**Gráficos:**

- Gráfico de pizza (distribuição por status)
- Barras de progresso (serviços mais solicitados)
- Gráfico de barras (horários populares)

**Métricas:**

- Total de agendamentos
- Agendamentos este mês
- Total de conversas
- Taxa de conversão

**Biblioteca:** Recharts (responsiva)

---

## 🎭 Passo 7: Bottom Navigation

### 4 Seções:

```
[🏠 Início] [📅 Agenda] [📋 Receitas] [📊 Stats]
```

**Características:**

- Fixo no rodapé
- Ícone ativo = azul
- Ícone inativo = cinza
- Texto pequeno abaixo
- 80px de altura
- Sempre visível

**Implementação:**

Arquivo: `components/Layout.tsx`

```typescript
const navigation = [
  { name: "Início", href: "/admin", icon: HomeIcon },
  { name: "Agenda", href: "/admin/appointments", icon: CalendarIcon },
  { name: "Receitas", href: "/admin/prescriptions", icon: DocumentTextIcon },
  { name: "Stats", href: "/admin/stats", icon: ChartBarIcon },
];
```

---

## 📱 Passo 8: Responsividade

### Breakpoints

```css
Mobile:  < 640px   (padrão)
Tablet:  640-1024px
Desktop: > 1024px
```

### Grid Responsivo

```tsx
className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
```

- Mobile: 2 colunas
- Tablet: 3 colunas
- Desktop: 4 colunas

### Espaçamento

```
Mobile:  px-4 (16px lateral)
Tablet:  px-6 (24px lateral)
Desktop: px-8 (32px lateral)
```

---

## 🎨 Passo 9: Design System

### Cores

```
Azul (Primary):  #3b82f6
Verde (Success): #10b981
Amarelo (Warn):  #f59e0b
Vermelho (Erro): #ef4444
Roxo:            #8b5cf6
```

### Tipografia

```
Família: Inter (Google Fonts)

Tamanhos:
text-xs:  12px
text-sm:  14px
text-base: 16px
text-lg:  18px
text-xl:  20px
text-2xl: 24px
```

### Raios de Borda

```
rounded-lg:   8px  (botões, cards)
rounded-full: 9999px (pills, badges)
```

### Sombras

```
shadow-sm: Leve (cards)
shadow-md: Média (modals)
shadow-lg: Forte (dropdowns)
```

---

## 🔄 Passo 10: Estados de Loading

### Padrão Usado

```tsx
{loading ? (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
  </div>
) : (
  // Conteúdo
)}
```

### Estados Vazios

```tsx
<Card>
  <div className="text-center py-12">
    <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-600 font-medium mb-2">Nenhum item encontrado</p>
    <Button>Criar Novo</Button>
  </div>
</Card>
```

---

## ✅ Checklist Frontend

- [ ] App rodando (`npm run dev`)
- [ ] Login funcionando
- [ ] Dashboard carrega estatísticas
- [ ] Bottom navigation funciona
- [ ] Consigo criar agendamento
- [ ] Consigo editar agendamento
- [ ] Consigo deletar agendamento
- [ ] Lista de agendamentos filtra corretamente
- [ ] Consigo criar receita
- [ ] Templates de receita funcionam
- [ ] Botão "Copiar" funciona
- [ ] Gráficos aparecem nas estatísticas
- [ ] Testei no celular (mesma rede)
- [ ] Design está responsivo

---

## 🐛 Problemas Comuns

### Não consigo fazer login

**Causa:** Token incorreto

**Solução:**

1. Verifique o `ADMIN_TOKEN` no `.env`
2. Digite exatamente igual (sem espaços)
3. Reinicie o servidor

---

### Bottom navigation não aparece

**Causa:** Não está em rota `/admin/*`

**Solução:**

- Bottom nav só aparece em rotas do admin
- Login não tem bottom nav (proposital)

---

### Gráficos não aparecem

**Causa:** Recharts não instalado

**Solução:**

```bash
npm install recharts
```

---

### Layout quebrado no mobile

**Causa:** CSS não carregou

**Solução:**

1. Reinicie o servidor
2. Limpe cache: Ctrl+Shift+R
3. Verifique `globals.css` importado

---

## 📲 Instalar como PWA (Opcional)

Para instalar o app no celular como se fosse nativo:

1. Abra no navegador mobile (Chrome/Safari)
2. Menu (⋮) > "Adicionar à tela inicial"
3. Dê um nome: "Dental"
4. Ícone aparece na home screen
5. Abre em tela cheia!

---

## 🎯 Resumo

Frontend completo com:

✅ 8 páginas funcionais
✅ 6 componentes reutilizáveis
✅ Design mobile-first
✅ Bottom navigation
✅ Gráficos interativos
✅ Autenticação
✅ 100% responsivo

**Sem precisar programar nada! Já está pronto.** 🎉

---

## ⏭️ Próximo Passo

Continue no: **[3-whatsapp-gemini.md](3-whatsapp-gemini.md)**

Lá você vai configurar o WhatsApp para receber e responder mensagens automaticamente com IA!
