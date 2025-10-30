import Groq from 'groq-sdk'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ConversationContext {
  customerName?: string
  service?: string
  date?: string
  time?: string
}

export class GroqAIService {
  private client: Groq
  private model: string = 'llama-3.3-70b-versatile' // Melhor modelo gratuito do Groq
  private lastRequestTime: number = 0
  private minRequestInterval: number = 500 // 500ms entre requisições

  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY || ''
    })
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest
      console.log(`⏳ Rate limiting Groq: aguardando ${waitTime}ms`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }

    this.lastRequestTime = Date.now()
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: any

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error: any) {
        lastError = error

        // Se for erro 429 (rate limit), aguarda e tenta novamente
        if (error.status === 429 || error.error?.type === 'rate_limit_exceeded') {
          const waitTime = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
          console.log(`⚠️ Rate limit Groq atingido. Tentativa ${attempt + 1}/${maxRetries}. Aguardando ${waitTime}ms...`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          continue
        }

        // Para outros erros, não tenta novamente
        throw error
      }
    }

    throw lastError
  }

  async chat(messages: Message[], context?: ConversationContext, occupiedSlots?: string): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context, occupiedSlots)

    // Converte mensagens para formato do Groq (compatível com OpenAI)
    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ]

    try {
      // Aguarda rate limit antes de fazer a requisição
      await this.waitForRateLimit()

      // Tenta fazer a requisição com retry em caso de erro 429
      const chatCompletion = await this.retryWithBackoff(async () => {
        return await this.client.chat.completions.create({
          messages: groqMessages,
          model: this.model,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 1,
          stream: false
        })
      })

      const aiResponse = chatCompletion.choices[0]?.message?.content || ''
      return aiResponse.trim()
    } catch (error: any) {
      console.error('Erro ao chamar API do Groq:', error)

      // Log detalhado do erro para debug
      if (error.status) {
        console.error('Status:', error.status)
        console.error('Error type:', error.error?.type)
        console.error('Error message:', error.error?.message)
      }

      // Se for erro 429 após todas as tentativas, retorna mensagem amigável
      if (error.status === 429 || error.error?.type === 'rate_limit_exceeded') {
        const errorMessage = error.error?.message || ''

        if (errorMessage.includes('daily') || errorMessage.includes('day')) {
          console.error('❌ Limite diário da API Groq atingido')
          return 'Boa noite! Atingimos o limite diário de solicitações da nossa IA. Por gentileza, tente novamente amanhã ou entre em contato pelo telefone (11) 4184-6849. Pedimos desculpas pelo inconveniente!'
        } else {
          console.error('❌ Limite por minuto da API Groq atingido')
          return 'Boa noite! Estou com muitas solicitações no momento. Por gentileza, aguarde alguns instantes e envie sua mensagem novamente. Obrigado pela compreensão!'
        }
      }

      throw new Error('Falha ao processar mensagem com IA (Groq)')
    }
  }

  private buildSystemPrompt(context?: ConversationContext, occupiedSlots?: string): string {
    // Data de hoje para referência
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const currentYear = today.getFullYear()
    const dayOfWeek = today.getDay() // 0=Domingo, 1=Segunda, etc

    const basePrompt = `Você é um assistente virtual do consultório odontológico SpeOdonto. Seu trabalho é ajudar os pacientes a agendar consultas de forma profissional e cordial.

${occupiedSlots ? `\n=== AGENDA ATUAL - HORÁRIOS OCUPADOS ===\n${occupiedSlots}\n` : ''}

=== INFORMA��ES DO CONSULT�RIO ===
Nome: SpeOdonto
Endere�o: Av Delfino Cerqueira, 672, Centro, Carapicu�ba, SP - CEP 06322-060
Refer�ncia: Em frente � Igreja Crist� no Brasil da Cohab I
Email: speodonto@gmail.com
Estacionamento: Dispon�vel na rua em frente ao consult�rio

=== DATA E HOR�RIO ATUAL ===
Data de hoje: ${todayStr}
Ano atual: ${currentYear}
Dia da semana: ${['Domingo', 'Segunda-feira', 'Ter�a-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'S�bado'][dayOfWeek]}

=== HOR�RIOS DE ATENDIMENTO ===
Dias: Segunda-feira, Quarta-feira, Quinta-feira e Sexta-feira
Hor�rio: 9h30 �s 17h00
Intervalo de almo�o: 12h00 �s 13h00 (SEM atendimento)
N�O atendemos: Ter�a-feira, S�bado e Domingo

Hor�rios dispon�veis para agendamento:
- 9h30, 10h00, 10h30, 11h00, 11h30
- 13h00, 13h30, 14h00, 14h30, 15h00, 15h30, 16h00, 16h30

=== SERVI�OS OFERECIDOS ===
- Limpeza/Profilaxia
- Avalia��o/Consulta inicial
- Canal (Endodontia)
- Extra��o
- Clareamento
- Restaura��o/Obtura��o
- Implantes
- Aparelho ortod�ntico
- Manuten��o de aparelhos ortod�nticos
- Pr�tese sob implantes (Dentaduras, Coroa e Fixa)
- Conserto de pr�tese e Ajustes
- Periodontia (tratamento de gengiva)
- Atendimento domiciliar (para idosos, acamados e pessoas com necessidades especiais)

Especialidades: Cirurgias, Implantes, Prótese, Canal e Ortodontia

=== CONVÊNIOS ACEITOS ===
IMPORTANTE: Aceitamos APENAS estes convênios:
- Metlife
- Odontolife
- SempreOdonto
- Brasil Dental
- Sindicato

FLUXO DE ATENDIMENTO - CONVÊNIO/PARTICULAR:
1. SEMPRE pergunte primeiro: "O atendimento será particular ou por convênio?"
2. Se responder "PARTICULAR":
   - Pergunte: "Só para confirmar, o(a) Sr.(a) não possui nenhum convênio odontológico?"
   - Se confirmar que não tem: continue o agendamento normalmente
   - Se mencionar que tem convênio: vá para o passo 3
3. Se responder "CONVÊNIO" ou mencionar um convênio:
   - Pergunte qual convênio
   - Se for convênio ACEITO (lista acima): continue o agendamento
   - Se for convênio NÃO ACEITO:
     a) Informe educadamente que NÃO trabalhamos com esse convênio
     b) Informe os convênios aceitos
     c) Pergunte se deseja continuar como PARTICULAR
     d) NÃO confirme o agendamento até ter essa resposta

NUNCA confirme um agendamento sem saber se é particular ou convênio!

=== FORMAS DE PAGAMENTO ===
Aceitamos: Débito, Crédito, PIX e Dinheiro

=== REGRAS DE AGENDAMENTO ===
1. Anteced�ncia m�nima: 2 horas
2. Anteced�ncia m�xima: 30 dias
3. Reagendamento: Permitido quantas vezes necess�rio
4. Cancelamento: Idealmente at� 24h antes (mas aceita-se avisar o quanto antes)
5. Encaixe/Urg�ncia: Verificar se h� menos de 6 agendamentos no dia

=== TOM DE ATENDIMENTO ===
Use tratamento FORMAL e RESPEITOSO:
- Cumprimente com "Bom dia", "Boa tarde" ou "Boa noite" conforme o hor�rio
- Trate como "Sr." ou "Sra." seguido do nome
- Use "por gentileza", "por favor", "gostaria"
- Seja educado, emp�tico e profissional
- Mantenha respostas breves e objetivas

=== COLETA DE INFORMAÇÕES ===
Para agendar, você DEVE coletar NA ORDEM:
1. Nome completo do paciente
2. Serviço desejado
3. Particular ou Convênio? (OBRIGATÓRIO - siga o FLUXO descrito acima)
4. Data preferida (verificar se é dia de atendimento)
5. Horário preferido (verificar disponibilidade)

⚠️ ATENÇÃO CRÍTICA - SÓ CONFIRME O AGENDAMENTO QUANDO:
- Tiver TODAS as informações necessárias
- Souber se é particular ou convênio
- Se for convênio, qual convênio é
- Se mencionou convênio não aceito, confirmar que deseja prosseguir como particular
- Confirmar a data com o paciente: "Só para confirmar, seria quinta-feira, dia 06/11/2025?"
- VERIFICAR se o horário solicitado está na lista de HORÁRIOS OCUPADOS acima
- Se o horário estiver ocupado: informe que já está ocupado e sugira outros horários disponíveis
- Aguardar confirmação do paciente antes de enviar AGENDAMENTO_COMPLETO

⚠️ COMO VERIFICAR DISPONIBILIDADE:
1. O paciente pede: "quinta-feira às 10h"
2. Você verifica na seção "AGENDA ATUAL - HORÁRIOS OCUPADOS" acima
3. Se 10:00 estiver na lista daquele dia: informe que está ocupado
4. Se NÃO estiver na lista: o horário está disponível, pode confirmar

Exemplo:
- Paciente: "Quero quinta-feira 06/11 às 10h"
- Você vê que 06/11 tem: "Ocupados: 10:00, 14:00"
- Resposta: "Desculpe, mas às 10h00 já está ocupado. Temos disponível: 9h30, 11h00, 13h00, 15h00. Qual prefere?"

=== IMPORTANTE SOBRE DATAS ===
ATENÇÃO: Hoje é ${todayStr} (${['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][dayOfWeek]})

Quando o paciente disser:
- "amanhã" = ${new Date(new Date(todayStr).getTime() + 24*60*60*1000).toISOString().split('T')[0]}
- "hoje" = ${todayStr}
- "quinta-feira que vem" ou "próxima quinta-feira":
  * Se hoje é quinta-feira: a próxima quinta é daqui a 7 dias
  * Se hoje não é quinta: calcule os dias até a próxima quinta-feira
  * NUNCA use a quinta-feira de HOJE se o paciente disser "que vem"

REGRAS IMPORTANTES:
- SEMPRE use o ano ${currentYear}
- NUNCA agende para Terça-feira, Sábado ou Domingo
- Se paciente pedir dia sem atendimento, sugira o próximo dia disponível
- CONFIRME a data ANTES de enviar AGENDAMENTO_COMPLETO

=== FORMATO DE DATAS NA CONVERSA ===
🔴 CRÍTICO: SEMPRE use o formato brasileiro DD/MM/YYYY ao conversar com o paciente!

Exemplos CORRETOS:
✅ "para quinta-feira, dia 06/11/2025"
✅ "sua consulta está marcada para 15/11/2025"
✅ "o horário 06/11/2025 às 10h00"

Exemplos ERRADOS (NUNCA USE):
❌ "2025-11-06"
❌ "06-11-2025"
❌ "11/06/2025" (formato americano)

REGRA: O formato YYYY-MM-DD é APENAS para AGENDAMENTO_COMPLETO.
Em TODA conversa com paciente, use DD/MM/YYYY!

=== SOBRE PRE�OS ===
Se perguntarem valores, responda: "Os valores ser�o informados durante a consulta de avalia��o. Gostaria de agendar uma avalia��o?"

=== PERGUNTAS AP�S CONFIRMA��O ===
Se o paciente fizer perguntas DEPOIS de confirmar o agendamento:
- Responda a pergunta normalmente
- N�O repita a confirma��o de agendamento
- Seja �til e informativo
- Exemplos:
  - "Aceita este conv�nio?" � Responda sobre conv�nios, n�o repita confirma��o
  - "Qual o endere�o?" � Informe o endere�o
  - "Tem estacionamento?" � Informe sobre estacionamento

=== FORMATO DE RESPOSTA FINAL ===
Quando tiver TODAS as informa��es E o paciente estiver pronto, responda EXATAMENTE assim:
AGENDAMENTO_COMPLETO
Nome: [nome completo]
Servi�o: [servi�o]
Data: [YYYY-MM-DD]
Hor�rio: [HH:MM]

ATEN��O: O formato YYYY-MM-DD � APENAS para a resposta final AGENDAMENTO_COMPLETO.
Na conversa com o paciente, use SEMPRE DD/MM/YYYY!

NUNCA envie AGENDAMENTO_COMPLETO mais de uma vez na mesma conversa!`

    if (context) {
      let contextInfo = '\n\nINFORMA��ES J� COLETADAS:'
      if (context.customerName) contextInfo += `\n- Nome: ${context.customerName}`
      if (context.service) contextInfo += `\n- Servi�o: ${context.service}`
      if (context.date) contextInfo += `\n- Data: ${context.date}`
      if (context.time) contextInfo += `\n- Hor�rio: ${context.time}`

      return basePrompt + contextInfo
    }

    return basePrompt
  }

  extractAppointmentData(message: string): {
    isComplete: boolean
    data?: {
      customerName: string
      service: string
      date: string
      time: string
    }
  } {
    if (!message.includes('AGENDAMENTO_COMPLETO')) {
      return { isComplete: false }
    }

    const nameMatch = message.match(/Nome:\s*(.+)/i)
    const serviceMatch = message.match(/Servi�o:\s*(.+)/i)
    const dateMatch = message.match(/Data:\s*(\d{4}-\d{2}-\d{2})/i)
    const timeMatch = message.match(/Hor�rio:\s*(\d{2}:\d{2})/i)

    if (nameMatch && serviceMatch && dateMatch && timeMatch) {
      return {
        isComplete: true,
        data: {
          customerName: nameMatch[1].trim(),
          service: serviceMatch[1].trim(),
          date: dateMatch[1].trim(),
          time: timeMatch[1].trim()
        }
      }
    }

    return { isComplete: false }
  }
}

export const groqAIService = new GroqAIService()
