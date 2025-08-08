import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/users/technicians - Obtener técnicos disponibles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'TECHNICIAN')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const technicians = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'TECHNICIAN' },
          { role: 'ADMIN' }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            assignedIncidents: {
              where: {
                status: {
                  in: ['OPEN', 'IN_PROGRESS']
                }
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    // Agregar información de carga de trabajo
    const techniciansWithWorkload = technicians.map(tech => ({
      ...tech,
      workload: tech._count.assignedIncidents
    }))

    return NextResponse.json({ technicians: techniciansWithWorkload })

  } catch (error) {
    console.error('Error obteniendo técnicos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}