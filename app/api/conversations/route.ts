import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: {
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    const formattedConversations = conversations.map(conv => {
      const lastMessage = conv.messages[0]
      const context = conv.context as any

      return {
        id: conv.id,
        phoneNumber: conv.phoneNumber,
        customerName: context?.customerName || null,
        lastMessage: lastMessage?.content || 'Sem mensagens',
        lastMessageAt: lastMessage?.timestamp || conv.createdAt,
        messageCount: conv._count.messages,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      }
    })

    return NextResponse.json({
      success: true,
      conversations: formattedConversations
    })
  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar conversas' },
      { status: 500 }
    )
  }
}
