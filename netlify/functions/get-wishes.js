// get-wishes.js - Obtener todos los mensajes
// Importar el store compartido
const saveWishModule = require('./save-wish');

exports.handler = async (event, context) => {
  try {
    // Acceder al almacenamiento compartido
    const wishes = saveWishModule.wishesStore || [];

    // Ordenar por fecha (más recientes primero)
    const sortedWishes = [...wishes].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(sortedWishes)
    };

  } catch (error) {
    console.error('Error getting wishes:', error);
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
