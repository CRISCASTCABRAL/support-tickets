"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Users, UserCheck, UserX, Edit, Trash2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface User {
  id: string
  email: string
  name: string
  role: "USER" | "TECHNICIAN" | "ADMIN"
  createdAt: string
  hasOpenTickets: boolean
  openTicketsCount: number
}

interface PaginationData {
  total: number
  pages: number
  page: number
  limit: number
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "USER" as "USER" | "TECHNICIAN" | "ADMIN"
  })

  useEffect(() => {
    if (status === "loading") return
    if (!session) redirect("/login")
    
    const currentUserRole = (session.user as any)?.role
    if (currentUserRole !== "ADMIN" && currentUserRole !== "TECHNICIAN") {
      redirect("/dashboard")
    }
    
    fetchUsers()
  }, [session, status, pagination.page, search, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        role: roleFilter
      })

      const response = await fetch(`/api/users/manage?${params}`)
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users)
        setPagination(data.pagination)
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al cargar usuarios",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch("/api/users/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Usuario creado correctamente"
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al crear usuario",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/users/manage?id=${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Usuario actualizado correctamente"
        })
        setIsEditDialogOpen(false)
        resetForm()
        setSelectedUser(null)
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al actualizar usuario",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return

    try {
      const response = await fetch(`/api/users/manage?id=${userId}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Éxito",
          description: "Usuario eliminado correctamente"
        })
        fetchUsers()
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al eliminar usuario",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setFormData({
      email: "",
      name: "",
      password: "",
      role: "USER"
    })
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      name: user.name,
      password: "",
      role: user.role
    })
    setIsEditDialogOpen(true)
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: "bg-red-100 text-red-800 border-red-200",
      TECHNICIAN: "bg-blue-100 text-blue-800 border-blue-200",
      USER: "bg-green-100 text-green-800 border-green-200"
    }
    
    const labels = {
      ADMIN: "Administrador",
      TECHNICIAN: "Técnico",
      USER: "Usuario"
    }

    return (
      <Badge variant="outline" className={styles[role as keyof typeof styles]}>
        {labels[role as keyof typeof labels]}
      </Badge>
    )
  }

  const currentUserRole = (session?.user as any)?.role

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Administra usuarios, técnicos y sus permisos
          </p>
        </div>

        {currentUserRole === "ADMIN" && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                <DialogDescription>
                  Completa la información para crear un nuevo usuario en el sistema
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Usuario</SelectItem>
                      <SelectItem value="TECHNICIAN">Técnico</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false)
                      resetForm()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Crear Usuario</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Con Tickets Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.hasOpenTickets).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <UserX className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Técnicos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === "TECHNICIAN").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === "ADMIN").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los roles</SelectItem>
                  <SelectItem value="USER">Usuarios</SelectItem>
                  <SelectItem value="TECHNICIAN">Técnicos</SelectItem>
                  <SelectItem value="ADMIN">Administradores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Tickets Abiertos</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                {currentUserRole === "ADMIN" && <TableHead>Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {user.hasOpenTickets ? (
                        <>
                          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-red-600 font-medium">
                            {user.openTicketsCount} abierto{user.openTicketsCount !== 1 ? "s" : ""}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="h-2 w-2 bg-gray-300 rounded-full"></div>
                          <span className="text-gray-500">Sin tickets</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString("es-ES")}
                  </TableCell>
                  {currentUserRole === "ADMIN" && (
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination.pages > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4">
                Página {pagination.page} de {pagination.pages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario seleccionado
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre Completo</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                minLength={6}
                placeholder="Dejar vacío para mantener actual"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Rol</Label>
              <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Usuario</SelectItem>
                  <SelectItem value="TECHNICIAN">Técnico</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  resetForm()
                  setSelectedUser(null)
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">Actualizar Usuario</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}