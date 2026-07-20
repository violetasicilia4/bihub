# Adyr BI Hub

Un hub simple para encontrar dashboards por vertical, métrica o equipo con link directo y contexto de uso.

La lista de tableros vive en una base de datos de Supabase compartida por todo el equipo:
cualquiera con el link ve los tableros (solo lectura), y únicamente la cuenta de
administradora puede agregar, editar o borrar.

## 1. Configurar la base de datos (Supabase)

1. Creá una cuenta / proyecto en [supabase.com](https://supabase.com) (plan gratuito alcanza).
2. En tu proyecto, andá a **SQL Editor** → **New query**, pegá el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y ejecutalo. Esto crea la tabla `dashboards`,
   las reglas de seguridad (RLS) y carga los tableros de ejemplo.
3. Cualquier cuenta que inicie sesión puede crear, editar o borrar tableros. Como la app
   no tiene un formulario público de registro, la única forma de tener una cuenta es que
   la crees vos a mano en el paso siguiente — por eso no hace falta identificar tu email
   en ningún lado del código.
4. Creá tu usuario administrador en **Authentication > Users > Add user** con tu email
   y una contraseña. Esa es la cuenta con la que vas a iniciar sesión como admin en la web.
   No crees cuentas ahí para nadie más que no deba tener permisos de administración.
5. Copiá **Project Settings > API > Project URL** y **anon public key**: los vas a necesitar
   en el paso siguiente.

## 2. Desarrollo local

**Requisitos:** Node.js

1. Instalar dependencias:
   `npm install`
2. Copiar `.env.example` a `.env.local` y completar `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` con los datos de tu proyecto Supabase.
3. Levantar el servidor de desarrollo:
   `npm run dev`
4. Compilar para producción:
   `npm run build`

## 3. Deploy en Vercel

Este proyecto es una app estática de Vite + React. Vercel detecta el framework automáticamente:

- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** agregá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en
  Project Settings > Environment Variables (mismos valores que en `.env.local`).

Una vez deployado, compartí la URL con tu equipo: van a poder ver todos los tableros sin
necesidad de iniciar sesión. Vos entrás con el botón **Admin** del header y tu email/contraseña
de Supabase para agregar, editar o eliminar tableros.

## 4. Evitar que Supabase se pause por inactividad

El plan free de Supabase pausa el proyecto automáticamente si pasan **7 días sin requests**
a la API. Este repo incluye un workflow de GitHub Actions
([`.github/workflows/supabase-keepalive.yml`](.github/workflows/supabase-keepalive.yml)) que
hace una consulta liviana a la tabla `dashboards` cada 3 días para mantenerlo activo.

Para activarlo, en GitHub andá a **Settings > Secrets and variables > Actions** en este repo
y agregá dos secrets (mismos valores que `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

El workflow corre solo mientras el repo tenga actividad en GitHub (commits/PRs); si el repo
también queda inactivo por más de 60 días, GitHub deshabilita los cron jobs automáticamente
y hay que reactivarlo a mano desde la pestaña **Actions** (o hacer cualquier commit/push).
