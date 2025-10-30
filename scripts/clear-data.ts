import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearAllData() {
  try {
    console.log('🗑️  Removendo todos os dados...')

    // Deletar em ordem (por causa das foreign keys)
    const deletedAppointments = await prisma.appointment.deleteMany({})
    console.log(`✅ ${deletedAppointments.count} agendamentos removidos`)

    const deletedMessages = await prisma.message.deleteMany({})
    console.log(`✅ ${deletedMessages.count} mensagens removidas`)

    const deletedConversations = await prisma.conversation.deleteMany({})
    console.log(`✅ ${deletedConversations.count} conversas removidas`)

    console.log('✅ Todos os dados foram removidos com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao remover dados:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearAllData()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
