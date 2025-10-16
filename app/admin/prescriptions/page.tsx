'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { PlusIcon, MagnifyingGlassIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

interface Prescription {
  id: string
  patientName: string
  content: string
  createdAt: string
}

export default function PrescriptionsPage() {
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/prescriptions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data)
      }
    } catch (error) {
      console.error('Erro ao buscar receitas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Receitas</h2>
          <Button
            onClick={() => router.push('/admin/prescriptions/new')}
            size="sm"
            className="flex items-center space-x-1"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nova</span>
          </Button>
        </div>

        {/* Busca */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome do paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredPrescriptions.length > 0 ? (
          <div className="space-y-3">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id}>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {prescription.patientName}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(prescription.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                  </div>

                  <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                    {prescription.content.length > 150
                      ? prescription.content.substring(0, 150) + '...'
                      : prescription.content}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      // Copiar para clipboard
                      navigator.clipboard.writeText(prescription.content)
                      alert('Receita copiada!')
                    }}
                  >
                    Copiar Receita
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">
                {searchTerm ? 'Nenhuma receita encontrada' : 'Nenhuma receita criada'}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {searchTerm
                  ? 'Tente outro termo de busca'
                  : 'Crie sua primeira receita para começar'}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/admin/prescriptions/new')}>
                  Nova Receita
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}
