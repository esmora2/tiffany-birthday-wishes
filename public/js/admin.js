// admin.js - Panel de administración
document.addEventListener('DOMContentLoaded', async () => {
    await loadAdminWishes();
});

async function loadAdminWishes() {
    const adminList = document.getElementById('adminList');
    const emptyState = document.getElementById('emptyState');

    try {
        const response = await fetch('/.netlify/functions/get-wishes');
        const wishes = await response.json();

        if (wishes.length === 0) {
            adminList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        
        adminList.innerHTML = wishes.map(wish => `
            <li class="admin-item">
                <div class="admin-item-content">
                    <div class="admin-item-name">${escapeHtml(wish.name)}</div>
                    <div class="admin-item-message">${escapeHtml(wish.message)}</div>
                    <div style="font-size: 0.85rem; color: #999; margin-top: 0.25rem;">
                        ${formatDate(wish.timestamp)}
                    </div>
                </div>
                <button class="btn-delete" onclick="deleteWish('${wish.id}')">
                    🗑️ Eliminar
                </button>
            </li>
        `).join('');
    } catch (error) {
        console.error('Error al cargar mensajes:', error);
    }
}

async function deleteWish(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este mensaje?')) {
        return;
    }

    try {
        const response = await fetch('/.netlify/functions/delete-wish', {
            method: 'POST',
            body: JSON.stringify({ id }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            await loadAdminWishes();
        } else {
            alert('Error al eliminar el mensaje');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el mensaje');
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
