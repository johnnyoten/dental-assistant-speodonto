'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'

interface Stats {
  totalAppointments: number
  appointmentsThisMonth: number
  totalConversations: number
  appointmentsByStatus: Array<{ status: string; count: number }>
  topServices: Array<{ service: string; count: number }>
  popularTimes: Array<{ time: string; count: number }>
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (!stats) return null

  const statusData = stats.appointmentsByStatus.map(item => ({
    name: item.status === 'CONFIRMED' ? 'Confirmado' :
          item.status === 'PENDING' ? 'Pendente' :
          item.status === 'COMPLETED' ? 'Concluído' : 'Cancelado',
    value: item.count
  }))

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Estatísticas</h2>

        {/* Cards Resumo */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <p className="text-sm text-gray-600 mb-1">Total de Consultas</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalAppointments}</p>
          </Card>

          <Card>
            <p className="text-sm text-gray-600 mb-1">Este Mês</p>
            <p className="text-3xl font-bold text-green-600">{stats.appointmentsThisMonth}</p>
          </Card>

          <Card>
            <p className="text-sm text-gray-600 mb-1">Conversas</p>
            <p className="text-3xl font-bold text-purple-600">{stats.totalConversations}</p>
          </Card>

          <Card>
            <p className="text-sm text-gray-600 mb-1">Taxa Conversão</p>
            <p className="text-3xl font-bold text-orange-600">
              {stats.totalConversations > 0
                ? Math.round((stats.totalAppointments / stats.totalConversations) * 100)
                : 0}%
            </p>
          </Card>
        </div>

        {/* Status dos Agendamentos */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Status dos Agendamentos</h3>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">Sem dados disponíveis</p>
          )}
        </Card>

        {/* Serviços Mais Solicitados */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Serviços Mais Solicitados</h3>
          {stats.topServices.length > 0 ? (
            <div className="space-y-3">
              {stats.topServices.map((service, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{service.service}</span>
                    <span className="text-sm font-semibold text-gray-900">{service.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(service.count / stats.topServices[0].count) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">Sem dados disponíveis</p>
          )}
        </Card>

        {/* Horários Mais Populares */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Horários Mais Populares</h3>
          {stats.popularTimes.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.popularTimes}>
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">Sem dados disponíveis</p>
          )}
        </Card>

        {/* Resumo em Lista */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Resumo Geral</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total de Agendamentos</span>
              <span className="font-semibold text-gray-900">{stats.totalAppointments}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Agendamentos este Mês</span>
              <span className="font-semibold text-gray-900">{stats.appointmentsThisMonth}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total de Conversas</span>
              <span className="font-semibold text-gray-900">{stats.totalConversations}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Serviço Mais Popular</span>
              <span className="font-semibold text-gray-900">
                {stats.topServices[0]?.service || 'N/A'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
