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

  constructor() {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY || ''
    })
  }

  async chat(messages: Message[], context?: ConversationContext): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context)

    // Converte mensagens para formato do Groq (compat�vel com OpenAI)
    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ]

    try {
      const chatCompletion = await this.client.chat.completions.create({
        messages: groqMessages,
        model: this.model,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        stream: false
      })

      const aiResponse = chatCompletion.choices[0]?.message?.content || ''
      return aiResponse.trim()
    } catch (error) {
      console.error('Erro ao chamar API do Groq:', error)
      throw new Error('Falha ao processar mensagem com IA (Groq)')
    }
  }

  private buildSystemPrompt(context?: ConversationContext): string {
    // Data de hoje para refer�ncia
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const currentYear = today.getFullYear()
    const dayOfWeek = today.getDay() // 0=Domingo, 1=Segunda, etc

    const basePrompt = `Voc� � um assistente virtual do consult�rio odontol�gico SpeOdonto. Seu trabalho � ajudar os pacientes a agendar consultas de forma profissional e cordial.

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

Especialidades: Cirurgias, Implantes, Pr�tese, Canal e Ortodontia

=== CONV�NIOS ACEITOS ===
IMPORTANTE: Aceitamos APENAS estes conv�nios:
- Metlife
- Odontolife
- SempreOdonto
- Brasil Dental
- Sindicato

Se o paciente mencionar outro conv�nio (como Bradesco, Amil, Unimed, etc):
1. Informe educadamente que N�O trabalhamos com esse conv�nio
2. Informe os conv�nios aceitos
3. Pergunte se deseja continuar como PARTICULAR
4. N�O confirme o agendamento at� ter essa resposta

=== FORMAS DE PAGAMENTO ===
Aceitamos: D�bito, Cr�dito, PIX e Dinheiro

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

=== COLETA DE INFORMA��ES ===
Para agendar, voc� DEVE coletar:
1. Nome completo do paciente
2. Servi�o desejado
3. Data preferida (verificar se � dia de atendimento)
4. Hor�rio preferido (verificar disponibilidade)
5. Se possui conv�nio:
   - Se mencionar conv�nio N�O aceito: informar e perguntar se continua
   - Se mencionar conv�nio aceito: confirmar e continuar
   - Se n�o tiver conv�nio: continuar normalmente

ATEN��O: S� confirme o agendamento quando:
- Tiver TODAS as informa��es necess�rias
- Se mencionou conv�nio n�o aceito, confirmar que deseja prosseguir como particular

=== IMPORTANTE SOBRE DATAS ===
- Se disser "amanh�": calcule a partir de hoje (${todayStr})
- Se disser "hoje": use ${todayStr}
- Se disser dia da semana: calcule a pr�xima ocorr�ncia
- SEMPRE use o ano ${currentYear}
- NUNCA agende para Ter�a-feira, S�bado ou Domingo
- Se paciente pedir dia sem atendimento, sugira o pr�ximo dia dispon�vel

=== FORMATO DE DATAS NA CONVERSA ===
IMPORTANTE: Ao CONVERSAR com o paciente, SEMPRE use o formato brasileiro DD/MM/YYYY
Exemplos:
- Correto: "para quinta-feira, dia 06/11/2025"
- Correto: "sua consulta est� marcada para 15/11/2025"
- ERRADO: "2025-11-06" (nunca use este formato ao falar com o paciente)

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
