'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline'

interface Message {
  id: string
  role: string
  content: string
  createdAt: string
}

interface Conversation {
  id: string
  phoneNumber: string
  customerName: string | null
  service: string | null
  date: string | null
  time: string | null
  messages: Message[]
  createdAt: string
}

export default function ConversationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchConversation()
    }
  }, [params.id])

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversation = async () => {
    try {
      const res = await fetch(`/api/conversations/${params.id}`)
      const data = await res.json()

      if (data.success) {
        setConversation(data.conversation)
      } else {
        console.error('Erro ao buscar conversa')
      }
    } catch (error) {
      console.error('Erro ao buscar conversa:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando conversa...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Conversa nao encontrada</p>
          <button
            onClick={() => router.push('/admin/conversations')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Voltar para conversas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin/conversations')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900">
                {conversation.customerName || 'Cliente sem nome'}
              </h1>
              <p className="text-sm text-gray-500">{conversation.phoneNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {(conversation.service || conversation.date || conversation.time) && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Informacoes do Agendamento</h3>
            <div className="space-y-1 text-sm">
              {conversation.service && (
                <p><span className="font-medium">Servico:</span> {conversation.service}</p>
              )}
              {conversation.date && (
                <p><span className="font-medium">Data:</span> {conversation.date}</p>
              )}
              {conversation.time && (
                <p><span className="font-medium">Horario:</span> {conversation.time}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="space-y-4">
          {conversation.messages.map((message) => {
            const isUser = message.role === 'user'

            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="flex-shrink-0">
                    {isUser ? (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">AI</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                      {format(new Date(message.createdAt), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {conversation.messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma mensagem nesta conversa</p>
          </div>
        )}
      </div>
    </div>
  )
}
