import { z } from 'zod'
import { IncidentType, Priority, IncidentStatus, UserRole } from '@prisma/client'

// Validaciones de Usuario
export const RegisterSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.nativeEnum(UserRole).optional()
})

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
})

// Validaciones de Reportes
export const CreateReportSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  type: z.nativeEnum(IncidentType),
  priority: z.nativeEnum(Priority).optional(),
  location: z.string().optional(),
  equipment: z.string().optional(),
  imageUrl: z.string().url().optional()
})

export const UpdateReportSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(10).optional(),
  type: z.nativeEnum(IncidentType).optional(),
  priority: z.nativeEnum(Priority).optional(),
  status: z.nativeEnum(IncidentStatus).optional(),
  location: z.string().optional(),
  equipment: z.string().optional(),
  imageUrl: z.string().url().optional(),
  assignedToId: z.string().optional()
})

// Validaciones de Comentarios
export const CreateCommentSchema = z.object({
  content: z.string().min(1, 'El comentario no puede estar vacío'),
  reportId: z.string()
})

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type CreateReportInput = z.infer<typeof CreateReportSchema>
export type UpdateReportInput = z.infer<typeof UpdateReportSchema>
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>