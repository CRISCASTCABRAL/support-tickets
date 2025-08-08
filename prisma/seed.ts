import { PrismaClient, UserRole, IncidentType, Priority, IncidentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Crear usuarios de ejemplo
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tickets.com' },
    update: {},
    create: {
      email: 'admin@tickets.com',
      name: 'Administrador',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  })

  const technician = await prisma.user.upsert({
    where: { email: 'tech@tickets.com' },
    update: {},
    create: {
      email: 'tech@tickets.com',
      name: 'Técnico Principal',
      password: hashedPassword,
      role: UserRole.TECHNICIAN,
    },
  })

  const user = await prisma.user.upsert({
    where: { email: 'user@tickets.com' },
    update: {},
    create: {
      email: 'user@tickets.com',
      name: 'Usuario Demo',
      password: hashedPassword,
      role: UserRole.USER,
    },
  })

  // Crear reportes de ejemplo
  const report1 = await prisma.report.create({
    data: {
      title: 'Sistema lento en el área de contabilidad',
      description: 'El sistema ERP está funcionando muy lento desde esta mañana. Los usuarios no pueden procesar facturas de manera eficiente.',
      type: IncidentType.SYSTEM_FAILURE,
      priority: Priority.HIGH,
      status: IncidentStatus.OPEN,
      location: 'Oficina Contabilidad - Piso 2',
      equipment: 'Workstation DELL-001',
      reportedById: user.id,
      assignedToId: technician.id,
    },
  })

  const report2 = await prisma.report.create({
    data: {
      title: 'Computadora no enciende',
      description: 'La computadora del escritorio 15 no enciende. Se escucha un beep continuo al presionar el botón de encendido.',
      type: IncidentType.HARDWARE_ISSUE,
      priority: Priority.CRITICAL,
      status: IncidentStatus.IN_PROGRESS,
      location: 'Sala de Trabajo - Piso 1',
      equipment: 'PC-WS-015',
      reportedById: user.id,
      assignedToId: technician.id,
    },
  })

  const report3 = await prisma.report.create({
    data: {
      title: 'Internet intermitente en oficina',
      description: 'La conexión a internet se corta cada 10-15 minutos. Afecta principalmente el área de ventas.',
      type: IncidentType.NETWORK_ISSUE,
      priority: Priority.MEDIUM,
      status: IncidentStatus.RESOLVED,
      location: 'Área de Ventas',
      reportedById: user.id,
      assignedToId: technician.id,
    },
  })

  // Crear comentarios de ejemplo
  await prisma.comment.create({
    data: {
      content: 'Iniciando diagnóstico del sistema. Revisando logs del servidor.',
      reportId: report1.id,
      authorId: technician.id,
    },
  })

  await prisma.comment.create({
    data: {
      content: 'Problema identificado: memoria RAM defectuosa. Reemplazando componente.',
      reportId: report2.id,
      authorId: technician.id,
    },
  })

  // Crear logs de actividad
  await prisma.activityLog.create({
    data: {
      action: 'created',
      description: 'Reporte creado por el usuario',
      reportId: report1.id,
      userId: user.id,
    },
  })

  await prisma.activityLog.create({
    data: {
      action: 'assigned',
      description: 'Reporte asignado al técnico principal',
      reportId: report1.id,
      userId: admin.id,
    },
  })

  console.log({ admin, technician, user, report1, report2, report3 })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })