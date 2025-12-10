// form.js - Manejo del formulario de mensajes
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('wishForm');
    const photoInput = document.getElementById('photo');
    const fileName = document.getElementById('fileName');
    const imagePreview = document.getElementById('imagePreview');
    const submitBtn = document.getElementById('submitBtn');
    const formCard = document.getElementById('formCard');
    const successMessage = document.getElementById('successMessage');

    // Preview de imagen
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            fileName.textContent = file.name;
            
            // Mostrar preview
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            fileName.textContent = '';
            imagePreview.innerHTML = '';
        }
    });

    // Enviar formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar fecha límite (8pm del 10 de diciembre 2025)
        const now = new Date();
        const deadline = new Date('2025-12-10T20:00:00-06:00'); // Ajusta timezone si necesario
        
        if (now > deadline) {
            alert('Lo sentimos, el período para enviar mensajes ha terminado.');
            return;
        }

        const formData = new FormData();
        formData.append('name', document.getElementById('name').value.trim());
        formData.append('message', document.getElementById('message').value.trim());
        
        const photoFile = photoInput.files[0];
        if (photoFile) {
            // Convertir imagen a base64
            const base64 = await fileToBase64(photoFile);
            formData.append('photo', base64);
        }

        // Deshabilitar botón durante envío
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Enviando...';

        try {
            const response = await fetch('/.netlify/functions/save-wish', {
                method: 'POST',
                body: JSON.stringify({
                    name: formData.get('name'),
                    message: formData.get('message'),
                    photo: formData.get('photo') || null,
                    timestamp: new Date().toISOString()
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Mostrar mensaje de éxito con preview
                formCard.style.display = 'none';
                successMessage.classList.add('active');

                document.getElementById('previewName').innerHTML = `<strong>${formData.get('name')}</strong>`;
                document.getElementById('previewMessage').textContent = formData.get('message');
                
                if (photoFile) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.getElementById('previewImage').innerHTML = 
                            `<img src="${e.target.result}" alt="Tu foto" style="max-width: 200px; border-radius: 10px; margin-top: 1rem;">`;
                    };
                    reader.readAsDataURL(photoFile);
                }
            } else {
                throw new Error('Error al enviar el mensaje');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar mensaje de cumpleaños 💝';
        }
    });
});

// Convertir archivo a base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
