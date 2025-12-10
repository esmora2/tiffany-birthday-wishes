// board.js - Visualización del mosaico de mensajes
document.addEventListener('DOMContentLoaded', async () => {
    const wishesBoard = document.getElementById('wishesBoard');
    const emptyState = document.getElementById('emptyState');

    await loadWishes();

    // Recargar cada 30 segundos
    setInterval(loadWishes, 30000);
});

async function loadWishes() {
    const wishesBoard = document.getElementById('wishesBoard');
    const emptyState = document.getElementById('emptyState');

    try {
        const response = await fetch('/.netlify/functions/get-wishes');
        const wishes = await response.json();

        if (wishes.length === 0) {
            wishesBoard.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        // Renderizar tarjetas de mensajes
        wishesBoard.innerHTML = wishes.map(wish => `
            <div class="wish-card">
                ${wish.photo ? `<img src="${wish.photo}" alt="${wish.name}" class="wish-card-image">` : ''}
                <div class="wish-card-name">${escapeHtml(wish.name)}</div>
                <div class="wish-card-message">${escapeHtml(wish.message)}</div>
                <div class="wish-card-date">${formatDate(wish.timestamp)}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error al cargar mensajes:', error);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('es-MX', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
}
