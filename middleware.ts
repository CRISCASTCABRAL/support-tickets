import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Rutas que requieren roles específicos
    if (path.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url))
      }
    }

    if (path.startsWith('/dashboard/admin')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    if (path.startsWith('/api/users') && !path.startsWith('/api/users/technicians')) {
      if (token?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Rutas públicas
        if (path === '/' || path === '/login' || path === '/register') {
          return true
        }

        // API de registro (pública)
        if (path === '/api/auth/register') {
          return true
        }

        // Otras rutas requieren autenticación
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/report/:path*',
    '/api/reports/:path*',
    '/api/users/:path*',
    '/api/auth/register'
  ]
}