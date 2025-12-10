// delete-wish.js - Eliminar un mensaje (solo admin)
exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { id } = JSON.parse(event.body);

    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'ID is required' })
      };
    }

    const { getStore } = require('@netlify/blobs');
    const store = getStore('wishes');
    
    // Obtener wishes existentes
    let wishes = [];
    try {
      const data = await store.get('all-wishes');
      if (data) {
        wishes = JSON.parse(data);
      }
    } catch (e) {
      wishes = [];
    }

    // Filtrar (eliminar el wish con el ID especificado)
    wishes = wishes.filter(wish => wish.id !== id);

    // Guardar
    await store.set('all-wishes', JSON.stringify(wishes));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Wish deleted successfully'
      })
    };

  } catch (error) {
    console.error('Error deleting wish:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
