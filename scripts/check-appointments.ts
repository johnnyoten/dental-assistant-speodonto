import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAppointments() {
  try {
    console.log('🔍 Buscando todos os agendamentos...\n')

    const appointments = await prisma.appointment.findMany({
      orderBy: [
        { date: 'asc' },
        { time: 'asc' }
      ]
    })

    console.log(`📊 Total de agendamentos: ${appointments.length}\n`)

    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. ${apt.customerName}`)
      console.log(`   📅 Data: ${apt.date.toISOString()}`)
      console.log(`   📅 Data (Local): ${apt.date.toLocaleDateString('pt-BR')}`)
      console.log(`   ⏰ Horário: ${apt.time}`)
      console.log(`   🦷 Serviço: ${apt.service}`)
      console.log(`   ✅ Status: ${apt.status}`)
      console.log('')
    })

    // Verificar especificamente 06/11/2025
    const targetDate = new Date('2025-11-06')
    console.log('🎯 Buscando agendamentos para 06/11/2025...')
    console.log('   Data de busca:', targetDate.toISOString())

    const novSixth = await prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date('2025-11-06T00:00:00'),
          lte: new Date('2025-11-06T23:59:59')
        }
      }
    })

    console.log(`   Encontrados: ${novSixth.length}`)
    novSixth.forEach(apt => {
      console.log(`   - ${apt.customerName} às ${apt.time}`)
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAppointments()
