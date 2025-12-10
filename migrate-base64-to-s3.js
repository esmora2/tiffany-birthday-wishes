#!/usr/bin/env node
/**
 * Script de migración: Base64 en Supabase → S3 + CloudFront
 * 
 * Este script:
 * 1. Lee todas las filas de birthday_wishes que tienen photo como base64
 * 2. Sube cada imagen a S3 en la carpeta tiffbd/
 * 3. Actualiza la fila con la URL de CloudFront
 * 
 * Uso:
 *   node migrate-base64-to-s3.js
 * 
 * Requisitos:
 *   - Variables de entorno configuradas (ver abajo)
 *   - npm install @supabase/supabase-js @aws-sdk/client-s3
 */

require('dotenv').config(); // Opcional: carga .env si lo usas localmente
const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// =====================================================
// CONFIGURACIÓN
// =====================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Service role key (admin)
const AWS_ACSS_KEY_ID = process.env.AWS_ACSS_KEY_ID;
const AWS_SCRT_ACCESS_KEY = process.env.AWS_SCRT_ACCESS_KEY;
const AWS_STORAGE_BUCKET_NAME = process.env.AWS_STORAGE_BUCKET_NAME;
const AWS_S3_CUSTOM_DOMAIN = process.env.AWS_S3_CUSTOM_DOMAIN;
const AWS_RGN = process.env.AWS_RGN || 'us-east-1';

// Validar variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridas');
  process.exit(1);
}
if (!AWS_ACSS_KEY_ID || !AWS_SCRT_ACCESS_KEY || !AWS_STORAGE_BUCKET_NAME || !AWS_S3_CUSTOM_DOMAIN) {
  console.error('❌ Error: Variables AWS no configuradas');
  process.exit(1);
}

// Inicializar clientes
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const s3Client = new S3Client({
  region: AWS_RGN,
  credentials: {
    accessKeyId: AWS_ACSS_KEY_ID,
    secretAccessKey: AWS_SCRT_ACCESS_KEY
  }
});

// =====================================================
// FUNCIONES
// =====================================================

/**
 * Sube imagen base64 a S3
 */
async function uploadToS3(dataUrl, originalId) {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid data URL format');
  }

  const contentType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  const timestamp = Date.now();
  const extension = contentType.split('/')[1] || 'jpg';
  const filename = `migrated-${originalId}-${timestamp}.${extension}`;
  const s3Key = `tiffbd/${filename}`;

  const command = new PutObjectCommand({
    Bucket: AWS_STORAGE_BUCKET_NAME,
    Key: s3Key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  });

  await s3Client.send(command);
  
  return `https://${AWS_S3_CUSTOM_DOMAIN}/${s3Key}`;
}

/**
 * Migrar una fila
 */
async function migrateRow(row) {
  try {
    // Verificar que sea base64
    if (!row.photo || !row.photo.startsWith('data:')) {
      console.log(`⏭️  Fila ${row.id}: No tiene base64, saltando...`);
      return { skipped: true };
    }

    console.log(`📤 Subiendo imagen de fila ${row.id} a S3...`);
    const cloudfrontUrl = await uploadToS3(row.photo, row.id);

    console.log(`💾 Actualizando DB con URL: ${cloudfrontUrl}`);
    const { error: updateError } = await supabase
      .from('birthday_wishes')
      .update({ photo: cloudfrontUrl })
      .eq('id', row.id);

    if (updateError) throw updateError;

    console.log(`✅ Fila ${row.id} migrada exitosamente\n`);
    return { success: true, url: cloudfrontUrl };

  } catch (error) {
    console.error(`❌ Error en fila ${row.id}:`, error.message);
    return { error: error.message };
  }
}

/**
 * Procesar todas las filas
 */
async function migrateAll() {
  console.log('🚀 Iniciando migración de base64 a S3...\n');

  // Obtener todas las filas
  const { data: rows, error: fetchError } = await supabase
    .from('birthday_wishes')
    .select('id, photo')
    .not('photo', 'is', null)
    .limit(1000);

  if (fetchError) {
    console.error('❌ Error al obtener filas:', fetchError);
    process.exit(1);
  }

  console.log(`📊 Encontradas ${rows.length} filas con foto\n`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of rows) {
    const result = await migrateRow(row);
    
    if (result.success) migrated++;
    else if (result.skipped) skipped++;
    else if (result.error) failed++;

    // Delay para evitar rate limits
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n═══════════════════════════════════════');
  console.log('📈 RESUMEN DE MIGRACIÓN');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Migradas exitosamente: ${migrated}`);
  console.log(`⏭️  Saltadas (ya URL): ${skipped}`);
  console.log(`❌ Fallidas: ${failed}`);
  console.log(`📊 Total procesadas: ${rows.length}`);
  console.log('═══════════════════════════════════════\n');

  if (failed > 0) {
    console.log('⚠️  Algunas filas fallaron. Revisa los logs arriba.');
  } else {
    console.log('🎉 ¡Migración completada con éxito!');
  }
}

// =====================================================
// EJECUCIÓN
// =====================================================

migrateAll()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
