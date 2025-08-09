import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IncidentStatus } from '@prisma/client'

// PUT /api/reports/[id]/assign - Asignar técnico a reporte
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'TECHNICIAN')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { assignedToId } = body

    if (!assignedToId) {
      return NextResponse.json(
        { error: 'ID del técnico es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el técnico existe y es válido
    const technician = await prisma.user.findUnique({
      where: { id: assignedToId },
      select: { id: true, name: true, role: true }
    })

    if (!technician || (technician.role !== 'TECHNICIAN' && technician.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Técnico no válido' },
        { status: 400 }
      )
    }

    // Verificar que el reporte existe
    const report = await prisma.report.findUnique({
      where: { id: params.id }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar reporte
    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: {
        assignedToId,
        status: report.status === IncidentStatus.OPEN ? IncidentStatus.IN_PROGRESS : report.status
      },
      include: {
        reportedBy: {
          select: { id: true, name: true, email: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Crear log de actividad
    await prisma.activityLog.create({
      data: {
        action: 'assigned',
        description: `Reporte asignado a ${technician.name} por ${session.user.name}`,
        reportId: params.id,
        userId: session.user.id
      }
    })

    // Enviar notificación al técnico asignado (en background)
    try {
      const { NotificationService } = await import('@/lib/notifications')
      NotificationService.notifyReportAssigned(params.id)
    } catch (error) {
      console.error('Error enviando notificación:', error)
    }

    return NextResponse.json({
      message: 'Reporte asignado exitosamente',
      report: updatedReport
    })

  } catch (error) {
    console.error('Error asignando reporte:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}