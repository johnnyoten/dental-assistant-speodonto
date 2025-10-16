'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import {
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface Stats {
  totalAppointments: number
  appointmentsThisMonth: number
  totalConversations: number
  upcomingAppointments: Array<{
    id: string
    customerName: string
    service: string
    date: string
    time: string
    status: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Saudação */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Olá, Doutor! 👋
          </h2>
          <p className="text-gray-600 mt-1">
            Bem-vindo ao seu painel administrativo
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalAppointments || 0}
                </p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.appointmentsThisMonth || 0}
                </p>
                <p className="text-xs text-gray-600">Este mês</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalConversations || 0}
                </p>
                <p className="text-xs text-gray-600">Conversas</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.upcomingAppointments?.length || 0}
                </p>
                <p className="text-xs text-gray-600">Próximos</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Próximas Consultas */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Próximas Consultas
          </h3>

          {stats?.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingAppointments.slice(0, 5).map((appointment) => (
                <Card key={appointment.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {appointment.customerName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {appointment.service}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status === 'CONFIRMED' ? 'Confirmado' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-center text-gray-500 py-8">
                Nenhuma consulta agendada para os próximos dias
              </p>
            </Card>
          )}
        </div>

        {/* Ações Rápidas */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <a href="/admin/appointments/new">
              <Card className="text-center">
                <CalendarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-gray-900 text-sm">
                  Nova Consulta
                </p>
              </Card>
            </a>
            <a href="/admin/prescriptions/new">
              <Card className="text-center">
                <svg className="h-8 w-8 text-green-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="font-medium text-gray-900 text-sm">
                  Nova Receita
                </p>
              </Card>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
