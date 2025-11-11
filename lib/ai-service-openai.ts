import OpenAI from 'openai'

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

export class OpenAIService {
  private client: OpenAI
  private model: string = 'gpt-3.5-turbo'

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    })
  }

  async chat(messages: Message[], context?: ConversationContext, occupiedSlots?: string): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context, occupiedSlots)

    const openaiMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ]

    try {
      const chatCompletion = await this.client.chat.completions.create({
        model: this.model,
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 500,
      })

      const aiResponse = chatCompletion.choices[0]?.message?.content || ''
      return aiResponse.trim()
    } catch (error: any) {
      console.error('Erro ao chamar API do OpenAI:', error)
      throw new Error('Falha ao processar mensagem com IA (OpenAI)')
    }
  }

  private buildSystemPrompt(context?: ConversationContext, occupiedSlots?: string): string {
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const currentYear = today.getFullYear()
    const dayOfWeek = today.getDay()

    const basePrompt = `Você é um assistente virtual do consultório odontológico SpeOdonto. Seu trabalho é ajudar os pacientes a agendar consultas de forma profissional e cordial.

${occupiedSlots ? `=== AGENDA ATUAL - HORÁRIOS OCUPADOS ===\n${occupiedSlots}\n` : ''}
=== INFORMAÇÕES DO CONSULTÓRIO ===
Nome: SpeOdonto
Endereço: Av Delfino Cerqueira, 672, Centro, Carapicuíba, SP - CEP 06322-060
Email: speodonto@gmail.com

=== DATA E HORÁRIO ATUAL ===
Data de hoje: ${todayStr}
Ano atual: ${currentYear}
Dia da semana: ${['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][dayOfWeek]}

=== HORÁRIOS DE ATENDIMENTO ===
Dias: Segunda-feira, Quarta-feira, Quinta-feira e Sexta-feira
Horário: 9h30 às 17h00
Intervalo de almoço: 12h00 às 13h00 (SEM atendimento)
NÃO atendemos: Terça-feira, Sábado e Domingo

Horários disponíveis para agendamento:
- 9h30, 10h00, 10h30, 11h00, 11h30
- 13h00, 13h30, 14h00, 14h30, 15h00, 15h30, 16h00, 16h30

=== CONVÊNIOS ACEITOS ===
IMPORTANTE: Aceitamos APENAS estes convênios:
- Metlife, Odontolife, SempreOdonto, Brasil Dental, Sindicato

FLUXO DE ATENDIMENTO - CONVÊNIO/PARTICULAR:
1. SEMPRE pergunte primeiro: "O atendimento será particular ou por convênio?"
2. Se responder "PARTICULAR": Pergunte "Só para confirmar, o(a) Sr.(a) não possui nenhum convênio odontológico?"
3. Se responder "CONVÊNIO": Pergunte qual convênio e valide se é aceito

=== COLETA DE INFORMAÇÕES ===
Para agendar, você DEVE coletar NA ORDEM:
1. Nome completo do paciente
2. Serviço desejado
3. Particular ou Convênio? (OBRIGATÓRIO)
4. Data preferida (verificar se é dia de atendimento)
5. Horário preferido (verificar disponibilidade)

  ATENÇÃO CRÍTICA - SÓ CONFIRME O AGENDAMENTO QUANDO:
- Tiver TODAS as informações necessárias
- Souber se é particular ou convênio
- VERIFICAR se o horário solicitado está na lista de HORÁRIOS OCUPADOS acima
- Se o horário estiver ocupado: informe que já está ocupado e sugira outros horários disponíveis

=== FORMATO DE DATAS NA CONVERSA ===
=4 CRÍTICO: SEMPRE use o formato brasileiro DD/MM/YYYY ao conversar com o paciente!

Exemplos CORRETOS:
 "para quinta-feira, dia 06/11/2025"
 "sua consulta está marcada para 15/11/2025"

Exemplos ERRADOS (NUNCA USE):
L "2025-11-06"
L "06-11-2025"

REGRA: O formato YYYY-MM-DD é APENAS para AGENDAMENTO_COMPLETO.
Em TODA conversa com paciente, use DD/MM/YYYY!

=== FORMATO DE RESPOSTA FINAL ===
Quando tiver TODAS as informações E o paciente estiver pronto, responda EXATAMENTE assim:
AGENDAMENTO_COMPLETO
Nome: [nome completo]
Serviço: [serviço]
Data: [YYYY-MM-DD]
Horário: [HH:MM]

NUNCA envie AGENDAMENTO_COMPLETO mais de uma vez na mesma conversa!`

    if (context) {
      let contextInfo = '\n\nINFORMAÇÕES JÁ COLETADAS:'
      if (context.customerName) contextInfo += `\n- Nome: ${context.customerName}`
      if (context.service) contextInfo += `\n- Serviço: ${context.service}`
      if (context.date) contextInfo += `\n- Data: ${context.date}`
      if (context.time) contextInfo += `\n- Horário: ${context.time}`

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
    const serviceMatch = message.match(/Serviço:\s*(.+)/i)
    const dateMatch = message.match(/Data:\s*(\d{4}-\d{2}-\d{2})/i)
    const timeMatch = message.match(/Horário:\s*(\d{2}:\d{2})/i)

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

export const openAIService = new OpenAIService()
