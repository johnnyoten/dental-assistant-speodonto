import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // YYYY-MM
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    // Verificar autenticação
    if (token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Se não passar mês, pega o mês atual
    let year: number
    let monthNum: number

    if (month) {
      const [yearStr, monthStr] = month.split('-')
      year = parseInt(yearStr)
      monthNum = parseInt(monthStr) - 1 // JavaScript mês é 0-indexed
    } else {
      const now = new Date()
      year = now.getFullYear()
      monthNum = now.getMonth()
    }

    // Primeiro e último dia do mês (em UTC para evitar problemas de timezone)
    const firstDay = new Date(Date.UTC(year, monthNum, 1, 0, 0, 0))
    const lastDay = new Date(Date.UTC(year, monthNum + 1, 0, 23, 59, 59))

    console.log('📅 Buscando agendamentos entre:', firstDay.toISOString(), 'e', lastDay.toISOString())

    // Buscar agendamentos do mês
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: firstDay,
          lte: lastDay
        }
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ],
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        service: true,
        date: true,
        time: true,
        duration: true,
        status: true,
        notes: true
      }
    })

    console.log(`📊 Encontrados ${appointments.length} agendamentos`)
    appointments.forEach(apt => {
      console.log(`  - ${apt.customerName}: ${apt.date.toISOString()} às ${apt.time}`)
    })

    // Agrupar por data
    const appointmentsByDate: Record<string, typeof appointments> = {}

    appointments.forEach(apt => {
      // Usar a data UTC diretamente (já está no formato correto no banco)
      const dateKey = apt.date.toISOString().split('T')[0]
      console.log(`🔑 Agrupando ${apt.customerName} na data: ${dateKey}`)
      if (!appointmentsByDate[dateKey]) {
        appointmentsByDate[dateKey] = []
      }
      appointmentsByDate[dateKey].push(apt)
    })

    console.log('📋 Agendamentos agrupados:', Object.keys(appointmentsByDate))

    return NextResponse.json({
      year,
      month: monthNum + 1,
      appointments: appointmentsByDate,
      total: appointments.length
    })
  } catch (error) {
    console.error('Erro ao buscar calendário:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
