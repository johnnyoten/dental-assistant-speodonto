// Serviço Z-API para WhatsApp
import axios from 'axios'

const ZAPI_URL = process.env.ZAPI_URL || 'https://api.z-api.io'
const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE_ID
const ZAPI_TOKEN = process.env.ZAPI_TOKEN

interface SendMessageParams {
  phone: string
  message: string
}

interface SendMessageResponse {
  zaapId: string
  messageId: string
  id: string
}

class ZApiService {
  private baseURL: string
  private headers: Record<string, string>
  private isConfigured: boolean

  constructor() {
    this.isConfigured = !!(ZAPI_INSTANCE && ZAPI_TOKEN)

    this.baseURL = this.isConfigured
      ? `${ZAPI_URL}/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}`
      : ''

    this.headers = {
      'Content-Type': 'application/json',
      'Client-Token': process.env.ZAPI_CLIENT_TOKEN || ''
    }
  }

  private checkConfig() {
    if (!this.isConfigured) {
      throw new Error('Z-API credentials not configured. Please set ZAPI_INSTANCE_ID and ZAPI_TOKEN in .env')
    }
  }

  /**
   * Enviar mensagem de texto
   */
  async sendText(params: SendMessageParams): Promise<SendMessageResponse> {
    this.checkConfig()

    try {
      const response = await axios.post(
        `${this.baseURL}/send-text`,
        {
          phone: this.formatPhone(params.phone),
          message: params.message
        },
        { headers: this.headers }
      )

      return response.data
    } catch (error) {
      console.error('Erro ao enviar mensagem Z-API:', error)
      throw error
    }
  }

  /**
   * Enviar mensagem com botões
   */
  async sendButtonMessage(
    phone: string,
    message: string,
    buttons: { id: string; label: string }[]
  ) {
    try {
      const response = await axios.post(
        `${this.baseURL}/send-button-message`,
        {
          phone: this.formatPhone(phone),
          message: message,
          buttons: buttons.map((btn) => ({
            id: btn.id,
            label: btn.label
          }))
        },
        { headers: this.headers }
      )

      return response.data
    } catch (error) {
      console.error('Erro ao enviar mensagem com botões:', error)
      throw error
    }
  }

  /**
   * Enviar lista de opções
   */
  async sendListMessage(
    phone: string,
    title: string,
    description: string,
    buttonText: string,
    sections: { title: string; rows: { id: string; title: string; description?: string }[] }[]
  ) {
    try {
      const response = await axios.post(
        `${this.baseURL}/send-list-message`,
        {
          phone: this.formatPhone(phone),
          title,
          description,
          buttonText,
          sections
        },
        { headers: this.headers }
      )

      return response.data
    } catch (error) {
      console.error('Erro ao enviar lista:', error)
      throw error
    }
  }

  /**
   * Verificar status da instância
   */
  async getStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/status`, {
        headers: this.headers
      })

      return response.data
    } catch (error) {
      console.error('Erro ao verificar status Z-API:', error)
      throw error
    }
  }

  /**
   * Formatar número de telefone (adicionar código do país se necessário)
   */
  private formatPhone(phone: string): string {
    // Remove caracteres não numéricos
    let cleanPhone = phone.replace(/\D/g, '')

    // Se não começar com código do país, adiciona 55 (Brasil)
    if (!cleanPhone.startsWith('55') && cleanPhone.length <= 11) {
      cleanPhone = '55' + cleanPhone
    }

    return cleanPhone
  }

  /**
   * Validar webhook (opcional - para segurança)
   */
  validateWebhook(clientToken: string): boolean {
    const expectedToken = process.env.ZAPI_CLIENT_TOKEN
    if (!expectedToken) return true // Se não configurado, aceita qualquer um

    return clientToken === expectedToken
  }
}

// Exportar instância única
export const zapiService = new ZApiService()
