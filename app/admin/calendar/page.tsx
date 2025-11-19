'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@heroicons/react/24/outline'

interface Appointment {
  id: string
  customerName: string
  customerPhone: string
  service: string
  date: string
  time: string
  duration: number
  status: string
  notes?: string
}

interface CalendarData {
  year: number
  month: number
  appointments: Record<string, Appointment[]>
  total: number
}

interface BlockedDate {
  id: string
  date: string
  reason: string | null
}

export default function CalendarPage() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [blockReason, setBlockReason] = useState('')

  useEffect(() => {
    fetchCalendar()
    fetchBlockedDates()
  }, [currentDate])

  const fetchCalendar = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

      const response = await fetch(`/api/calendar?month=${yearMonth}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCalendarData(data)
      }
    } catch (error) {
      console.error('Erro ao buscar calendário:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBlockedDates = async () => {
    try {
      const response = await fetch('/api/blocked-dates')
      if (response.ok) {
        const data = await response.json()
        setBlockedDates(data.blockedDates || [])
      }
    } catch (error) {
      console.error('Erro ao buscar dias bloqueados:', error)
    }
  }

  const isDateBlocked = (day: number): BlockedDate | undefined => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return blockedDates.find(bd => bd.date === dateStr)
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const blocked = isDateBlocked(day)

    if (blocked) {
      // Desbloquear
      if (confirm(`Desbloquear este dia?\n${blocked.reason ? `Motivo atual: ${blocked.reason}` : ''}`)) {
        unblockDate(blocked.id)
      }
    } else {
      // Bloquear
      setSelectedDate(dateStr)
      setBlockReason('')
      setShowBlockModal(true)
    }
  }

  const blockDate = async () => {
    if (!selectedDate) return

    try {
      const response = await fetch('/api/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, reason: blockReason || null })
      })

      if (response.ok) {
        fetchBlockedDates()
        setShowBlockModal(false)
        setSelectedDate(null)
        setBlockReason('')
      } else {
        const data = await response.json()
        alert(data.error || 'Erro ao bloquear dia')
      }
    } catch (error) {
      console.error('Erro ao bloquear dia:', error)
      alert('Erro ao bloquear dia')
    }
  }

  const unblockDate = async (id: string) => {
    try {
      const response = await fetch(`/api/blocked-dates?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchBlockedDates()
      }
    } catch (error) {
      console.error('Erro ao desbloquear dia:', error)
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getAppointmentsForDate = (day: number): Appointment[] => {
    if (!calendarData) return []
    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return calendarData.appointments[dateKey] || []
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth()

  if (loading && !calendarData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando calendário...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header do Calendário */}
        <Card>
          <div className="flex items-center justify-between">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <p className="text-xs text-gray-500">
                {calendarData?.total || 0} agendamentos
              </p>
            </div>

            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </Card>

        {/* Calendário */}
        <Card className="p-3">
          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-1">
            {/* Espaços vazios antes do primeiro dia */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Dias do mês */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1
              const appointments = getAppointmentsForDate(day)
              const hasAppointments = appointments.length > 0
              const today = isToday(day)
              const blocked = isDateBlocked(day)

              return (
                <div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`aspect-square border rounded-lg p-1 cursor-pointer transition-colors ${
                    blocked
                      ? 'border-red-300 bg-red-100'
                      : today
                        ? 'border-blue-500 bg-blue-50'
                        : hasAppointments
                          ? 'bg-green-50 border-gray-200'
                          : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`text-xs font-medium ${
                    blocked
                      ? 'text-red-600'
                      : today
                        ? 'text-blue-600'
                        : 'text-gray-700'
                  }`}>
                    {day}
                  </div>
                  {blocked ? (
                    <div className="mt-0.5">
                      <div className="text-[8px] text-center text-red-500 font-medium truncate">
                        {blocked.reason || 'Bloq.'}
                      </div>
                    </div>
                  ) : hasAppointments && (
                    <div className="mt-0.5">
                      <div className="w-1 h-1 bg-green-500 rounded-full mx-auto"></div>
                      <div className="text-[10px] text-center text-green-600 font-medium">
                        {appointments.length}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legenda */}
          <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-100 border border-green-300 rounded"></div>
              <span>Com agendamento</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-100 border border-red-300 rounded"></div>
              <span>Bloqueado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-50 border border-blue-500 rounded"></div>
              <span>Hoje</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Clique em um dia para bloquear/desbloquear
          </p>
        </Card>

        {/* Lista de Agendamentos do Mês */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 px-1">
            Próximos Agendamentos
          </h3>

          {calendarData && Object.keys(calendarData.appointments).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(calendarData.appointments)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .slice(0, 10)
                .map(([date, appointments]) => (
                  <div key={date}>
                    <p className="text-xs font-semibold text-gray-500 mb-2 px-1">
                      {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long'
                      })}
                    </p>
                    <div className="space-y-2">
                      {appointments.map(apt => (
                        <Card key={apt.id} className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">
                                {apt.customerName}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {apt.service}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <CalendarIcon className="h-3 w-3 text-gray-400" />
                                <p className="text-xs text-gray-500">
                                  {apt.time}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
                              apt.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800'
                                : apt.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {apt.status === 'CONFIRMED' ? 'Confirmado' :
                               apt.status === 'CANCELLED' ? 'Cancelado' : 'Pendente'}
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <Card>
              <p className="text-center text-gray-500 py-8 text-sm">
                Nenhum agendamento para este mês
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Modal para bloquear dia */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-3">Bloquear Dia</h3>
            <p className="text-sm text-gray-600 mb-3">
              {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo (opcional)
              </label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex: Feriado, Folga, Ferias..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowBlockModal(false)
                  setSelectedDate(null)
                  setBlockReason('')
                }}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={blockDate}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Bloquear
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
