document.getElementById('registroForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const qrContainer = document.getElementById('qrContainer');
    const loader = document.getElementById('loader'); // Obtenemos el spinner

    // --- LÓGICA MEJORADA ---
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registrando...';
    qrContainer.innerHTML = ''; 
    loader.style.display = 'block'; // Mostramos el spinner

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
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al registrar');
        }
        
        qrContainer.innerHTML = `<h2>¡Registro exitoso! Escanea este código:</h2><img src="${data.qrCode}" alt="Código QR">`;
        document.getElementById('registroForm').reset();

    } catch (error) {
        console.error('Hubo un error:', error);
        qrContainer.innerHTML = `<p style="color: #d32f2f; font-weight: bold;">Error: ${error.message}</p>`; // Mensaje de error más visible
    } finally {
        // Esto se ejecuta siempre, haya error o no
        submitBtn.disabled = false;
        submitBtn.textContent = 'Registrar y Generar QR';
        loader.style.display = 'none'; // Ocultamos el spinner
    }
});