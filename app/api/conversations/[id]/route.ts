import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: params.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversa não encontrada' },
        { status: 404 }
      )
    }

    const context = conversation.context as any

    const formattedConversation = {
      id: conversation.id,
      phoneNumber: conversation.phoneNumber,
      customerName: context?.customerName || null,
      service: context?.service || null,
      date: context?.date || null,
      time: context?.time || null,
      messages: conversation.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt
      })),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    }

    return NextResponse.json({
      success: true,
      conversation: formattedConversation
    })
  } catch (error) {
    console.error('Erro ao buscar conversa:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar conversa' },
      { status: 500 }
    )
  }
}
