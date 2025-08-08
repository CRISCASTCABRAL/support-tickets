# Sistema de Reportes de Incidencias

Una aplicación moderna para gestionar reportes de problemas técnicos, construida con Next.js 14, Prisma, y PostgreSQL.

## 🚀 Características

- **Gestión de Reportes**: Crear, visualizar y gestionar incidencias técnicas
- **Sistema de Roles**: Usuario, Técnico y Administrador
- **Dashboard Analítico**: Métricas y estadísticas en tiempo real
- **Notificaciones**: Alertas automáticas por email
- **Interface Moderna**: Diseño responsive con Tailwind CSS y shadcn/ui

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de datos**: PostgreSQL
- **Autenticación**: NextAuth.js
- **UI Components**: shadcn/ui
- **Hosting**: Vercel

## 📋 Requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

## ⚡ Instalación

1. Clona el repositorio:
\`\`\`bash
git clone <repository-url>
cd tickets-app
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Configura las variables de entorno:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Configura la base de datos:
\`\`\`bash
npx prisma migrate dev
npx prisma db seed
\`\`\`

5. Inicia el servidor de desarrollo:
\`\`\`bash
npm run dev
\`\`\`

## 📊 Scripts Disponibles

- \`npm run dev\` - Servidor de desarrollo
- \`npm run build\` - Build de producción
- \`npm run start\` - Servidor de producción
- \`npm run lint\` - Linter

## 👥 Usuarios de Prueba

- **Admin**: admin@tickets.com / admin123
- **Técnico**: tech@tickets.com / admin123  
- **Usuario**: user@tickets.com / admin123

## 📝 Licencia

MIT License