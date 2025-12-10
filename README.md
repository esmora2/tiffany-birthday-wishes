# 🎂 Tiffany Birthday Wishes Board

Aplicación web para recopilar mensajes de cumpleaños para Tiffany (10 de diciembre, 2025).

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

### Variables de entorno (opcional)

Si quieres usar una base de datos externa como Supabase en lugar de Netlify Blobs:

1. Ve a Site settings → Environment variables en Netlify
2. Añade:
   - `SUPABASE_URL`: URL de tu proyecto Supabase
   - `SUPABASE_KEY`: Anon key de Supabase

### Netlify Blobs

El proyecto usa Netlify Blobs por defecto (incluido gratis en todos los planes).
No requiere configuración adicional - funcionará automáticamente al hacer deploy.

## 📱 Rutas de la aplicación

- `/` - Formulario público para enviar mensajes
- `/tiffbdboard` - Board visual de mensajes (para Tiffany)
- `/77726b3` - Panel de administración (privado)

## 🎯 Límite de tiempo

El formulario acepta mensajes hasta las **8:00 PM del 10 de diciembre de 2025**.
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

1. **Imágenes**: Las fotos se guardan en base64 dentro de Netlify Blobs. Para proyectos con muchas imágenes grandes, considera usar un servicio de almacenamiento de imágenes como Cloudinary.

2. **Límite de almacenamiento**: Netlify Blobs tiene límites según el plan. El plan gratuito incluye 1GB.

3. **Seguridad del panel admin**: La ruta `/77726b3` no está protegida con autenticación. Solo compártela con personas de confianza. Para mayor seguridad, considera añadir Netlify Identity.

## 🎁 Créditos

Diseño inspirado en el proyecto LaraBirthday original.
Desarrollado con ❤️ para el cumpleaños de Tiffany.
