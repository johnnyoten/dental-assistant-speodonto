'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'

const serviceOptions = [
  { value: '', label: 'Selecione um serviço' },
  { value: 'Avaliação', label: 'Avaliação' },
  { value: 'Limpeza', label: 'Limpeza' },
  { value: 'Canal', label: 'Tratamento de Canal' },
  { value: 'Extração', label: 'Extração' },
  { value: 'Clareamento', label: 'Clareamento' },
  { value: 'Restauração', label: 'Restauração' },
  { value: 'Prótese', label: 'Prótese' },
  { value: 'Ortodontia', label: 'Ortodontia' },
  { value: 'Implante', label: 'Implante' },
  { value: 'Outro', label: 'Outro' },
]

const statusOptions = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'CONFIRMED', label: 'Confirmado' },
]

const durationOptions = [
  { value: '15', label: '15 minutos' },
  { value: '30', label: '30 minutos' },
  { value: '45', label: '45 minutos' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1h 30min' },
  { value: '120', label: '2 horas' },
  { value: '180', label: '3 horas' },
]

export default function NewAppointmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    service: '',
    date: '',
    time: '',
    duration: 30,
    notes: '',
    status: 'CONFIRMED'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/appointments')
      } else {
        const data = await response.json()
        setError(data.error || 'Erro ao criar agendamento')
      }
    } catch (err) {
      setError('Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.name === 'duration' ? Number(e.target.value) : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 font-medium mb-2 flex items-center space-x-1"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Voltar</span>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Novo Agendamento</h2>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <div className="space-y-4">
              <Input
                label="Nome do Paciente"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="Ex: João Silva"
              />

              <Input
                label="Telefone"
                name="customerPhone"
                type="tel"
                value={formData.customerPhone}
                onChange={handleChange}
                required
                placeholder="Ex: (11) 99999-9999"
              />

              <Select
                label="Serviço"
                name="service"
                value={formData.service}
                onChange={handleChange}
                options={serviceOptions}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Data"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Horário"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Duração"
                  name="duration"
                  value={String(formData.duration)}
                  onChange={handleChange}
                  options={durationOptions}
                  required
                />

                <Select
                  label="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={statusOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adicione observações sobre o agendamento..."
                />
              </div>
            </div>
          </Card>

          {error && (
            <Card className="bg-red-50 border-red-200">
              <p className="text-red-800 text-sm">{error}</p>
            </Card>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Agendamento'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
