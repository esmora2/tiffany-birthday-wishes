# Configuración AWS S3 + CloudFront para Tiffany Birthday Wishes

## 1. Variables de Entorno en Netlify

Debes agregar estas variables en el dashboard de Netlify:
**Site Settings → Environment variables → Add variable**

```bash
AWS_ACSS_KEY_ID=AK...SFQ
AWS_SCRT_ACCESS_KEY=6Rz3Rp...RJx
AWS_STORAGE_BUCKET_NAME=imagesbucketxse
AWS_S3_CUSTOM_DOMAIN=d2i...a86dq.cloudfront.net
AWS_RGN=us-east-1
```

⚠️ **Importante**: Después de agregar las variables, haz un nuevo deploy para que tomen efecto.

---

## 2. Configuración del Bucket S3

### Permisos del Bucket (Bucket Policy)

Tu bucket debe permitir escritura desde Netlify y lectura pública (porque CloudFront sirve el contenido):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::imagesbucketxse/*"
    }
  ]
}
```

### CORS Configuration (si subes desde frontend directamente en el futuro)

En S3 Console → Bucket → Permissions → CORS:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

---

## 3. Verificar CloudFront

Tu distribución CloudFront (`d2i...a86dq.cloudfront.net`) debe:
- Tener como origen tu bucket S3 `imagesbucketxse`
- Permitir métodos GET, HEAD (mínimo)
- Cache policy recomendada: CachingOptimized o custom con TTL largo

Todas las imágenes se guardarán en la ruta:
```
https://d2i...a86dq.cloudfront.net/tiffbd/TIMESTAMP-RANDOM.jpg
```

---

## 4. Flujo Implementado

1. **Usuario sube foto** → Frontend convierte a base64 (JPEG/PNG compatible)
2. **POST a /save-wish** → Netlify Function recibe base64
3. **Subida a S3**:
   - Extrae buffer del base64
   - Sube a `s3://imagesbucketxse/tiffbd/TIMESTAMP-RANDOM.jpg`
   - Genera URL: `https://CLOUDFRONT_DOMAIN/tiffbd/FILENAME.jpg`
4. **Guarda en Supabase**:
   - Columna `photo` = URL de CloudFront (no base64)
   - Metadatos: name, message, timestamp

---

## 5. Ventajas de este enfoque

✅ **Menor coste**: S3 + CloudFront es más barato que Supabase Storage  
✅ **Mejor rendimiento**: CloudFront CDN global con edge locations  
✅ **Menor carga en DB**: Supabase solo guarda URL (~100 bytes vs >100KB base64)  
✅ **Escalabilidad**: S3 maneja millones de archivos sin problema  
✅ **Cache inteligente**: CloudFront cachea imágenes cerca del usuario  

---

## 6. Región de S3

La función actual usa `region: 'us-east-1'`. Si tu bucket está en otra región (por ejemplo `us-west-2`), edita esta línea en `save-wish.js`:

```js
const s3Client = new S3Client({
  region: 'us-west-2', // ← Cambia según AWS_RGN
  credentials: { ... }
});
```

Para verificar la región de tu bucket:
- AWS Console → S3 → Bucket → Properties → AWS Region

---

## 7. Testing

Después de configurar las variables y hacer deploy:

1. Ve a tu formulario: `https://tu-sitio.netlify.app/`
2. Sube un mensaje con foto
3. Revisa:
   - **S3 Console**: Debería aparecer en `imagesbucketxse/tiffbd/`
   - **Supabase**: Columna `photo` debe tener URL de CloudFront
   - **Board**: La imagen debe cargarse desde CloudFront

---

## 8. Troubleshooting

### Error: "Access Denied" al subir
- Verifica que `AWS_ACSS_KEY_ID` y `AWS_SCRT_ACCESS_KEY` sean correctos
- Verifica permisos del usuario IAM (debe tener `s3:PutObject` en el bucket)

### Imagen no se muestra en el board
- Verifica que CloudFront esté configurado correctamente
- Comprueba que el bucket tenga permisos públicos de lectura
- Revisa la URL en Supabase (debe empezar con `https://d2i...a86dq.cloudfront.net/tiffbd/`)

### Error: "Region not set"
- Asegúrate de especificar la región correcta en el S3Client

---

## 9. Próximos Pasos Opcionales

### A) Migrar fotos base64 existentes a S3
Usa el script `migrate-base64-to-s3.js` (ver abajo) para mover las imágenes ya guardadas.

### B) Subir directamente desde el navegador
Para evitar pasar base64 por la función (más rápido):
1. Frontend solicita signed URL a función auxiliar
2. Frontend sube archivo directamente a S3 con PUT
3. Frontend envía URL a `save-wish` para guardar metadata

### C) Optimización de imágenes
Considera usar Lambda@Edge en CloudFront para:
- Redimensionar imágenes on-the-fly
- Convertir a WebP automáticamente
- Comprimir aún más

---

## Resumen Rápido

```bash
# 1. Agregar env vars en Netlify dashboard
# 2. Hacer deploy nuevo
# 3. Probar subida de foto
# 4. Verificar que aparece en S3 bajo tiffbd/
# 5. Verificar que la URL en Supabase sea de CloudFront
# 6. ✅ ¡Listo!
```

¿Necesitas el script de migración? Lo creo en el siguiente archivo.
