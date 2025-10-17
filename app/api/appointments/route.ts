import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema de validação
const appointmentSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  service: z.string().min(1),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  duration: z.number().min(15).max(480).optional(), // 15 min a 8 horas
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional()
})

// Função para verificar conflito de horários
async function checkTimeConflict(
  date: Date,
  time: string,
  duration: number,
  excludeId?: string
): Promise<boolean> {
  const [hours, minutes] = time.split(':').map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + duration

  // Buscar agendamentos no mesmo dia (exceto cancelados)
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      date: date,
      status: {
        not: 'CANCELLED'
      },
      ...(excludeId ? { id: { not: excludeId } } : {})
    },
    select: {
      id: true,
      time: true,
      duration: true
    }
  })

  // Verificar sobreposição de horários
  for (const apt of existingAppointments) {
    const [aptHours, aptMinutes] = apt.time.split(':').map(Number)
    const aptStartMinutes = aptHours * 60 + aptMinutes
    const aptEndMinutes = aptStartMinutes + apt.duration

    // Verifica se há sobreposição
    const hasOverlap = (
      (startMinutes >= aptStartMinutes && startMinutes < aptEndMinutes) || // Inicia durante outro agendamento
      (endMinutes > aptStartMinutes && endMinutes <= aptEndMinutes) || // Termina durante outro agendamento
      (startMinutes <= aptStartMinutes && endMinutes >= aptEndMinutes) // Engloba outro agendamento
    )

    if (hasOverlap) {
      return true // Há conflito
    }
  }

  return false // Sem conflito
}

// Middleware de autenticação simples
function checkAuth(request: NextRequest): boolean {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  return token === process.env.ADMIN_TOKEN
}

// GET - Lista todos os agendamentos
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')

    const where: any = {}

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Cria novo agendamento
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = appointmentSchema.parse(body)

    const appointmentDate = new Date(data.date)
    const duration = data.duration || 30 // Padrão: 30 minutos

    // Verificar conflito de horários
    const hasConflict = await checkTimeConflict(
      appointmentDate,
      data.time,
      duration
    )

    if (hasConflict) {
      return NextResponse.json(
        {
          error: 'Conflito de horário',
          message: 'Já existe um agendamento neste horário. Por favor, escolha outro horário.'
        },
        { status: 409 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        service: data.service,
        date: appointmentDate,
        time: data.time,
        duration: duration,
        notes: data.notes,
        status: data.status || 'CONFIRMED'
      }
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar agendamento:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
