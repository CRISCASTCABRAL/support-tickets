import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateCommentSchema } from '@/lib/validations'

// GET /api/reports/[id]/comments - Obtener comentarios de un reporte
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el reporte existe y el usuario tiene permisos
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      select: { reportedById: true }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      )
    }

    // Usuarios solo pueden ver comentarios de sus propios reportes
    if (session.user.role === 'USER' && report.reportedById !== session.user.id) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver estos comentarios' },
        { status: 403 }
      )
    }

    const comments = await prisma.comment.findMany({
      where: { reportId: params.id },
      include: {
        author: {
          select: { id: true, name: true, role: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    return NextResponse.json({ comments })

  } catch (error) {
    console.error('Error obteniendo comentarios:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/reports/[id]/comments - Crear nuevo comentario
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = CreateCommentSchema.parse({
      ...body,
      reportId: params.id
    })

    // Verificar que el reporte existe y el usuario tiene permisos
    const report = await prisma.report.findUnique({
      where: { id: params.id },
      select: { reportedById: true, assignedToId: true }
    })

    if (!report) {
      return NextResponse.json(
        { error: 'Reporte no encontrado' },
        { status: 404 }
      )
    }

    // Verificar permisos: solo el reportador, el técnico asignado, o admin/técnicos pueden comentar
    const canComment = session.user.role === 'ADMIN' ||
                      session.user.role === 'TECHNICIAN' ||
                      report.reportedById === session.user.id ||
                      report.assignedToId === session.user.id

    if (!canComment) {
      return NextResponse.json(
        { error: 'No tienes permisos para comentar en este reporte' },
        { status: 403 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content: validatedData.content,
        reportId: params.id,
        authorId: session.user.id
      },
      include: {
        author: {
          select: { id: true, name: true, role: true }
        }
      }
    })

    // Crear log de actividad
    await prisma.activityLog.create({
      data: {
        action: 'commented',
        description: `${session.user.name} agregó un comentario`,
        reportId: params.id,
        userId: session.user.id
      }
    })

    return NextResponse.json(
      {
        message: 'Comentario agregado exitosamente',
        comment
      },
      { status: 201 }
    )

  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error },
        { status: 400 }
      )
    }

    console.error('Error creando comentario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}