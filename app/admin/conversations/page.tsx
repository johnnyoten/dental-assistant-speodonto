'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
  lastMessage: string
  lastMessageAt: string
  messageCount: number
  messages: Message[]
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Erro ao buscar conversas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const search = searchTerm.toLowerCase()
    return (
      conv.customerName?.toLowerCase().includes(search) ||
      conv.phoneNumber.includes(search) ||
      conv.lastMessage.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando conversas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm mb-4 p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Conversas</h1>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou mensagem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Total de Conversas</p>
              <p className="text-2xl font-bold text-blue-600">{conversations.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Mensagens Totais</p>
              <p className="text-2xl font-bold text-green-600">
                {conversations.reduce((acc, conv) => acc + conv.messageCount, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-3">
          {filteredConversations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">
                {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/admin/conversations/${conversation.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {conversation.customerName || 'Cliente sem nome'}
                      </h3>
                      <p className="text-sm text-gray-500">{conversation.phoneNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {conversation.messageCount} mensagens
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {conversation.lastMessage}
                  </p>

                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
