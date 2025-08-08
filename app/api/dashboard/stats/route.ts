import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IncidentStatus, IncidentType, Priority } from '@prisma/client'

// GET /api/dashboard/stats - Obtener estadísticas del dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const where: any = {}

    // Si es usuario normal, solo sus propios reportes
    if (session.user.role === 'USER') {
      where.reportedById = session.user.id
    }

    // Estadísticas generales
    const [
      totalReports,
      openReports,
      inProgressReports,
      resolvedReports,
      closedReports,
      criticalReports,
      reportsByType,
      reportsByPriority,
      recentReports
    ] = await Promise.all([
      // Total de reportes
      prisma.report.count({ where }),
      
      // Reportes por estado
      prisma.report.count({ where: { ...where, status: IncidentStatus.OPEN } }),
      prisma.report.count({ where: { ...where, status: IncidentStatus.IN_PROGRESS } }),
      prisma.report.count({ where: { ...where, status: IncidentStatus.RESOLVED } }),
      prisma.report.count({ where: { ...where, status: IncidentStatus.CLOSED } }),
      
      // Reportes críticos
      prisma.report.count({ where: { ...where, priority: Priority.CRITICAL } }),
      
      // Reportes por tipo
      prisma.report.groupBy({
        by: ['type'],
        where,
        _count: { type: true }
      }),
      
      // Reportes por prioridad
      prisma.report.groupBy({
        by: ['priority'],
        where,
        _count: { priority: true }
      }),
      
      // Reportes recientes
      prisma.report.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          reportedBy: {
            select: { name: true }
          },
          assignedTo: {
            select: { name: true }
          }
        }
      })
    ])

    // Calcular tendencias (comparar con mes anterior)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const lastMonthReports = await prisma.report.count({
      where: {
        ...where,
        createdAt: {
          gte: lastMonth
        }
      }
    })

    const thisMonthReports = await prisma.report.count({
      where: {
        ...where,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }
    })

    // Formatear datos para gráficos
    const statusStats = {
      open: openReports,
      in_progress: inProgressReports,
      resolved: resolvedReports,
      closed: closedReports
    }

    const typeStats = Object.fromEntries(
      Object.values(IncidentType).map(type => [
        type.toLowerCase(),
        reportsByType.find(r => r.type === type)?._count?.type || 0
      ])
    )

    const priorityStats = Object.fromEntries(
      Object.values(Priority).map(priority => [
        priority.toLowerCase(),
        reportsByPriority.find(r => r.priority === priority)?._count?.priority || 0
      ])
    )

    const stats = {
      overview: {
        total: totalReports,
        open: openReports,
        inProgress: inProgressReports,
        resolved: resolvedReports,
        closed: closedReports,
        critical: criticalReports
      },
      trends: {
        thisMonth: thisMonthReports,
        lastMonth: lastMonthReports,
        change: lastMonthReports > 0 ? 
          ((thisMonthReports - lastMonthReports) / lastMonthReports * 100).toFixed(1) : 
          '0'
      },
      charts: {
        status: statusStats,
        type: typeStats,
        priority: priorityStats
      },
      recent: recentReports
    }

    return NextResponse.json({ stats })

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}