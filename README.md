# 🎂 Tiffany Birthday Wishes Board

Aplicación web para recopilar mensajes de cumpleaños para Tiffany (11 de diciembre, 2025).

## 🎨 Características

- **Formulario público** (`/`) - Los invitados pueden dejar mensajes con nombre, texto y foto opcional
- **Board de visualización** (`/tiffbdboard`) - Mosaico visual de todos los mensajes (solo para la cumpleañera)
- **Panel de administración** (`/77726b3`) - Gestión de mensajes con opción de eliminar

## 🚀 Deploy en Netlify

### Opción 1: Deploy desde CLI (recomendado)

1. **Instala Netlify CLI:**
```bash
npm install -g netlify-cli
```

2. **Instala dependencias:**
```bash
cd tiffany-birthday-wishes
npm install
```

3. **Autentícate con Netlify:**
```bash
netlify login
```

4. **Inicia el proyecto:**
```bash
netlify init
```
Sigue las instrucciones para crear un nuevo sitio o conectar uno existente.

5. **Deploy:**
```bash
netlify deploy --prod
```

### Opción 2: Deploy desde GitHub

1. Sube este proyecto a un repositorio de GitHub
2. Ve a [Netlify](https://app.netlify.com)
3. Click en "Add new site" → "Import an existing project"
4. Conecta tu repositorio de GitHub
5. Configuración:
   - **Build command:** (dejar vacío o `echo "No build needed"`)
   - **Publish directory:** `public`
6. Click en "Deploy site"

## 🔧 Configuración

### Variables de entorno (REQUERIDAS)

El proyecto usa **Supabase** (base de datos) + **AWS S3 + CloudFront** (almacenamiento de imágenes).

#### Variables de Supabase
1. Ve a Site settings → Environment variables en Netlify
2. Añade:
   - `SUPABASE_URL`: URL de tu proyecto Supabase
   - `SUPABASE_ANON_KEY`: Anon key de Supabase

#### Variables de AWS S3 + CloudFront
Añade estas variables para almacenar imágenes en S3:
   - `AWS_ACSS_KEY_ID`: Tu access key de AWS
   - `AWS_SCRT_ACCESS_KEY`: Tu secret access key
   - `AWS_STORAGE_BUCKET_NAME`: Nombre del bucket (ej: `imagesbucketxse`)
   - `AWS_S3_CUSTOM_DOMAIN`: Dominio de CloudFront (ej: `d2i...a86dq.cloudfront.net`)
   - `AWS_RGN`: Región de AWS (ej: `us-east-1`)

**📖 Ver [AWS_S3_SETUP.md](./AWS_S3_SETUP.md) para configuración detallada**

## 📱 Rutas de la aplicación

- `/` - Formulario público para enviar mensajes
- `/tiffbdboard` - Board visual de mensajes (para Tiffany)
- `/77726b3` - Panel de administración (privado)

## 🎯 Límite de tiempo

El formulario acepta mensajes hasta las **21:00 del 11 de diciembre de 2025**.
Después de esa hora, se mostrará un mensaje indicando que el período ha terminado.

## 🎨 Personalización de colores

Los colores están inspirados en el proyecto LaraBirthday original:
- Rosa pastel (#ee9ca7)
- Turquesa (#66cccc)
- Amarillo suave (#ffcc66)
- Verde menta (#00cc99)

Para cambiar colores, edita las variables CSS en `public/css/style.css`:
```css
:root {
  --color-primary: #ee9ca7;
  --color-secondary: #66cccc;
  /* ... */
}
```

## 🧪 Testing local

Para probar localmente antes de hacer deploy:

```bash
npm install
netlify dev
```

Esto iniciará un servidor local en `http://localhost:8888` con las funciones serverless funcionando.

## 📝 Notas importantes

1. **Imágenes**: Las fotos se suben a **AWS S3** y se sirven a través de **CloudFront CDN** para mejor rendimiento. La base de datos solo guarda las URLs.

2. **Migración de fotos antiguas**: Si ya tienes mensajes con fotos en base64, usa el script `migrate-base64-to-s3.js` para migrarlas a S3.

3. **Límite de almacenamiento**: S3 tiene costos muy bajos. CloudFront incluye 1TB/mes gratis en la capa gratuita.

4. **Seguridad del panel admin**: La ruta `/77726b3` no está protegida con autenticación. Solo compártela con personas de confianza. Para mayor seguridad, considera añadir Netlify Identity.

5. **Optimización de imágenes**: Las imágenes se convierten automáticamente a JPEG con compresión 85% y se redimensionan a máximo 1920px.

## 🎁 Créditos

Diseño inspirado en el proyecto LaraBirthday original.
Desarrollado con ❤️ para el cumpleaños de Tiffany.
