import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Buscar todos os horários bloqueados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    // Verificar autenticação
    if (token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Construir filtros
    const where: any = {}

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const blockedSlots = await prisma.blockedTimeSlot.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json(blockedSlots)
  } catch (error) {
    console.error('Erro ao buscar horários bloqueados:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Criar novo horário bloqueado
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    // Verificar autenticação
    if (token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { date, startTime, endTime, reason } = body

    // Validar campos obrigatórios
    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Date, startTime e endTime são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar formato de horário (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: 'Formato de horário inválido. Use HH:MM' },
        { status: 400 }
      )
    }

    // Validar que startTime é antes de endTime
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'Horário de início deve ser antes do horário de término' },
        { status: 400 }
      )
    }

    // Converter data para DateTime
    const dateObj = new Date(date)

    // Criar horário bloqueado
    const blockedSlot = await prisma.blockedTimeSlot.create({
      data: {
        date: dateObj,
        startTime,
        endTime,
        reason: reason || null
      }
    })

    return NextResponse.json(blockedSlot, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar horário bloqueado:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
