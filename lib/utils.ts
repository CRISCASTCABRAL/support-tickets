import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function getStatusColor(status: string) {
  const colors = {
    open: 'text-red-600 bg-red-50 border-red-200',
    in_progress: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    resolved: 'text-green-600 bg-green-50 border-green-200',
    closed: 'text-gray-600 bg-gray-50 border-gray-200'
  }
  return colors[status as keyof typeof colors] || colors.open
}

export function getPriorityColor(priority: string) {
  const colors = {
    low: 'text-blue-600 bg-blue-50 border-blue-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200'
  }
  return colors[priority as keyof typeof colors] || colors.medium
}