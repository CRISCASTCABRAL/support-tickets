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

  // Crear reportes de ejemplo con los nuevos tipos
  const report1 = await prisma.report.create({
    data: {
      title: 'Computadora muy lenta para procesar facturas',
      description: 'El sistema ERP está funcionando muy lento desde esta mañana. Los usuarios no pueden procesar facturas de manera eficiente. La PC tarda más de 5 minutos en abrir Excel.',
      type: IncidentType.COMPUTER_SLOW,
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
      title: 'Mouse y teclado no responden correctamente',
      description: 'El mouse se congela cada pocos minutos y el teclado a veces no registra las teclas presionadas. Muy difícil trabajar así.',
      type: IncidentType.HARDWARE_MALFUNCTION,
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
      title: 'No puedo conectarme a internet desde mi escritorio',
      description: 'La conexión a internet se corta cada 10-15 minutos. No puedo acceder a páginas web ni recibir emails. Afecta mi productividad.',
      type: IncidentType.INTERNET_CONNECTION,
      priority: Priority.MEDIUM,
      status: IncidentStatus.RESOLVED,
      location: 'Área de Ventas',
      reportedById: user.id,
      assignedToId: technician.id,
    },
  })

  const report4 = await prisma.report.create({
    data: {
      title: 'Impresora no imprime documentos importantes',
      description: 'La impresora HP del segundo piso se atasca constantemente con las hojas. Necesito imprimir contratos urgentes.',
      type: IncidentType.PRINTER_PROBLEMS,
      priority: Priority.HIGH,
      status: IncidentStatus.OPEN,
      location: 'Oficina Principal - Piso 2',
      equipment: 'Impresora HP LaserJet Pro',
      reportedById: user.id,
    },
  })

  const report5 = await prisma.report.create({
    data: {
      title: 'Olvidé mi contraseña del sistema de nómina',
      description: 'No puedo acceder al sistema de nómina porque olvidé mi contraseña. Necesito procesarlos pagos de fin de mes.',
      type: IncidentType.PASSWORD_RESET,
      priority: Priority.MEDIUM,
      status: IncidentStatus.OPEN,
      location: 'RRHH - Piso 3',
      reportedById: user.id,
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

  console.log({ admin, technician, user, report1, report2, report3, report4, report5 })
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