# Vercel Environment Variables Setup

Para que el sitio funcione correctamente en Vercel, necesitas configurar estas variables de entorno:

## Variables Requeridas:

1. **DATABASE_URL**: La URL de tu base de datos PostgreSQL con Prisma Accelerate
   ```
   DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
   ```

2. **NEXTAUTH_URL**: La URL de tu sitio en producción
   ```
   NEXTAUTH_URL="https://tu-sitio.vercel.app"
   ```

3. **NEXTAUTH_SECRET**: Una clave secreta para NextAuth (genera una aleatoria)
   ```
   NEXTAUTH_SECRET="tu-clave-secreta-muy-larga-y-segura"
   ```

## Variables Opcionales:

4. **RESEND_API_KEY**: Para notificaciones por email (opcional)
   ```
   RESEND_API_KEY="re_..."
   ```

## Cómo configurar en Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega cada variable con su valor
4. Redeploy el proyecto

## Generar NEXTAUTH_SECRET:

Ejecuta este comando para generar una clave segura:
```bash
openssl rand -base64 32
```

O usa este generador online: https://generate-secret.vercel.app/32