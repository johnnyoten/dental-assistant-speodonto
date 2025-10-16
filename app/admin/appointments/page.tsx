'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import {
  CalendarIcon,
  ClockIcon,
  PhoneIcon,
  PlusIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface Appointment {
  id: string
  customerName: string
  customerPhone: string
  service: string
  date: string
  time: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  notes?: string
}

export default function AppointmentsPage() {
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'today'>('upcoming')

  useEffect(() => {
    fetchAppointments()
  }, [filter])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')

      let url = '/api/appointments'
      if (filter === 'today') {
        const today = new Date().toISOString().split('T')[0]
        url += `?startDate=${today}&endDate=${today}`
      } else if (filter === 'upcoming') {
        const today = new Date().toISOString().split('T')[0]
        const nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        const nextMonthStr = nextMonth.toISOString().split('T')[0]
        url += `?startDate=${today}&endDate=${nextMonthStr}`
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING: 'Pendente',
      CONFIRMED: 'Confirmado',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado'
    }
    return labels[status as keyof typeof labels] || status
  }

  const groupByDate = (appointments: Appointment[]) => {
    const grouped: { [key: string]: Appointment[] } = {}

    appointments.forEach((apt) => {
      const date = new Date(apt.date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long'
      })
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(apt)
    })

    return grouped
  }

  const groupedAppointments = groupByDate(appointments)

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Agendamentos</h2>
          <Button
            onClick={() => router.push('/admin/appointments/new')}
            size="sm"
            className="flex items-center space-x-1"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Novo</span>
          </Button>
        </div>

        {/* Filtros */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Todos
          </button>
        </div>

        {/* Lista de Agendamentos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : Object.keys(groupedAppointments).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedAppointments).map(([date, apts]) => (
              <div key={date}>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 sticky top-16 bg-gray-50 py-2">
                  {date}
                </h3>
                <div className="space-y-3">
                  {apts.map((appointment) => (
                    <Card
                      key={appointment.id}
                      onClick={() => router.push(`/admin/appointments/${appointment.id}`)}
                    >
                      <div className="space-y-2">
                        {/* Horário e Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                            <span className="font-semibold text-gray-900">
                              {appointment.time}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </span>
                        </div>

                        {/* Nome e Serviço */}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {appointment.customerName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {appointment.service}
                          </p>
                        </div>

                        {/* Telefone */}
                        <div className="flex items-center space-x-2">
                          <PhoneIcon className="h-4 w-4 text-gray-400" />
                          <a
                            href={`tel:${appointment.customerPhone}`}
                            className="text-sm text-blue-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {appointment.customerPhone}
                          </a>
                        </div>

                        {/* Notas (se houver) */}
                        {appointment.notes && (
                          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                Nenhum agendamento encontrado
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Crie um novo agendamento para começar
              </p>
              <Button onClick={() => router.push('/admin/appointments/new')}>
                Novo Agendamento
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}
