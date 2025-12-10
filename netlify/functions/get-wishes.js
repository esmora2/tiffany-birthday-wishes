// get-wishes.js - Obtener todos los mensajes
exports.handler = async (event, context) => {
  try {
    const { getStore } = require('@netlify/blobs');
    const store = getStore('wishes');
    
    // Obtener wishes
    let wishes = [];
    try {
      const data = await store.get('all-wishes');
      if (data) {
        wishes = JSON.parse(data);
      }
    } catch (e) {
      wishes = [];
    }

    // Ordenar por fecha (más recientes primero)
    wishes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify(wishes)
    };

  } catch (error) {
    console.error('Error getting wishes:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
