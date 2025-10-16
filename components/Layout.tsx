'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  HomeIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ChartBarIcon as ChartBarIconSolid
} from '@heroicons/react/24/solid'

interface LayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Início', href: '/admin', icon: HomeIcon, iconSolid: HomeIconSolid },
  { name: 'Agenda', href: '/admin/appointments', icon: CalendarIcon, iconSolid: CalendarIconSolid },
  { name: 'Receitas', href: '/admin/prescriptions', icon: DocumentTextIcon, iconSolid: DocumentTextIconSolid },
  { name: 'Stats', href: '/admin/stats', icon: ChartBarIcon, iconSolid: ChartBarIconSolid },
]

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Mobile */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">🦷 Dental Assistant</h1>
          <p className="text-xs text-gray-500">Painel Administrativo</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation - Mobile First */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="grid grid-cols-4 gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = isActive ? item.iconSolid : item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center py-3 px-2 transition-colors ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
