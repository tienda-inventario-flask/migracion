// public/login.js
document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = ''; // Limpiar errores previos

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });

        if (response.ok) {
            // Si el login es exitoso, el servidor nos redirigirá automáticamente
            // o podemos redirigir nosotros. Aquí redirigimos al panel.
            window.location.href = '/admin.html';
        } else {
            // Si hay un error, mostramos el mensaje del servidor
            const errorData = await response.json();
            errorMessage.textContent = errorData.message || 'Error al iniciar sesión.';
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        errorMessage.textContent = 'No se pudo conectar con el servidor.';
    }
});