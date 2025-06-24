document.getElementById('registroForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const qrContainer = document.getElementById('qrContainer');
    
    // Deshabilitamos el botón para evitar envíos múltiples
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando...';
    qrContainer.innerHTML = ''; // Limpiamos resultados anteriores

    // Usamos FormData para poder incluir el archivo de la imagen
    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('apellido', document.getElementById('apellido').value);
    formData.append('pasaporte', document.getElementById('pasaporte').value);
    formData.append('fecha_nacimiento', document.getElementById('fecha_nacimiento').value);
    
    const fotoInput = document.getElementById('foto');
    if (fotoInput.files[0]) {
        formData.append('foto', fotoInput.files[0]);
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            body: formData, // Ya no enviamos JSON, sino FormData
            // No especificamos 'Content-Type', el navegador lo hace automáticamente
        });

        const data = await response.json(); // Leemos la respuesta del servidor

        if (!response.ok) {
            // Si la respuesta no es exitosa, usamos el mensaje que nos envía el servidor
            throw new Error(data.message || 'Error al registrar');
        }
        
        qrContainer.innerHTML = `<h2>¡Registro exitoso! Escanea este código:</h2><img src="${data.qrCode}" alt="Código QR">`;
        document.getElementById('registroForm').reset();

    } catch (error) {
        console.error('Hubo un error:', error);
        // Mostramos el mensaje de error específico
        qrContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    } finally {
        // Volvemos a habilitar el botón
        submitBtn.disabled = false;
        submitBtn.textContent = 'Registrar y Generar QR';
    }
});