import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NotificationService } from '@/lib/notifications'

// POST /api/notifications/email - Enviar notificación por email (testing)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { type, reportId } = body

    if (!type || !reportId) {
      return NextResponse.json(
        { error: 'Tipo y ID de reporte son requeridos' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'new_report':
        result = await NotificationService.notifyNewReport(reportId)
        break
      case 'assigned':
        result = await NotificationService.notifyReportAssigned(reportId)
        break
      case 'status_changed':
        const { status } = body
        if (!status) {
          return NextResponse.json(
            { error: 'Estado es requerido para notificación de cambio de estado' },
            { status: 400 }
          )
        }
        result = await NotificationService.notifyStatusChanged(reportId, status)
        break
      default:
        return NextResponse.json(
          { error: 'Tipo de notificación no válido' },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json({
        message: 'Notificación enviada exitosamente',
        result
      })
    } else {
      return NextResponse.json(
        { error: 'Error enviando notificación', details: result.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error en API de notificaciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}