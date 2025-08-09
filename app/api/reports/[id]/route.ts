import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateReportSchema } from '@/lib/validations'

// GET /api/reports/[id] - Obtener reporte específico
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: {
        reportedBy: {
          select: { id: true, name: true, email: true, role: true }
        },
        assignedTo: {
          select: { id: true, name: true, email: true, role: true }
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        logs: {
          include: {
            user: {
              select: { name: true, role: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      )
    }

    // Verificar permisos: usuarios solo pueden ver sus propios reportes
    if (session.user.role === 'USER' && report.reportedById !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver este reporte' },
        { status: 403 }
      )
    }

    return NextResponse.json({ report })

  } catch (error) {
    console.error('Error obteniendo reporte:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/reports/[id] - Actualizar reporte
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const report = await prisma.report.findUnique({
      where: { id: params.id }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      )
    }

    // Verificar permisos
    const canEdit = session.user.role === 'ADMIN' || 
                   session.user.role === 'TECHNICIAN' ||
                   (session.user.role === 'USER' && report.reportedById === session.user.id)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este reporte' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = UpdateReportSchema.parse(body)

    // Solo admins y técnicos pueden cambiar estado y asignación
    if (session.user.role === 'USER') {
      delete validatedData.status
      delete validatedData.assignedToId
    }

    const updatedReport = await prisma.report.update({
      where: { id: params.id },
      data: validatedData,
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
        action: 'updated',
        description: `Reporte actualizado por ${session.user.name}`,
        reportId: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json({
      message: 'Reporte actualizado exitosamente',
      report: updatedReport
    })

  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      )
    }

    console.error('Error actualizando reporte:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/reports/[id] - Eliminar reporte (solo admins)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const report = await prisma.report.findUnique({
      where: { id: params.id }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      )
    }

    await prisma.report.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Reporte eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error eliminando reporte:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}