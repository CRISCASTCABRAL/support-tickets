'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ExternalLink } from 'lucide-react'

interface Report {
  id: string
  title: string
  status: string
  priority: string
  createdAt: string
  reportedBy: {
    name: string
  }
  assignedTo?: {
    name: string
  }
}

interface RecentReportsProps {
  reports: Report[]
}

export function RecentReports({ reports }: RecentReportsProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'open'
      case 'IN_PROGRESS':
        return 'in_progress'
      case 'RESOLVED':
        return 'resolved'
      case 'CLOSED':
        return 'closed'
      default:
        return 'default'
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'low'
      case 'MEDIUM':
        return 'medium'
      case 'HIGH':
        return 'high'
      case 'CRITICAL':
        return 'critical'
      default:
        return 'medium'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Abierto'
      case 'IN_PROGRESS':
        return 'En Progreso'
      case 'RESOLVED':
        return 'Resuelto'
      case 'CLOSED':
        return 'Cerrado'
      default:
        return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return 'Baja'
      case 'MEDIUM':
        return 'Media'
      case 'HIGH':
        return 'Alta'
      case 'CRITICAL':
        return 'Crítica'
      default:
        return priority
    }
  }

  return (
    <Card className="col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Reportes Recientes</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/reports">
            Ver Todos
            <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No hay reportes recientes
            </p>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between space-x-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {report.reportedBy.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="min-w-0 flex-1">
                    <Link 
                      href={`/report/${report.id}`}
                      className="font-medium text-sm hover:underline truncate block"
                    >
                      {report.title}
                    </Link>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={getStatusVariant(report.status)} className="text-xs">
                        {getStatusText(report.status)}
                      </Badge>
                      <Badge variant={getPriorityVariant(report.priority)} className="text-xs">
                        {getPriorityText(report.priority)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Por {report.reportedBy.name} • {' '}
                      {formatDistanceToNow(new Date(report.createdAt), {
                        addSuffix: true,
                        locale: es
                      })}
                    </p>
                  </div>
                </div>

                {report.assignedTo && (
                  <div className="text-right min-w-0">
                    <p className="text-xs text-muted-foreground">Asignado a</p>
                    <p className="text-xs font-medium truncate">
                      {report.assignedTo.name}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}