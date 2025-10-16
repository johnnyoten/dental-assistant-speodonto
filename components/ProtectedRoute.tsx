'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')

    if (!token) {
      router.push('/login')
      return
    }

    // Valida o token
    fetch('/api/appointments', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('adminToken')
          router.push('/login')
        }
      })
      .catch(() => {
        localStorage.removeItem('adminToken')
        router.push('/login')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
