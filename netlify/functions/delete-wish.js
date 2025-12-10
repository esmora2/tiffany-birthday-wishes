// delete-wish.js - Eliminar un mensaje (solo admin)
const saveWishModule = require('./save-wish');

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

    // Filtrar (eliminar el wish con el ID especificado)
    const wishes = saveWishModule.wishesStore || [];
    const index = wishes.findIndex(wish => wish.id === id);
    
    if (index > -1) {
      wishes.splice(index, 1);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
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
