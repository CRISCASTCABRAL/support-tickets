'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, Search, Filter } from 'lucide-react'

interface Report {
  id: string
  title: string
  description: string
  type: string
  status: string
  priority: string
  createdAt: string
  location?: string
  equipment?: string
  reportedBy: {
    id: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  _count: {
    comments: number
  }
}

interface ReportsTableProps {
  reports: Report[]
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  onFilter: (filters: any) => void
}

export function ReportsTable({
  reports,
  totalPages,
  currentPage,
  onPageChange,
  onFilter
}: ReportsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'OPEN': return 'open'
      case 'IN_PROGRESS': return 'in_progress'
      case 'RESOLVED': return 'resolved'
      case 'CLOSED': return 'closed'
      default: return 'default'
    }
  }

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'low'
      case 'MEDIUM': return 'medium'
      case 'HIGH': return 'high'
      case 'CRITICAL': return 'critical'
      default: return 'medium'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Abierto'
      case 'IN_PROGRESS': return 'En Progreso'
      case 'RESOLVED': return 'Resuelto'
      case 'CLOSED': return 'Cerrado'
      default: return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'Baja'
      case 'MEDIUM': return 'Media'
      case 'HIGH': return 'Alta'
      case 'CRITICAL': return 'Crítica'
      default: return priority
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      // Valores antiguos (compatibilidad)
      case 'SYSTEM_FAILURE': return 'Falla del Sistema'
      case 'HARDWARE_ISSUE': return 'Problema de Hardware'
      case 'NETWORK_ISSUE': return 'Problema de Red'
      
      // Nuevos valores específicos
      case 'COMPUTER_SLOW': return 'PC Lento'
      case 'INTERNET_CONNECTION': return 'Conexión a Internet'
      case 'EMAIL_ISSUES': return 'Problemas de Email'
      case 'PRINTER_PROBLEMS': return 'Problemas de Impresora'
      case 'SOFTWARE_CRASH': return 'Aplicación se Cierra'
      case 'PASSWORD_RESET': return 'Restablecer Contraseña'
      case 'FILE_ACCESS': return 'Acceso a Archivos'
      case 'HARDWARE_MALFUNCTION': return 'Hardware Defectuoso'
      case 'VIRUS_MALWARE': return 'Virus/Malware'
      case 'SYSTEM_UPDATE': return 'Actualización del Sistema'
      default: return type
    }
  }

  const handleApplyFilters = () => {
    onFilter({
      search: searchTerm,
      status: statusFilter,
      type: typeFilter,
      priority: priorityFilter
    })
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setTypeFilter('')
    setPriorityFilter('')
    onFilter({})
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar reportes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Abierto</SelectItem>
                <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                <SelectItem value="RESOLVED">Resuelto</SelectItem>
                <SelectItem value="CLOSED">Cerrado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPUTER_SLOW">🐌 PC Lento</SelectItem>
                <SelectItem value="INTERNET_CONNECTION">🌐 Conexión a Internet</SelectItem>
                <SelectItem value="EMAIL_ISSUES">📧 Problemas de Email</SelectItem>
                <SelectItem value="PRINTER_PROBLEMS">🖨️ Problemas de Impresora</SelectItem>
                <SelectItem value="SOFTWARE_CRASH">💥 Aplicación se Cierra</SelectItem>
                <SelectItem value="PASSWORD_RESET">🔐 Restablecer Contraseña</SelectItem>
                <SelectItem value="FILE_ACCESS">📁 Acceso a Archivos</SelectItem>
                <SelectItem value="HARDWARE_MALFUNCTION">⌨️ Hardware Defectuoso</SelectItem>
                <SelectItem value="VIRUS_MALWARE">🦠 Virus/Malware</SelectItem>
                <SelectItem value="SYSTEM_UPDATE">🔄 Actualización del Sistema</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Baja</SelectItem>
                <SelectItem value="MEDIUM">Media</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="CRITICAL">Crítica</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} className="flex-1">
                Aplicar
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No se encontraron reportes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-muted-foreground">
                          Reporte
                        </th>
                        <th className="text-left py-2 font-medium text-muted-foreground">
                          Estado
                        </th>
                        <th className="text-left py-2 font-medium text-muted-foreground">
                          Prioridad
                        </th>
                        <th className="text-left py-2 font-medium text-muted-foreground">
                          Asignado a
                        </th>
                        <th className="text-left py-2 font-medium text-muted-foreground">
                          Creado
                        </th>
                        <th className="text-left py-2 font-medium text-muted-foreground">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id} className="border-b hover:bg-muted/50">
                          <td className="py-3">
                            <div>
                              <Link 
                                href={`/report/${report.id}`}
                                className="font-medium hover:underline"
                              >
                                {report.title}
                              </Link>
                              <div className="text-sm text-muted-foreground mt-1">
                                {getTypeText(report.type)} • Por {report.reportedBy.name}
                              </div>
                              {report._count.comments > 0 && (
                                <div className="text-xs text-muted-foreground">
                                  {report._count.comments} comentario(s)
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge variant={getStatusVariant(report.status)}>
                              {getStatusText(report.status)}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge variant={getPriorityVariant(report.priority)}>
                              {getPriorityText(report.priority)}
                            </Badge>
                          </td>
                          <td className="py-3">
                            {report.assignedTo ? (
                              <span className="text-sm">{report.assignedTo.name}</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                No asignado
                              </span>
                            )}
                          </td>
                          <td className="py-3 text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(report.createdAt), {
                              addSuffix: true,
                              locale: es
                            })}
                          </td>
                          <td className="py-3">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/report/${report.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {reports.map((report) => (
                  <Card key={report.id} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <Link 
                          href={`/report/${report.id}`}
                          className="font-medium hover:underline"
                        >
                          {report.title}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getTypeText(report.type)} • Por {report.reportedBy.name}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={getStatusVariant(report.status)}>
                          {getStatusText(report.status)}
                        </Badge>
                        <Badge variant={getPriorityVariant(report.priority)}>
                          {getPriorityText(report.priority)}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>
                          {formatDistanceToNow(new Date(report.createdAt), {
                            addSuffix: true,
                            locale: es
                          })}
                        </span>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/report/${report.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}