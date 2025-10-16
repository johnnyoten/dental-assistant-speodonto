'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redireciona para login ou admin
    const token = localStorage.getItem('adminToken')
    if (token) {
      router.push('/admin')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center">
        <div className="text-6xl mb-6">🦷</div>
        <h1 className="text-4xl font-bold mb-4">Dental Assistant</h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema de Agendamento Inteligente
        </p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </main>
  )
}
