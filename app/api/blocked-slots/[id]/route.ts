import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE - Remover horário bloqueado
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    // Verificar autenticação
    if (token !== process.env.ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Verificar se o horário bloqueado existe
    const blockedSlot = await prisma.blockedTimeSlot.findUnique({
      where: { id }
    })

    if (!blockedSlot) {
      return NextResponse.json(
        { error: 'Horário bloqueado não encontrado' },
        { status: 404 }
      )
    }

    // Deletar horário bloqueado
    await prisma.blockedTimeSlot.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Horário bloqueado removido com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar horário bloqueado:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
