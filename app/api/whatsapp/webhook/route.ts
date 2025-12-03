import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { geminiAIService as aiService } from "@/lib/ai-service-gemini";
import { whatsappService } from "@/lib/whatsapp-service";

// Webhook verification (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully!");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// Webhook para receber mensagens (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verifica se é uma mensagem de texto
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages) {
      return NextResponse.json({ status: "no_messages" });
    }

    const message = value.messages[0];
    const from = message.from; // Número do WhatsApp do cliente
    const messageId = message.id;
    const messageText = message.text?.body;

    if (!messageText) {
      return NextResponse.json({ status: "not_text_message" });
    }

    // Marca mensagem como lida
    await whatsappService.markAsRead(messageId);

    // Busca ou cria conversa
    let conversation = await prisma.conversation.findFirst({
      where: { phoneNumber: from, status: "ACTIVE" },
      include: { messages: { orderBy: { timestamp: "asc" } } },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          phoneNumber: from,
          status: "ACTIVE",
          context: {},
        },
        include: { messages: true },
      });
    }

    // Salva mensagem do usuário
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: messageText,
      },
    });

    // Prepara histórico de mensagens para a IA
    const messageHistory = conversation.messages.map((msg) => ({
      role: msg.role.toLowerCase() as "user" | "assistant" | "system",
      content: msg.content,
    }));

    // Adiciona nova mensagem
    messageHistory.push({
      role: "user",
      content: messageText,
    });

    // Obtém contexto da conversa
    const context = (conversation.context as any) || {};

    // Chama IA para gerar resposta
    const aiResponse = await aiService.chat(messageHistory, context);

    // Salva resposta da IA
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: aiResponse,
      },
    });

    // Verifica se o agendamento foi completado
    const appointmentData = aiService.extractAppointmentData(aiResponse);

    if (appointmentData.isComplete && appointmentData.data) {
      // Verifica se já existe um agendamento PENDING ou CONFIRMED para este cliente
      const existingAppointments = await prisma.appointment.findMany({
        where: {
          customerPhone: from,
          status: {
            in: ["PENDING", "CONFIRMED"]
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Se houver agendamentos existentes, cancela todos (é uma remarcação)
      if (existingAppointments.length > 0) {
        console.log(`📅 Cancelando ${existingAppointments.length} agendamento(s) existente(s) do cliente ${from}`);

        await prisma.appointment.updateMany({
          where: {
            customerPhone: from,
            status: {
              in: ["PENDING", "CONFIRMED"]
            }
          },
          data: {
            status: "CANCELLED"
          }
        });
      }

      // Cria novo agendamento
      const appointment = await prisma.appointment.create({
        data: {
          customerName: appointmentData.data.customerName,
          customerPhone: from,
          service: appointmentData.data.service,
          date: new Date(appointmentData.data.date),
          time: appointmentData.data.time,
          status: "CONFIRMED",
          conversationId: conversation.id,
        },
      });

      console.log(`✅ Novo agendamento criado: ${appointment.id}`);

      // Fecha conversa
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { status: "CLOSED" },
      });

      // Envia mensagem de confirmação limpa
      const isRescheduling = existingAppointments.length > 0;
      const confirmationMessage =
        `✅ ${isRescheduling ? 'Agendamento remarcado' : 'Agendamento confirmado'}!\n\n` +
        `📋 Resumo:\n` +
        `Nome: ${appointmentData.data.customerName}\n` +
        `Serviço: ${appointmentData.data.service}\n` +
        `Data: ${new Date(appointmentData.data.date).toLocaleDateString(
          "pt-BR"
        )}\n` +
        `Horário: ${appointmentData.data.time}\n\n` +
        `Nos vemos em breve! 😊`;

      await whatsappService.sendMessage(from, confirmationMessage);
    } else {
      // Envia resposta da IA
      await whatsappService.sendMessage(from, aiResponse);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
