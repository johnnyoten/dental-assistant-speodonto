import axios from 'axios'

export class WhatsAppService {
  private apiToken: string
  private phoneNumberId: string
  private apiUrl: string

  constructor() {
    this.apiToken = process.env.WHATSAPP_API_TOKEN || ''
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || ''
    this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`
  }

  async sendMessage(to: string, message: string): Promise<void> {
    try {
      await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error)
      throw new Error('Falha ao enviar mensagem')
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      await axios.post(
        this.apiUrl,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
    } catch (error) {
      console.error('Erro ao marcar mensagem como lida:', error)
    }
  }
}

export const whatsappService = new WhatsAppService()
