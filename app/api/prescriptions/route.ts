import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const prescriptionSchema = z.object({
  patientName: z.string().min(1),
  content: z.string().min(1)
})

function checkAuth(request: NextRequest): boolean {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  return token === process.env.ADMIN_TOKEN
}

// GET - Lista todas as receitas
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const patientName = searchParams.get('patientName')

    const where: any = {}
    if (patientName) {
      where.patientName = {
        contains: patientName,
        mode: 'insensitive'
      }
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(prescriptions)
  } catch (error) {
    console.error('Erro ao buscar receitas:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Cria nova receita
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data = prescriptionSchema.parse(body)

    const prescription = await prisma.prescription.create({
      data: {
        patientName: data.patientName,
        content: data.content
      }
    })

    return NextResponse.json(prescription, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar receita:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
