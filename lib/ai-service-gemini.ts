import axios from 'axios'

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

export class GeminiAIService {
  private apiKey: string
  private apiUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || ''
  }

  async chat(messages: Message[], context?: ConversationContext): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context)

    // Converte mensagens para formato do Gemini
    const conversationHistory = messages
      .map(msg => {
        if (msg.role === 'user') {
          return `Usuário: ${msg.content}`
        } else if (msg.role === 'assistant') {
          return `Assistente: ${msg.content}`
        }
        return ''
      })
      .filter(m => m)
      .join('\n\n')

    const fullPrompt = `${systemPrompt}\n\n${conversationHistory}\n\nAssistente:`

    try {
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        }
      )

      const aiResponse = response.data.candidates[0].content.parts[0].text
      return aiResponse.trim()
    } catch (error) {
      console.error('Erro ao chamar API do Gemini:', error)
      throw new Error('Falha ao processar mensagem com IA')
    }
  }

  private buildSystemPrompt(context?: ConversationContext): string {
    // Data de hoje para referência
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const currentYear = today.getFullYear()

    const basePrompt = `Você é um assistente virtual de um consultório odontológico. Seu trabalho é ajudar os pacientes a agendar consultas de forma natural e amigável.

DATA DE HOJE: ${todayStr}
ANO ATUAL: ${currentYear}

REGRAS IMPORTANTES:
1. Seja educado, empático e profissional
2. Colete as seguintes informações para agendamento:
   - Nome completo do paciente
   - Serviço desejado (limpeza, canal, extração, avaliação, clareamento, etc)
   - Data preferida
   - Horário preferido

3. Horários disponíveis: Segunda a Sexta, 8h às 18h (intervalos de 1 hora)
4. Confirme todos os dados antes de finalizar
5. Seja breve e objetivo nas respostas
6. Se o paciente perguntar sobre preços, diga que o dentista informará na consulta
7. Quando todas as informações estiverem coletadas, confirme o agendamento

IMPORTANTE SOBRE DATAS:
- Se o paciente disser "amanhã", calcule a data de amanhã a partir de hoje (${todayStr})
- Se o paciente disser "hoje", use a data de hoje (${todayStr})
- Se o paciente disser "segunda-feira", "terça", etc, calcule a próxima ocorrência dessa data
- SEMPRE use o ano atual (${currentYear}) nas datas
- NUNCA use datas de anos passados

FORMATO DE RESPOSTA FINAL:
Quando tiver todas as informações, responda EXATAMENTE assim:
AGENDAMENTO_COMPLETO
Nome: [nome]
Serviço: [serviço]
Data: [data no formato YYYY-MM-DD]
Horário: [horário no formato HH:00]`

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

export const geminiAIService = new GeminiAIService()
