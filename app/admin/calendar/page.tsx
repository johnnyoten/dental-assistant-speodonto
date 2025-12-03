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
  blockedSlots: Record<string, BlockedTimeSlot[]>
  total: number
}

interface BlockedDate {
  id: string
  date: string
  reason: string | null
}

interface BlockedTimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  reason?: string
}

export default function CalendarPage() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showDayDetailsModal, setShowDayDetailsModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [blockType, setBlockType] = useState<'full-day' | 'time-range'>('full-day')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

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
    setSelectedDate(dateStr)

    // Abrir modal com detalhes do dia
    setShowDayDetailsModal(true)
  }

  const blockDate = async () => {
    if (!selectedDate) return

    try {
      if (blockType === 'full-day') {
        // Bloquear dia inteiro
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
      } else {
        // Bloquear horário específico
        if (!startTime || !endTime) {
          alert('Informe o horário de início e fim')
          return
        }

        const token = localStorage.getItem('adminToken')
        const response = await fetch('/api/blocked-slots', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            date: selectedDate,
            startTime,
            endTime,
            reason: blockReason || null
          })
        })

        if (response.ok) {
          fetchCalendar() // Recarregar calendário para mostrar horário bloqueado
          setShowBlockModal(false)
          setSelectedDate(null)
          setBlockReason('')
          setStartTime('')
          setEndTime('')
        } else {
          const data = await response.json()
          alert(data.error || 'Erro ao bloquear horário')
        }
      }
    } catch (error) {
      console.error('Erro ao bloquear:', error)
      alert('Erro ao bloquear')
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

  const deleteBlockedSlot = async (id: string) => {
    if (!confirm('Deseja realmente remover este horário bloqueado?')) return

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`/api/blocked-slots/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        fetchCalendar() // Recarregar calendário
      }
    } catch (error) {
      console.error('Erro ao deletar horário bloqueado:', error)
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

  const getBlockedSlotsForDate = (day: number): BlockedTimeSlot[] => {
    if (!calendarData) return []
    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return calendarData.blockedSlots[dateKey] || []
  }

  const getBlockedSlotsForDateStr = (dateStr: string): BlockedTimeSlot[] => {
    if (!calendarData) return []
    return calendarData.blockedSlots[dateStr] || []
  }

  const getAppointmentsForDateStr = (dateStr: string): Appointment[] => {
    if (!calendarData) return []
    return calendarData.appointments[dateStr] || []
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
              const blockedSlots = getBlockedSlotsForDate(day)
              const hasAppointments = appointments.length > 0
              const hasBlockedSlots = blockedSlots.length > 0
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
                        : hasAppointments || hasBlockedSlots
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
                  ) : (hasAppointments || hasBlockedSlots) && (
                    <div className="mt-0.5 space-y-0.5">
                      {hasAppointments && (
                        <div className="flex items-center justify-center gap-0.5">
                          <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                          <div className="text-[10px] text-green-600 font-medium">
                            {appointments.length}
                          </div>
                        </div>
                      )}
                      {hasBlockedSlots && (
                        <div className="flex items-center justify-center gap-0.5">
                          <div className="w-1 h-1 bg-orange-500 rounded-full"></div>
                          <div className="text-[10px] text-orange-600 font-medium">
                            {blockedSlots.length}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legenda */}
          <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Agendamentos</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Horários bloqueados</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-100 border border-red-300 rounded"></div>
              <span>Dia bloqueado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-50 border border-blue-500 rounded"></div>
              <span>Hoje</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Clique em um dia para ver detalhes, agendamentos e gerenciar bloqueios
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

      {/* Modal de detalhes do dia */}
      {showDayDetailsModal && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </h3>
              <button
                onClick={() => setShowDayDetailsModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Agendamentos do dia */}
            {getAppointmentsForDateStr(selectedDate).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Agendamentos</h4>
                <div className="space-y-2">
                  {getAppointmentsForDateStr(selectedDate).map(apt => (
                    <div key={apt.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{apt.time}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          apt.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          apt.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {apt.status === 'CONFIRMED' ? 'Confirmado' :
                           apt.status === 'CANCELLED' ? 'Cancelado' : 'Pendente'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{apt.customerName}</p>
                      <p className="text-xs text-gray-600">{apt.service}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Horários bloqueados */}
            {getBlockedSlotsForDateStr(selectedDate).length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Horários Bloqueados</h4>
                <div className="space-y-2">
                  {getBlockedSlotsForDateStr(selectedDate).map(slot => (
                    <div key={slot.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <span className="font-semibold text-sm text-red-900">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          {slot.reason && (
                            <p className="text-xs text-red-700">{slot.reason}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteBlockedSlot(slot.id)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Remover bloqueio"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dia inteiro bloqueado */}
            {isDateBlocked(parseInt(selectedDate.split('-')[2])) && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Dia Bloqueado</h4>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-red-900">Dia inteiro bloqueado</p>
                      {isDateBlocked(parseInt(selectedDate.split('-')[2]))?.reason && (
                        <p className="text-xs text-red-700 mt-1">
                          {isDateBlocked(parseInt(selectedDate.split('-')[2]))?.reason}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        const blocked = isDateBlocked(parseInt(selectedDate.split('-')[2]))
                        if (blocked) {
                          unblockDate(blocked.id)
                          setShowDayDetailsModal(false)
                        }
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Desbloquear dia"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Botão para adicionar bloqueio */}
            <button
              onClick={() => {
                setShowDayDetailsModal(false)
                setBlockReason('')
                setBlockType('full-day')
                setStartTime('')
                setEndTime('')
                setShowBlockModal(true)
              }}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Bloquear Horário
            </button>
          </div>
        </div>
      )}

      {/* Modal para bloquear dia/horário */}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-3">Bloquear Horário</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>

            {/* Tipo de bloqueio */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de bloqueio
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="full-day"
                    checked={blockType === 'full-day'}
                    onChange={(e) => setBlockType(e.target.value as 'full-day')}
                    className="mr-2"
                  />
                  <span className="text-sm">Dia inteiro</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="time-range"
                    checked={blockType === 'time-range'}
                    onChange={(e) => setBlockType(e.target.value as 'time-range')}
                    className="mr-2"
                  />
                  <span className="text-sm">Horário específico</span>
                </label>
              </div>
            </div>

            {/* Campos de horário (apenas se time-range) */}
            {blockType === 'time-range' && (
              <div className="mb-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de início
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário de término
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Motivo */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo (opcional)
              </label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder={blockType === 'full-day' ? 'Ex: Feriado, Folga, Férias...' : 'Ex: Almoço, Reunião...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowBlockModal(false)
                  setSelectedDate(null)
                  setBlockReason('')
                  setStartTime('')
                  setEndTime('')
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
