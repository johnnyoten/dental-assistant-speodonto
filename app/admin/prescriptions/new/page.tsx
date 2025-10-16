'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'

// Templates de receitas comuns
const templates = [
  {
    name: 'Antibiótico + Analgésico',
    content: `Amoxicilina 500mg
Tomar 1 cápsula a cada 8 horas por 7 dias

Ibuprofeno 400mg
Tomar 1 comprimido a cada 6 horas se dor

Orientações:
- Tomar antibiótico até o final, mesmo se melhorar
- Não tomar com estômago vazio`
  },
  {
    name: 'Pós-extração',
    content: `Amoxicilina 500mg
Tomar 1 cápsula a cada 8 horas por 7 dias

Nimesulida 100mg
Tomar 1 comprimido a cada 12 horas por 3 dias

Orientações:
- Aplicar gelo nas primeiras 24h
- Evitar alimentos quentes
- Não fazer bochechos vigorosos
- Retornar se sangramento excessivo`
  },
  {
    name: 'Anti-inflamatório',
    content: `Nimesulida 100mg
Tomar 1 comprimido a cada 12 horas por 5 dias

Orientações:
- Tomar após as refeições
- Evitar exposição solar prolongada`
  },
  {
    name: 'Analgésico simples',
    content: `Paracetamol 750mg
Tomar 1 comprimido a cada 6 horas se dor

Orientações:
- Não exceder 4 comprimidos por dia
- Pode tomar com ou sem alimentos`
  }
]

export default function NewPrescriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [patientName, setPatientName] = useState('')
  const [content, setContent] = useState('')
  const [showTemplates, setShowTemplates] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ patientName, content })
      })

      if (response.ok) {
        router.push('/admin/prescriptions')
      } else {
        setError('Erro ao criar receita')
      }
    } catch (err) {
      setError('Erro ao criar receita')
    } finally {
      setLoading(false)
    }
  }

  const useTemplate = (template: typeof templates[0]) => {
    setContent(template.content)
    setShowTemplates(false)
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
          <h2 className="text-2xl font-bold text-gray-900">Nova Receita</h2>
        </div>

        {/* Templates (opcional) */}
        {showTemplates && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Templates</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-sm text-gray-600"
              >
                Ocultar
              </button>
            </div>
            <div className="space-y-2">
              {templates.map((template, index) => (
                <Card
                  key={index}
                  onClick={() => useTemplate(template)}
                  className="cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <p className="font-medium text-gray-900">{template.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Clique para usar este template
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!showTemplates && (
          <button
            onClick={() => setShowTemplates(true)}
            className="text-sm text-blue-600 font-medium"
          >
            + Ver templates
          </button>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <div className="space-y-4">
              <Input
                label="Nome do Paciente"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                placeholder="Ex: Maria Silva"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receita *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={12}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Digite a receita completa aqui..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Dica: Use Enter para quebrar linhas e deixar a receita mais legível
                </p>
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
              {loading ? 'Criando...' : 'Criar Receita'}
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => navigator.clipboard.writeText(content).then(() => alert('Receita copiada!'))}
              disabled={!content}
            >
              Copiar Receita
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
