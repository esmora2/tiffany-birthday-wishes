// save-wish.js - Guardar mensaje de cumpleaños usando Supabase
const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Verificar fecha límite (8pm del 10 de diciembre 2025)
    const now = new Date();
    const deadline = new Date('2025-12-10T20:00:00-06:00');
    
    if (now > deadline) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Submission period has ended' })
      };
    }

    // Crear wish object
    const wish = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.substring(0, 100), // Limitar longitud
      message: message.substring(0, 500),
      photo: photo || null,
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
