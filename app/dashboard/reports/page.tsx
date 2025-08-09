'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

import { ReportsTable } from '@/components/reports/reports-table'
import { Button } from '@/components/ui/button'
import { FileText, Plus } from 'lucide-react'

interface ReportsResponse {
  reports: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function ReportsContent() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [data, setData] = useState<ReportsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<any>({})

  useEffect(() => {
    // Leer filtros de los query params
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

    if (status || type || priority || search) {
      setFilters({
        status: status || '',
        type: type || '',
        priority: priority || '',
        search: search || ''
      })
    }
  }, [searchParams])

  useEffect(() => {
    async function fetchReports() {
      if (!session) return

      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: '10',
          ...filters
        })

        // Limpiar parámetros vacíos
        Object.keys(filters).forEach(key => {
          if (!filters[key]) {
            params.delete(key)
          }
        })

        const response = await fetch(`/api/reports?${params.toString()}`)
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Error fetching reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [session, currentPage, filters])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filtering
  }

  if (!session) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Debes iniciar sesión para ver los reportes</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reportes</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
            <p className="text-gray-600">
              {session.user.role === 'USER' 
                ? 'Tus reportes de incidencias técnicas'
                : 'Gestiona todos los reportes del sistema'
              }
            </p>
          </div>
        </div>

        <Button asChild>
          <Link href="/report/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Reporte
          </Link>
        </Button>
      </div>

      {/* Stats Summary */}
      {data && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-900">
              {data.pagination.total}
            </div>
            <p className="text-sm text-gray-600">Total de reportes</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">
              {data.reports.filter(r => r.status === 'OPEN').length}
            </div>
            <p className="text-sm text-gray-600">Abiertos</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">
              {data.reports.filter(r => r.status === 'IN_PROGRESS').length}
            </div>
            <p className="text-sm text-gray-600">En progreso</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">
              {data.reports.filter(r => r.status === 'RESOLVED').length}
            </div>
            <p className="text-sm text-gray-600">Resueltos</p>
          </div>
        </div>
      )}

      {/* Reports Table */}
      {data && (
        <ReportsTable
          reports={data.reports}
          totalPages={data.pagination.totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onFilter={handleFilter}
        />
      )}
    </div>
  )
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reportes</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-lg" />
          ))}
        </div>
      </div>
    }>
      <ReportsContent />
    </Suspense>
  )
}