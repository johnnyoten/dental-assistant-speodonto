import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function checkAuth(request: NextRequest): boolean {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  return token === process.env.ADMIN_TOKEN
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Total de agendamentos
    const totalAppointments = await prisma.appointment.count()

    // Agendamentos este mês
    const appointmentsThisMonth = await prisma.appointment.count({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    })

    // Agendamentos por status
    const appointmentsByStatus = await prisma.appointment.groupBy({
      by: ['status'],
      _count: true
    })

    // Serviços mais solicitados
    const topServices = await prisma.appointment.groupBy({
      by: ['service'],
      _count: true,
      orderBy: {
        _count: {
          service: 'desc'
        }
      },
      take: 5
    })

    // Horários mais populares
    const popularTimes = await prisma.appointment.groupBy({
      by: ['time'],
      _count: true,
      orderBy: {
        _count: {
          time: 'desc'
        }
      },
      take: 5
    })

    // Agendamentos dos próximos 7 dias
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: now,
          lte: nextWeek
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ],
      take: 10
    })

    // Total de conversas
    const totalConversations = await prisma.conversation.count()

    return NextResponse.json({
      totalAppointments,
      appointmentsThisMonth,
      appointmentsByStatus: appointmentsByStatus.map(item => ({
        status: item.status,
        count: item._count
      })),
      topServices: topServices.map(item => ({
        service: item.service,
        count: item._count
      })),
      popularTimes: popularTimes.map(item => ({
        time: item.time,
        count: item._count
      })),
      upcomingAppointments,
      totalConversations
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
