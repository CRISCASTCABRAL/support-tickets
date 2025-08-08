'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateReportSchema, type CreateReportInput } from '@/lib/validations'
import { IncidentType, Priority } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, CheckCircle, FileText, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewReportPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CreateReportInput>({
    resolver: zodResolver(CreateReportSchema),
    defaultValues: {
      type: IncidentType.SYSTEM_FAILURE,
      priority: Priority.MEDIUM
    }
  })

  const selectedType = watch('type')
  const selectedPriority = watch('priority')

  const onSubmit = async (data: CreateReportInput) => {
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Error al crear el reporte')
        return
      }

      setSuccess('Reporte creado exitosamente. Redirigiendo...')
      
      // Redirigir al reporte creado después de 2 segundos
      setTimeout(() => {
        router.push(`/report/${result.report.id}`)
      }, 2000)

    } catch (err) {
      setError('Ocurrió un error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const incidentTypes = [
    { value: IncidentType.SYSTEM_FAILURE, label: 'Falla del Sistema' },
    { value: IncidentType.HARDWARE_ISSUE, label: 'Problema de Hardware/PC' },
    { value: IncidentType.NETWORK_ISSUE, label: 'Problema de Red/Internet' }
  ]

  const priorities = [
    { value: Priority.LOW, label: 'Baja', description: 'No urgente, puede esperar' },
    { value: Priority.MEDIUM, label: 'Media', description: 'Importancia normal' },
    { value: Priority.HIGH, label: 'Alta', description: 'Requiere atención pronto' },
    { value: Priority.CRITICAL, label: 'Crítica', description: 'Requiere atención inmediata' }
  ]

  if (!session) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">Acceso requerido</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Debes iniciar sesión para crear un reporte
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link href="/login">Iniciar Sesión</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="container max-w-2xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Crear Nuevo Reporte
              </h1>
              <p className="text-gray-600">
                Describe el problema técnico que necesita atención
              </p>
            </div>
          </div>
        </div>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Información del Reporte</CardTitle>
            <CardDescription>
              Proporciona todos los detalles posibles para ayudar a resolver el problema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Título del Problema *</Label>
                <Input
                  id="title"
                  placeholder="ej: Sistema lento en el área de contabilidad"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción Detallada *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el problema con el mayor detalle posible: ¿Qué pasó? ¿Cuándo empezó? ¿Qué estabas haciendo? ¿Hay algún mensaje de error?"
                  rows={4}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Incidencia *</Label>
                  <Select
                    value={selectedType}
                    onValueChange={(value) => setValue('type', value as IncidentType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {incidentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad *</Label>
                  <Select
                    value={selectedPriority}
                    onValueChange={(value) => setValue('priority', value as Priority)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div>
                            <div className="font-medium">{priority.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {priority.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.priority && (
                    <p className="text-sm text-red-600">{errors.priority.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación (Opcional)</Label>
                  <Input
                    id="location"
                    placeholder="ej: Oficina 2, Piso 3, Sala de Juntas"
                    {...register('location')}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipo Afectado (Opcional)</Label>
                  <Input
                    id="equipment"
                    placeholder="ej: PC-001, Impresora HP, Router Principal"
                    {...register('equipment')}
                  />
                  {errors.equipment && (
                    <p className="text-sm text-red-600">{errors.equipment.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting || isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading || !!success}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Reporte
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}