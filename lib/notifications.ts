import { Resend } from 'resend'
import { prisma } from './prisma'

let resend: Resend | null = null

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

interface EmailTemplate {
  to: string
  subject: string
  html: string
}

export class NotificationService {
  
  // Enviar email genérico
  static async sendEmail({ to, subject, html }: EmailTemplate) {
    const resendClient = getResendClient()
    
    if (!resendClient) {
      console.log('RESEND_API_KEY no configurado - simulando envío de email')
      console.log(`Para: ${to}`)
      console.log(`Asunto: ${subject}`)
      return { success: true, simulated: true }
    }

    try {
      const { data, error } = await resendClient.emails.send({
        from: 'Sistema de Reportes <noreply@tickets.com>',
        to: [to],
        subject,
        html
      })

      if (error) {
        console.error('Error enviando email:', error)
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error enviando email:', error)
      return { success: false, error }
    }
  }

  // Notificar nuevo reporte creado
  static async notifyNewReport(reportId: string) {
    try {
      const report = await prisma.report.findUnique({
        where: { id: reportId },
        include: {
          reportedBy: true
        }
      })

      if (!report) return

      // Obtener técnicos para notificar
      const technicians = await prisma.user.findMany({
        where: {
          OR: [
            { role: 'TECHNICIAN' },
            { role: 'ADMIN' }
          ]
        },
        select: { email: true, name: true }
      })

      const subject = `🚨 Nuevo Reporte: ${report.title}`
      const priority = report.priority === 'CRITICAL' ? '🔴 CRÍTICA' : 
                      report.priority === 'HIGH' ? '🟠 ALTA' :
                      report.priority === 'MEDIUM' ? '🟡 MEDIA' : '🔵 BAJA'

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Nuevo Reporte de Incidencia</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">${report.title}</h3>
            <p style="margin: 5px 0;"><strong>Prioridad:</strong> ${priority}</p>
            <p style="margin: 5px 0;"><strong>Tipo:</strong> ${report.type.replace('_', ' ')}</p>
            <p style="margin: 5px 0;"><strong>Reportado por:</strong> ${report.reportedBy.name}</p>
            ${report.location ? `<p style="margin: 5px 0;"><strong>Ubicación:</strong> ${report.location}</p>` : ''}
            ${report.equipment ? `<p style="margin: 5px 0;"><strong>Equipo:</strong> ${report.equipment}</p>` : ''}
          </div>
          
          <div style="background: white; padding: 15px; border-left: 4px solid #3b82f6;">
            <h4 style="margin: 0 0 10px 0; color: #1f2937;">Descripción:</h4>
            <p style="margin: 0; color: #4b5563;">${report.description}</p>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard/reports" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver Reporte
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            Sistema de Reportes - Gestión de Incidencias
          </p>
        </div>
      `

      // Enviar a todos los técnicos
      for (const tech of technicians) {
        await this.sendEmail({
          to: tech.email,
          subject,
          html
        })
      }

      return { success: true }

    } catch (error) {
      console.error('Error enviando notificación de nuevo reporte:', error)
      return { success: false, error }
    }
  }

  // Notificar reporte asignado
  static async notifyReportAssigned(reportId: string) {
    try {
      const report = await prisma.report.findUnique({
        where: { id: reportId },
        include: {
          reportedBy: true,
          assignedTo: true
        }
      })

      if (!report || !report.assignedTo) return

      const subject = `📋 Reporte Asignado: ${report.title}`
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Reporte Asignado a Ti</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">${report.title}</h3>
            <p style="margin: 5px 0;"><strong>ID:</strong> #${report.id.slice(-8)}</p>
            <p style="margin: 5px 0;"><strong>Prioridad:</strong> ${report.priority}</p>
            <p style="margin: 5px 0;"><strong>Estado:</strong> ${report.status}</p>
            <p style="margin: 5px 0;"><strong>Reportado por:</strong> ${report.reportedBy.name}</p>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/report/${report.id}" 
               style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver Detalles del Reporte
            </a>
          </div>
        </div>
      `

      await this.sendEmail({
        to: report.assignedTo.email,
        subject,
        html
      })

      return { success: true }

    } catch (error) {
      console.error('Error enviando notificación de asignación:', error)
      return { success: false, error }
    }
  }

  // Notificar cambio de estado
  static async notifyStatusChanged(reportId: string, newStatus: string) {
    try {
      const report = await prisma.report.findUnique({
        where: { id: reportId },
        include: {
          reportedBy: true,
          assignedTo: true
        }
      })

      if (!report) return

      const statusText = newStatus === 'RESOLVED' ? 'Resuelto' :
                        newStatus === 'CLOSED' ? 'Cerrado' :
                        newStatus === 'IN_PROGRESS' ? 'En Progreso' : 'Abierto'

      const subject = `✅ Estado Actualizado: ${report.title} - ${statusText}`
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Estado del Reporte Actualizado</h2>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">${report.title}</h3>
            <p style="margin: 5px 0;"><strong>Nuevo Estado:</strong> <span style="color: #10b981; font-weight: bold;">${statusText}</span></p>
            ${report.assignedTo ? `<p style="margin: 5px 0;"><strong>Técnico:</strong> ${report.assignedTo.name}</p>` : ''}
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/report/${report.id}" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver Reporte
            </a>
          </div>
        </div>
      `

      // Notificar al usuario que reportó
      await this.sendEmail({
        to: report.reportedBy.email,
        subject,
        html
      })

      return { success: true }

    } catch (error) {
      console.error('Error enviando notificación de cambio de estado:', error)
      return { success: false, error }
    }
  }
}