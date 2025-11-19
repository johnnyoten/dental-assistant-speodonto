import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Listar todos os dias bloqueados
export async function GET(request: NextRequest) {
  try {
    const blockedDates = await prisma.blockedDate.findMany({
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      blockedDates: blockedDates.map(bd => ({
        id: bd.id,
        date: bd.date.toISOString().split('T')[0],
        reason: bd.reason,
        createdAt: bd.createdAt
      }))
    })
  } catch (error) {
    console.error('Erro ao buscar dias bloqueados:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar dias bloqueados' },
      { status: 500 }
    )
  }
}

// POST - Bloquear um dia
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, reason } = body

    if (!date) {
      return NextResponse.json(
        { success: false, error: 'Data e obrigatoria' },
        { status: 400 }
      )
    }

    // Converter para data sem timezone
    const dateObj = new Date(date + 'T00:00:00.000Z')

    // Verificar se ja esta bloqueado
    const existing = await prisma.blockedDate.findUnique({
      where: { date: dateObj }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Esta data ja esta bloqueada' },
        { status: 400 }
      )
    }

    const blockedDate = await prisma.blockedDate.create({
      data: {
        date: dateObj,
        reason: reason || null
      }
    })

    return NextResponse.json({
      success: true,
      blockedDate: {
        id: blockedDate.id,
        date: blockedDate.date.toISOString().split('T')[0],
        reason: blockedDate.reason,
        createdAt: blockedDate.createdAt
      }
    })
  } catch (error) {
    console.error('Erro ao bloquear dia:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao bloquear dia' },
      { status: 500 }
    )
  }
}

// DELETE - Desbloquear um dia
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const id = searchParams.get('id')

    if (!date && !id) {
      return NextResponse.json(
        { success: false, error: 'Data ou ID e obrigatorio' },
        { status: 400 }
      )
    }

    if (id) {
      await prisma.blockedDate.delete({
        where: { id }
      })
    } else if (date) {
      const dateObj = new Date(date + 'T00:00:00.000Z')
      await prisma.blockedDate.delete({
        where: { date: dateObj }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Dia desbloqueado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao desbloquear dia:', error)
    return NextResponse.json(
      { success: false, error: 'Erro ao desbloquear dia' },
      { status: 500 }
    )
  }
}
