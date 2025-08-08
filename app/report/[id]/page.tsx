'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  Monitor,
  User,
  Clock,
  Send,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface ReportDetail {
  id: string
  title: string
  description: string
  type: string
  status: string
  priority: string
  location?: string
  equipment?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  reportedBy: {
    id: string
    name: string
    email: string
    role: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
    role: string
  }
  comments: Array<{
    id: string
    content: string
    createdAt: string
    author: {
      id: string
      name: string
      role: string
    }
  }>
  logs: Array<{
    id: string
    action: string
    description: string
    createdAt: string
    user: {
      name: string
      role: string
    }
  }>
}

export default function ReportDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [technicians, setTechnicians] = useState<any[]>([])
  const [selectedTechnician, setSelectedTechnician] = useState('')
  const [assigningTechnician, setAssigningTechnician] = useState(false)

  useEffect(() => {
    async function fetchReport() {
      if (!params.id || !session) return

      try {
        setLoading(true)
        const response = await fetch(`/api/reports/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setReport(data.report)
        } else {
          setError('Reporte no encontrado')
        }
      } catch (err) {
        setError('Error cargando el reporte')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [params.id, session])

  useEffect(() => {
    async function fetchTechnicians() {
      if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'TECHNICIAN')) return

      try {
        const response = await fetch('/api/users/technicians')
        if (response.ok) {
          const data = await response.json()
          setTechnicians(data.technicians)
        }
      } catch (err) {
        console.error('Error fetching technicians:', err)
      }
    }

    fetchTechnicians()
  }, [session])

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !report) return

    try {
      setSubmittingComment(true)
      const response = await fetch(`/api/reports/${report.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment })
      })

      if (response.ok) {
        const data = await response.json()
        setReport(prev => prev ? {
          ...prev,
          comments: [...prev.comments, data.comment]
        } : null)
        setNewComment('')
      }
    } catch (err) {
      console.error('Error submitting comment:', err)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleAssignTechnician = async () => {
    if (!selectedTechnician || !report) return

    try {
      setAssigningTechnician(true)
      const response = await fetch(`/api/reports/${report.id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: selectedTechnician })
      })

      if (response.ok) {
        // Recargar el reporte para obtener los datos actualizados
        window.location.reload()
      }
    } catch (err) {
      console.error('Error assigning technician:', err)
    } finally {
      setAssigningTechnician(false)
    }
  }

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
      case 'SYSTEM_FAILURE': return 'Falla del Sistema'
      case 'HARDWARE_ISSUE': return 'Problema de Hardware'
      case 'NETWORK_ISSUE': return 'Problema de Red'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg">
        <div className="container max-w-4xl mx-auto py-6 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white rounded w-1/3" />
            <div className="h-64 bg-white rounded" />
            <div className="h-32 bg-white rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="mt-2 text-sm font-semibold">Error</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {error || 'No se pudo cargar el reporte'}
              </p>
              <div className="mt-6">
                <Button onClick={() => router.back()}>
                  Volver
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const canEdit = session?.user.role === 'ADMIN' || 
                 session?.user.role === 'TECHNICIAN' ||
                 report.reportedBy.id === session?.user.id

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {report.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant={getStatusVariant(report.status)}>
                  {getStatusText(report.status)}
                </Badge>
                <Badge variant={getPriorityVariant(report.priority)}>
                  {getPriorityText(report.priority)}
                </Badge>
                <Badge variant="outline">
                  {getTypeText(report.type)}
                </Badge>
              </div>
            </div>
            
            {canEdit && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Reporte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Descripción</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {report.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span><strong>Ubicación:</strong> {report.location}</span>
                    </div>
                  )}
                  
                  {report.equipment && (
                    <div className="flex items-center text-sm">
                      <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span><strong>Equipo:</strong> {report.equipment}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Comentarios ({report.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.comments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No hay comentarios aún
                  </p>
                ) : (
                  <div className="space-y-4">
                    {report.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3 p-3 rounded-lg bg-muted/50">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {comment.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {comment.author.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {comment.author.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt), {
                                addSuffix: true,
                                locale: es
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                {canEdit && (
                  <div className="border-t pt-4">
                    <Label htmlFor="comment">Agregar comentario</Label>
                    <Textarea
                      id="comment"
                      placeholder="Escribe tu comentario..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || submittingComment}
                        size="sm"
                      >
                        {submittingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Send className="mr-2 h-4 w-4" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Report Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Reportado por</div>
                    <div>{report.reportedBy.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {report.reportedBy.email}
                    </div>
                  </div>
                </div>

                {report.assignedTo && (
                  <div className="flex items-center text-sm">
                    <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Asignado a</div>
                      <div>{report.assignedTo.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {report.assignedTo.email}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Creado</div>
                    <div>
                      {format(new Date(report.createdAt), 'dd/MM/yyyy HH:mm')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Última actualización</div>
                    <div>
                      {formatDistanceToNow(new Date(report.updatedAt), {
                        addSuffix: true,
                        locale: es
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assign Technician - Only for admins/techs */}
            {(session?.user.role === 'ADMIN' || session?.user.role === 'TECHNICIAN') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Asignar Técnico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Select
                      value={selectedTechnician}
                      onValueChange={setSelectedTechnician}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            <div>
                              <div className="font-medium">{tech.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {tech.workload} reportes activos
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleAssignTechnician}
                      disabled={!selectedTechnician || assigningTechnician}
                      className="w-full"
                      size="sm"
                    >
                      {assigningTechnician && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Asignar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historial de Actividades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.logs.map((log) => (
                    <div key={log.id} className="text-sm">
                      <div className="font-medium">{log.description}</div>
                      <div className="text-xs text-muted-foreground">
                        Por {log.user.name} • {formatDistanceToNow(new Date(log.createdAt), {
                          addSuffix: true,
                          locale: es
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}