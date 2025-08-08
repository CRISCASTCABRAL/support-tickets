'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'

import { StatsCard } from '@/components/dashboard/stats-card'
import { RecentReports } from '@/components/dashboard/recent-reports'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DashboardStats {
  overview: {
    total: number
    open: number
    inProgress: number
    resolved: number
    closed: number
    critical: number
  }
  trends: {
    thisMonth: number
    lastMonth: number
    change: string
  }
  charts: {
    status: Record<string, number>
    type: Record<string, number>
    priority: Record<string, number>
  }
  recent: any[]
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchStats()
    }
  }, [session])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const userRole = session?.user?.role
  const userName = session?.user?.name

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenido, {userName}
          </h1>
          <p className="text-gray-600 mt-1">
            Aquí tienes un resumen de la actividad del sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <Badge variant={
            userRole === 'ADMIN' ? 'default' :
            userRole === 'TECHNICIAN' ? 'secondary' : 'outline'
          }>
            {userRole}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Reportes"
          value={stats?.overview.total || 0}
          description="Todos los reportes en el sistema"
          icon={FileText}
          trend={{
            value: stats?.trends.change || "0",
            label: "vs mes anterior",
            positive: parseFloat(stats?.trends.change || "0") >= 0
          }}
        />

        <StatsCard
          title="Reportes Abiertos"
          value={stats?.overview.open || 0}
          description="Reportes pendientes de asignar"
          icon={AlertCircle}
          className="border-orange-200 bg-orange-50"
        />

        <StatsCard
          title="En Progreso"
          value={stats?.overview.inProgress || 0}
          description="Reportes siendo atendidos"
          icon={Clock}
          className="border-blue-200 bg-blue-50"
        />

        <StatsCard
          title="Resueltos"
          value={stats?.overview.resolved || 0}
          description="Reportes completados"
          icon={CheckCircle}
          className="border-green-200 bg-green-50"
        />
      </div>

      {/* Quick Actions & Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-100">
              Reportes Críticos
            </CardTitle>
            <Zap className="h-4 w-4 text-red-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.overview.critical || 0}</div>
            <p className="text-xs text-red-100 mt-1">
              Requieren atención inmediata
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">
              Este Mes
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.trends.thisMonth || 0}</div>
            <p className="text-xs text-primary-foreground/80 mt-1">
              Nuevos reportes creados
            </p>
          </CardContent>
        </Card>

        {userRole === 'ADMIN' && (
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">
                Eficiencia
              </CardTitle>
              <Users className="h-4 w-4 text-green-100" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats ? Math.round(((stats.overview.resolved + stats.overview.closed) / stats.overview.total) * 100) : 0}%
              </div>
              <p className="text-xs text-green-100 mt-1">
                Reportes completados
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Reports */}
      {stats?.recent && (
        <div className="grid gap-4">
          <RecentReports reports={stats.recent} />
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href="/report/new">Crear Nuevo Reporte</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/dashboard/reports">Ver Todos los Reportes</a>
            </Button>
            {(userRole === 'ADMIN' || userRole === 'TECHNICIAN') && (
              <Button variant="outline" asChild>
                <a href="/dashboard/reports?status=OPEN">Ver Reportes Abiertos</a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}