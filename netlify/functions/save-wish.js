// save-wish.js - Guardar mensaje de cumpleaños con S3 + Supabase
const { createClient } = require('@supabase/supabase-js');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Inicializar cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Inicializar cliente de S3
const s3Client = new S3Client({
  region: process.env.AWS_RGN || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACSS_KEY_ID,
    secretAccessKey: process.env.AWS_SCRT_ACCESS_KEY
  }
});

const S3_BUCKET = process.env.AWS_STORAGE_BUCKET_NAME;
const CLOUDFRONT_DOMAIN = process.env.AWS_S3_CUSTOM_DOMAIN;

exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { name, message, photo, timestamp } = data;

    // Validación básica
    if (!name || !message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name and message are required' })
      };
    }

  // Verificar fecha límite (21:00 del 11 de diciembre de 2025)
  const now = new Date();
  const deadline = new Date('2025-12-11T20:00:00-06:00');
    
    if (now > deadline) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Submission period has ended' })
      };
    }

    // Procesar foto si existe
    let photoUrl = null;
    if (photo) {
      try {
        photoUrl = await uploadPhotoToS3(photo);
      } catch (uploadError) {
        console.error('Error uploading photo to S3:', uploadError);
        // Continuar sin foto en lugar de fallar completamente
        photoUrl = null;
      }
    }

    // Crear wish object
    const wish = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.substring(0, 100), // Limitar longitud
      message: message.substring(0, 500),
      photo: photoUrl, // URL de CloudFront o null
      timestamp: timestamp || new Date().toISOString()
    };

    // Guardar en Supabase
    const { data: insertedData, error } = await supabase
      .from('birthday_wishes')
      .insert([wish])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Wish saved successfully',
        id: wish.id
      })
    };

  } catch (error) {
    console.error('Error saving wish:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};

/**
 * Sube una imagen base64 a S3 y retorna la URL de CloudFront
 * @param {string} dataUrl - Data URL en formato "data:image/jpeg;base64,..."
 * @returns {Promise<string>} URL de CloudFront
 */
async function uploadPhotoToS3(dataUrl) {
  // Extraer tipo de contenido y datos base64
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid data URL format');
  }

  const contentType = matches[1]; // image/jpeg, image/png, etc.
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // Generar nombre único para el archivo
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = contentType.split('/')[1] || 'jpg'; // jpg, png, etc.
  const filename = `${timestamp}-${randomStr}.${extension}`;
  const s3Key = `tiffbd/${filename}`; // Carpeta tiffbd/

  // Subir a S3
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: s3Key,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000', // Cache 1 año
  });

  await s3Client.send(command);

  // Construir URL de CloudFront
  const cloudfrontUrl = `https://${CLOUDFRONT_DOMAIN}/${s3Key}`;
  
  return cloudfrontUrl;
}
