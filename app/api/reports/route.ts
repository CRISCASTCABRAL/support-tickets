import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateReportSchema } from '@/lib/validations'
import { IncidentStatus, Priority } from '@prisma/client'

// GET /api/reports - Listar reportes con filtros
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as IncidentStatus | null
    const type = searchParams.get('type')
    const priority = searchParams.get('priority') as Priority | null
    const assignedTo = searchParams.get('assignedTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}

    // Filtros
    if (status) where.status = status
    if (type) where.type = type
    if (priority) where.priority = priority
    if (assignedTo) where.assignedToId = assignedTo

    // Si es usuario normal, solo ver sus propios reportes
    if (session.user.role === 'USER') {
      where.reportedById = session.user.id
    }

    const [reports, totalCount] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reportedBy: {
            select: { id: true, name: true, email: true }
          },
          assignedTo: {
            select: { id: true, name: true, email: true }
          },
          comments: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              author: {
                select: { name: true }
              }
            }
          },
          _count: {
            select: { comments: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.report.count({ where })
    ])

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error obteniendo reportes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/reports - Crear nuevo reporte
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = CreateReportSchema.parse(body)

    const report = await prisma.report.create({
      data: {
        ...validatedData,
        priority: validatedData.priority || Priority.MEDIUM,
        reportedById: session.user.id
      },
      include: {
        reportedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    // Crear log de actividad
    await prisma.activityLog.create({
      data: {
        action: 'created',
        description: `Reporte creado: "${report.title}"`,
        reportId: report.id,
        userId: session.user.id
      }
    })

    // Enviar notificación a técnicos (en background)
    try {
      const { NotificationService } = await import('@/lib/notifications')
      NotificationService.notifyNewReport(report.id)
    } catch (error) {
      console.error('Error enviando notificación:', error)
    }

    return NextResponse.json(
      { 
        message: 'Reporte creado exitosamente',
        report 
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

    console.error('Error creando reporte:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}