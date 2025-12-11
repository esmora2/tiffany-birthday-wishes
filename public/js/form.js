// form.js - Manejo del formulario de mensajes (LIMPIO)
const cleanFormJs = (() => {
    // Single, minimal, well-formed implementation
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('wishForm');
        const photoInput = document.getElementById('photo');
        const fileName = document.getElementById('fileName');
        const imagePreview = document.getElementById('imagePreview');
        const submitBtn = document.getElementById('submitBtn');
        const formCard = document.getElementById('formCard');
        const successMessage = document.getElementById('successMessage');

        photoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) {
                fileName.textContent = '';
                imagePreview.innerHTML = '';
                delete photoInput.convertedImage;
                return;
            }
            fileName.textContent = file.name;
            try {
                const convertedImage = await convertImageToWebFormat(file);
                imagePreview.innerHTML = `<img src="${convertedImage}" alt="Preview">`;
                photoInput.convertedImage = convertedImage;
            } catch (err) {
                console.error(err);
                alert('Hubo un problema al procesar tu imagen. Intenta con otra foto.');
            }
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const now = new Date();
            const deadline = new Date('2025-12-11T21:00:00');
            if (now > deadline) {
                alert('Lo sentimos, el período para enviar mensajes ha terminado.');
                return;
            }

            const formData = new FormData();
            formData.append('name', document.getElementById('name').value.trim());
            formData.append('message', document.getElementById('message').value.trim());
            const photoFile = photoInput.files[0];
            if (photoFile) formData.append('photo', photoInput.convertedImage || await convertImageToWebFormat(photoFile));

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Enviando...';
            try {
                const res = await fetch('/.netlify/functions/save-wish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.get('name'),
                        message: formData.get('message'),
                        photo: formData.get('photo') || null,
                        timestamp: new Date().toISOString()
                    })
                });
                if (!res.ok) throw new Error('Network error');
                formCard.style.display = 'none';
                successMessage.classList.add('active');
            } catch (err) {
                console.error(err);
                alert('Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar mensaje de cumpleaños 💝';
            }
        });
    });

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async function convertImageToWebFormat(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    let w = img.width, h = img.height; const max = 1920;
                    if (w > max || h > max) {
                        if (w > h) { h = Math.round((h / w) * max); w = max; } else { w = Math.round((w / h) * max); h = max; }
                    }
                    canvas.width = w; canvas.height = h; ctx.drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                };
                img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsDataURL(file);
        });
    }
})();
// form.js - Manejo del formulario de mensajes
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('wishForm');
    const photoInput = document.getElementById('photo');
    const fileName = document.getElementById('fileName');
    const imagePreview = document.getElementById('imagePreview');
    const submitBtn = document.getElementById('submitBtn');
    const formCard = document.getElementById('formCard');
    const successMessage = document.getElementById('successMessage');

    // Preview de imagen con conversión automática
    photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            fileName.textContent = file.name;
            
            try {
                // Convertir cualquier formato a JPEG/PNG compatible con navegadores
                const convertedImage = await convertImageToWebFormat(file);
                
                // Mostrar preview
                imagePreview.innerHTML = `<img src="${convertedImage}" alt="Preview">`;
                
                // Guardar la imagen convertida para usar después
                photoInput.convertedImage = convertedImage;
            } catch (error) {
                console.error('Error al procesar imagen:', error);
                alert('Hubo un problema al procesar tu imagen. Intenta con otra foto.');
                fileName.textContent = '';
                imagePreview.innerHTML = '';
                photoInput.value = '';
            }
        } else {
            fileName.textContent = '';
            imagePreview.innerHTML = '';
            delete photoInput.convertedImage;
        }
    });

    // Enviar formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validar fecha límite (21:00 del 11 de diciembre de 2025)
        const now = new Date();
        const deadline = new Date('2025-12-11T21:00:00'); // local 21:00
        
        if (now > deadline) {
            alert('Lo sentimos, el período para enviar mensajes ha terminado.');
            return;
        }

        const formData = new FormData();
        formData.append('name', document.getElementById('name').value.trim());
        formData.append('message', document.getElementById('message').value.trim());
        
        const photoFile = photoInput.files[0];
        if (photoFile) {
            // Usar imagen convertida si existe, sino convertir ahora
            const imageData = photoInput.convertedImage || await convertImageToWebFormat(photoFile);
            formData.append('photo', imageData);
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
                    // Usar la imagen ya convertida
                    const imageData = photoInput.convertedImage || formData.get('photo');
                    document.getElementById('previewImage').innerHTML = 
                        `<img src="${imageData}" alt="Tu foto" style="max-width: 200px; border-radius: 10px; margin-top: 1rem;">`;
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

// Convertir cualquier imagen (incluyendo HEIC) a formato web compatible
async function convertImageToWebFormat(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // Crear canvas para convertir imagen
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calcular dimensiones manteniendo aspect ratio (max 1920px)
                let width = img.width;
                let height = img.height;
                const maxSize = 1920;
                
                if (width > maxSize || height > maxSize) {
                    if (width > height) {
                        height = (height / width) * maxSize;
                        width = maxSize;
                    } else {
                        width = (width / height) * maxSize;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Dibujar imagen en canvas
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convertir a JPEG con calidad 0.85
                const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                resolve(jpegDataUrl);
            };
            
            img.onerror = () => {
                reject(new Error('No se pudo cargar la imagen'));
            };
            
            // Cargar la imagen desde el FileReader
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            reject(new Error('Error al leer el archivo'));
        };
        
        // Leer archivo como Data URL
        reader.readAsDataURL(file);
    });
}
// form.js - Manejo del formulario de mensajes
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('wishForm');
    const photoInput = document.getElementById('photo');
    const fileName = document.getElementById('fileName');
    const imagePreview = document.getElementById('imagePreview');
    const submitBtn = document.getElementById('submitBtn');
    const formCard = document.getElementById('formCard');
    const successMessage = document.getElementById('successMessage');

    // Preview de imagen con conversión automática
    photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            fileName.textContent = file.name;
            
            try {
                // Convertir cualquier formato a JPEG/PNG compatible con navegadores
                const convertedImage = await convertImageToWebFormat(file);
                
                // Mostrar preview
                imagePreview.innerHTML = `<img src="${convertedImage}" alt="Preview">`;
                
                // Guardar la imagen convertida para usar después
                photoInput.convertedImage = convertedImage;
            } catch (error) {
                console.error('Error al procesar imagen:', error);
                // form.js - Manejo del formulario de mensajes
                document.addEventListener('DOMContentLoaded', () => {
                    const form = document.getElementById('wishForm');
                    const photoInput = document.getElementById('photo');
                    const fileName = document.getElementById('fileName');
                    const imagePreview = document.getElementById('imagePreview');
                    const submitBtn = document.getElementById('submitBtn');
                    const formCard = document.getElementById('formCard');
                    const successMessage = document.getElementById('successMessage');

                    // Preview de imagen con conversión automática
                    photoInput.addEventListener('change', async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            fileName.textContent = file.name;
            
                            try {
                                // Convertir cualquier formato a JPEG/PNG compatible con navegadores
                                const convertedImage = await convertImageToWebFormat(file);
                
                                // Mostrar preview
                                imagePreview.innerHTML = `<img src="${convertedImage}" alt="Preview">`;
                
                                // Guardar la imagen convertida para usar después
                                photoInput.convertedImage = convertedImage;
                            } catch (error) {
                                console.error('Error al procesar imagen:', error);
                                alert('Hubo un problema al procesar tu imagen. Intenta con otra foto.');
                                fileName.textContent = '';
                                imagePreview.innerHTML = '';
                                photoInput.value = '';
                            }
                        } else {
                            fileName.textContent = '';
                            imagePreview.innerHTML = '';
                            delete photoInput.convertedImage;
                        }
                    });

                    // Enviar formulario
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();

                        // Validar fecha límite (21:00 del 11 de diciembre de 2025)
                        const now = new Date();
                        const deadline = new Date('2025-12-11T20:00:00-06:00'); // Ajusta timezone si necesario
        
                        if (now > deadline) {
                            alert('Lo sentimos, el período para enviar mensajes ha terminado.');
                            return;
                        }

                        const formData = new FormData();
                        formData.append('name', document.getElementById('name').value.trim());
                        formData.append('message', document.getElementById('message').value.trim());
        
                        const photoFile = photoInput.files[0];
                        if (photoFile) {
                            // Usar imagen convertida si existe, sino convertir ahora
                            const imageData = photoInput.convertedImage || await convertImageToWebFormat(photoFile);
                            formData.append('photo', imageData);
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
                                    // Usar la imagen ya convertida
                                    const imageData = photoInput.convertedImage || formData.get('photo');
                                    document.getElementById('previewImage').innerHTML = 
                                        `<img src="${imageData}" alt="Tu foto" style="max-width: 200px; border-radius: 10px; margin-top: 1rem;">`;
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

                // Convertir cualquier imagen (incluyendo HEIC) a formato web compatible
                async function convertImageToWebFormat(file) {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
        
                        reader.onload = (e) => {
                            const img = new Image();
            
                            img.onload = () => {
                                // Crear canvas para convertir imagen
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                
                                // Calcular dimensiones manteniendo aspect ratio (max 1920px)
                                let width = img.width;
                                let height = img.height;
                                const maxSize = 1920;
                
                                if (width > maxSize || height > maxSize) {
                                    if (width > height) {
                                        height = (height / width) * maxSize;
                                        width = maxSize;
                                    } else {
                                        width = (width / height) * maxSize;
                                        height = maxSize;
                                    }
                                }
                
                                canvas.width = width;
                                canvas.height = height;
                
                                // Dibujar imagen en canvas
                                ctx.drawImage(img, 0, 0, width, height);
                
                                // Convertir a JPEG con calidad 0.85
                                const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                                resolve(jpegDataUrl);
                            };
            
                            img.onerror = () => {
                                reject(new Error('No se pudo cargar la imagen'));
                            };
            
                            // Cargar la imagen desde el FileReader
                            img.src = e.target.result;
                        };
        
                        reader.onerror = () => {
                            reject(new Error('Error al leer el archivo'));
                        };
        
                        // Leer archivo como Data URL
                        reader.readAsDataURL(file);
                    });
                }
