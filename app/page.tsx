import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="glass">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sistema de Reportes</CardTitle>
            <CardDescription>
              Gestiona incidencias técnicas de forma eficiente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Link href="/login">
                <Button className="w-full">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Registrarse
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}