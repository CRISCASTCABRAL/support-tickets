'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

import {
  Home,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  BarChart3
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: pathname === '/dashboard'
    },
    {
      name: 'Reportes',
      href: '/dashboard/reports',
      icon: FileText,
      current: pathname.startsWith('/dashboard/reports')
    },
    {
      name: 'Nuevo Reporte',
      href: '/report/new',
      icon: Plus,
      current: pathname === '/report/new'
    }
  ]

  // Agregar navegación de admin
  if (session?.user.role === 'ADMIN') {
    navigation.push(
      {
        name: 'Usuarios',
        href: '/dashboard/users',
        icon: Users,
        current: pathname.startsWith('/dashboard/users')
      },
      {
        name: 'Estadísticas',
        href: '/dashboard/analytics',
        icon: BarChart3,
        current: pathname.startsWith('/dashboard/analytics')
      }
    )
  }

  navigation.push({
    name: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
    current: pathname.startsWith('/dashboard/settings')
  })

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div
      className={cn(
        'glass border-r flex flex-col h-screen transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h1 className="text-lg font-semibold text-gray-900">
            Sistema Reportes
          </h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name}
              </p>
              <Badge 
                variant={
                  session?.user.role === 'ADMIN' ? 'default' :
                  session?.user.role === 'TECHNICIAN' ? 'secondary' : 'outline'
                }
                className="text-xs"
              >
                {session?.user.role}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
              item.current
                ? 'bg-primary/10 text-primary'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon
              className={cn(
                'mr-3 flex-shrink-0 h-5 w-5',
                item.current ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
              )}
            />
            {!collapsed && item.name}
          </Link>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-gray-600 hover:text-gray-900',
            collapsed && 'justify-center'
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-3" />
          {!collapsed && 'Cerrar Sesión'}
        </Button>
      </div>
    </div>
  )
}