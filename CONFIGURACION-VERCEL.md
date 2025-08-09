# 🚨 URGENTE: Configuración de Vercel

## El problema actual:
El framework se cambió de Next.js a Vite y está causando errores de build.

## ✅ SOLUCIÓN - Ve a tu Vercel Dashboard:

1. **Ve a**: https://vercel.com/dashboard
2. **Selecciona** tu proyecto "support-tickets" 
3. **Settings** → **General**
4. En **Framework Preset**: Cambia de "Vite" a **"Next.js"**
5. **Save** la configuración
6. Ve a **Deployments** → Haz clic en **"Redeploy"**

## ⚠️ IMPORTANTE:
- NO uses configuración manual de framework
- Next.js se autodetecta automáticamente 
- El vercel.json fue eliminado (causaba conflictos)

## 🎯 Después del cambio:
El sitio debería funcionar correctamente con:
- Framework: **Next.js** (autodetectado)
- Build Command: `npm run build` (automático)
- Output Directory: `.next` (automático)
- Node.js Version: 18.x (recomendado)

¡Esto solucionará el error de build inmediatamente!