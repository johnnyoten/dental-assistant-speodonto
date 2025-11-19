import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const dynamicParams = true

const updateSchema = z.object({
  customerName: z.string().min(1).optional(),
  customerPhone: z.string().min(1).optional(),
  service: z.string().min(1).optional(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  duration: z.number().min(15).max(480).optional(),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional()
})

function checkAuth(request: NextRequest): boolean {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  return token === process.env.ADMIN_TOKEN
}

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

  for (const apt of existingAppointments) {
    const [aptHours, aptMinutes] = apt.time.split(':').map(Number)
    const aptStartMinutes = aptHours * 60 + aptMinutes
    const aptEndMinutes = aptStartMinutes + apt.duration

    const hasOverlap = (
      (startMinutes >= aptStartMinutes && startMinutes < aptEndMinutes) ||
      (endMinutes > aptStartMinutes && endMinutes <= aptEndMinutes) ||
      (startMinutes <= aptStartMinutes && endMinutes >= aptEndMinutes)
    )

    if (hasOverlap) {
      return true
    }
  }

  return false
}

// GET - Busca um agendamento específico
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: context.params.id },
      include: {
        conversation: {
          include: {
            messages: true
          }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Atualiza um agendamento
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = updateSchema.parse(body)

    // Buscar agendamento atual
    const currentAppointment = await prisma.appointment.findUnique({
      where: { id: context.params.id }
    })

    if (!currentAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      )
    }

    const updateData: any = { ...data }

    // Tratar timezone da data
    let parsedDate: Date | null = null
    if (data.date) {
      const dateOnly = data.date.split('T')[0] // Extrai apenas YYYY-MM-DD
      parsedDate = new Date(dateOnly + 'T12:00:00')
      updateData.date = parsedDate
    }

    // Verificar conflito apenas se data, hora ou duração mudaram
    const dateChanged = parsedDate && parsedDate.getTime() !== currentAppointment.date.getTime()
    const timeChanged = data.time && data.time !== currentAppointment.time
    const durationChanged = data.duration && data.duration !== currentAppointment.duration

    if (dateChanged || timeChanged || durationChanged) {
      const checkDate = parsedDate || currentAppointment.date
      const checkTime = data.time || currentAppointment.time
      const checkDuration = data.duration || currentAppointment.duration

      const hasConflict = await checkTimeConflict(
        checkDate,
        checkTime,
        checkDuration,
        context.params.id
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
    }

    const appointment = await prisma.appointment.update({
      where: { id: context.params.id },
      data: updateData
    })

    return NextResponse.json(appointment)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar agendamento:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Remove um agendamento
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.appointment.delete({
      where: { id: context.params.id }
    })

    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('Erro ao deletar agendamento:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
