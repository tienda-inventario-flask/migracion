document.getElementById('registroForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const pasaporte = document.getElementById('pasaporte').value;
    const fecha_nacimiento = document.getElementById('fecha_nacimiento').value;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, apellido, pasaporte, fecha_nacimiento }),
        });

        if (!response.ok) throw new Error('Error al registrar');

        const data = await response.json();
        const qrContainer = document.getElementById('qrContainer');
        qrContainer.innerHTML = `<h2>¡Registro exitoso! Escanea este código:</h2><img src="${data.qrCode}" alt="Código QR">`;
        document.getElementById('registroForm').reset();
    } catch (error) {
        console.error('Hubo un error:', error);
        document.getElementById('qrContainer').innerHTML = `<p style="color: red;">Ocurrió un error. Inténtalo de nuevo.</p>`;
    }
});