import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { zapiService } from '@/lib/zapi-service'
import { groqAIService } from '@/lib/ai-service-groq'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Tipos Z-API (estrutura real da Z-API)
interface ZApiWebhook {
  instanceId: string
  phone: string
  fromMe: boolean
  momment: number
  status: string
  chatName: string
  senderPhoto: string | null
  senderName: string
  participantPhone?: string
  photo: string
  broadcast: boolean
  type: string
  text?: {
    message: string
  }
  image?: {
    caption?: string
    imageUrl: string
  }
  messageId: string
  connectedPhone: string
  waitingMessage: boolean
  isStatusReply?: boolean
  chatLid?: string
  isEdit?: boolean
  isGroup?: boolean
  isNewsletter?: boolean
  participantLid?: string | null
  forwarded?: boolean
  fromApi?: boolean
}

/**
 * POST - Recebe mensagens do Z-API
 */
export async function POST(request: NextRequest) {
  try {
    const body: ZApiWebhook = await request.json()

    console.log('📱 Webhook Z-API recebido:', JSON.stringify(body, null, 2))

    // Validar client token (segurança)
    const clientToken = request.headers.get('client-token')
    if (clientToken && !zapiService.validateWebhook(clientToken)) {
      console.error('❌ Client token inválido')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ignorar mensagens enviadas por nós
    if (body.fromMe) {
      console.log('⏭️ Mensagem enviada por nós, ignorando')
      return NextResponse.json({ status: 'ignored', reason: 'fromMe' })
    }

    // Ignorar se não for mensagem recebida (type: ReceivedCallback)
    if (body.type !== 'ReceivedCallback') {
      console.log('⏭️ Tipo ignorado:', body.type)
      return NextResponse.json({ status: 'ignored', reason: 'not_received_callback' })
    }

    // Ignorar mensagens que ainda estão sendo carregadas (waitingMessage)
    if (body.waitingMessage) {
      console.log('⏭️ Mensagem ainda carregando (waitingMessage: true), aguardando...')
      return NextResponse.json({ status: 'ignored', reason: 'waiting_message' })
    }

    const messageData = body

    // Log completo para debug
    console.log('🔍 Tipos de conteúdo disponíveis:', {
      hasText: !!messageData.text,
      hasImage: !!messageData.image,
      hasAudio: !!(messageData as any).audio,
      hasVideo: !!(messageData as any).video,
      hasDocument: !!(messageData as any).document,
      allKeys: Object.keys(messageData)
    })

    // Extrair texto da mensagem
    let messageText = ''
    if (messageData.text?.message) {
      messageText = messageData.text.message
    } else if (messageData.image?.caption) {
      messageText = messageData.image.caption
    } else {
      console.log('⏭️ Mensagem sem texto, ignorando. Body completo:', JSON.stringify(body, null, 2))
      return NextResponse.json({ status: 'ignored', reason: 'no_text' })
    }

    const phoneNumber = messageData.phone
    const senderName = messageData.senderName || messageData.chatName || 'Cliente'

    console.log(`💬 Mensagem de ${senderName} (${phoneNumber}): ${messageText}`)

    // Buscar ou criar conversa
    let conversation = await prisma.conversation.findFirst({
      where: { phoneNumber },
      include: { messages: true }
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          phoneNumber,
          context: { name: senderName },
          status: 'ACTIVE'
        },
        include: { messages: true }
      })
      console.log('✅ Nova conversa criada:', conversation.id)
    }

    // Salvar mensagem do usuário
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: messageText
      }
    })

    // Preparar histórico de mensagens para a IA
    const messageHistory = conversation.messages.map((m) => ({
      role: m.role.toLowerCase() as 'user' | 'assistant' | 'system',
      content: m.content
    }))

    // Adicionar nova mensagem do usuário
    messageHistory.push({
      role: 'user',
      content: messageText
    })

    // Obter contexto da conversa
    const context = (conversation.context as any) || {}

    // Processar com IA Groq
    console.log('🤖 Processando com Groq...')
    const aiResponse = await groqAIService.chat(messageHistory, context)

    console.log('🤖 Resposta Groq:', aiResponse)

    // Salvar resposta da IA
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: aiResponse
      }
    })

    // Verificar se o agendamento foi completado
    const appointmentData = groqAIService.extractAppointmentData(aiResponse)

    if (appointmentData.isComplete && appointmentData.data) {
      try {
        // Verificar se esta conversa já criou um agendamento
        const existingAppointment = await prisma.appointment.findFirst({
          where: {
            conversationId: conversation.id,
            status: {
              not: 'CANCELLED'
            }
          }
        })

        if (existingAppointment) {
          console.log('⚠️ Esta conversa já tem um agendamento criado!')
          return NextResponse.json({
            status: 'already_scheduled',
            message: 'Agendamento já criado para esta conversa'
          })
        }

        const appointmentDate = new Date(appointmentData.data.date)
        const appointmentTime = appointmentData.data.time

        // Verificar se já existe agendamento para este horário (outro paciente)
        const conflictingAppointment = await prisma.appointment.findFirst({
          where: {
            date: appointmentDate,
            time: appointmentTime,
            status: {
              not: 'CANCELLED'
            }
          }
        })

        if (conflictingAppointment) {
          console.log('⚠️ Conflito de horário detectado!')
          const conflictMessage =
            `Desculpe, mas já existe um agendamento para ${appointmentDate.toLocaleDateString('pt-BR')} às ${appointmentTime}.\n\n` +
            `Por gentileza, escolha outro horário disponível.`

          await zapiService.sendText({
            phone: phoneNumber,
            message: conflictMessage
          })

          return NextResponse.json({
            status: 'conflict',
            message: 'Horário já ocupado'
          })
        }

        // Criar agendamento
        const appointment = await prisma.appointment.create({
          data: {
            customerName: appointmentData.data.customerName,
            customerPhone: phoneNumber,
            service: appointmentData.data.service,
            date: appointmentDate,
            time: appointmentTime,
            duration: 60, // Duração padrão: 1 hora
            status: 'CONFIRMED',
            conversationId: conversation.id
          }
        })

        console.log('📅 Agendamento criado:', appointment.id)

        // Fecha conversa
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { status: 'CLOSED' }
        })

        // Envia mensagem de confirmação limpa
        const confirmationMessage =
          `✅ Agendamento confirmado!\n\n` +
          `📋 Resumo:\n` +
          `Nome: ${appointmentData.data.customerName}\n` +
          `Serviço: ${appointmentData.data.service}\n` +
          `Data: ${new Date(appointmentData.data.date).toLocaleDateString('pt-BR')}\n` +
          `Horário: ${appointmentData.data.time}\n\n` +
          `Nos vemos em breve! 😊`

        const zapiConfirmation = await zapiService.sendText({
          phone: phoneNumber,
          message: confirmationMessage
        })
        console.log('📨 Resposta confirmação Z-API:', JSON.stringify(zapiConfirmation, null, 2))
      } catch (error) {
        console.error('❌ Erro ao criar agendamento:', error)
        // Se erro, envia resposta normal da IA
        await zapiService.sendText({
          phone: phoneNumber,
          message: aiResponse
        })
      }
    } else {
      // Enviar resposta da IA via Z-API
      console.log('📤 Enviando resposta via Z-API...')
      const zapiResponse = await zapiService.sendText({
        phone: phoneNumber,
        message: aiResponse
      })
      console.log('📨 Resposta do Z-API:', JSON.stringify(zapiResponse, null, 2))
    }

    console.log('✅ Resposta enviada com sucesso!')

    return NextResponse.json({
      status: 'success',
      message: 'Mensagem processada',
      conversationId: conversation.id
    })
  } catch (error) {
    console.error('❌ Erro ao processar webhook Z-API:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET - Verificação de status (útil para testes)
 */
export async function GET() {
  try {
    const status = await zapiService.getStatus()
    return NextResponse.json({
      status: 'webhook_active',
      zapiStatus: status
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Z-API service unavailable' },
      { status: 503 }
    )
  }
}
