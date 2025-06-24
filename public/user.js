window.addEventListener('load', async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const userInfoDiv = document.getElementById('userInfo');

    if (!userId) {
        userInfoDiv.innerHTML = '<p style="color: red;">No se proporcionó un ID de usuario.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) throw new Error('Usuario no encontrado');

        const user = await response.json();
        
        // Construimos el HTML dinámicamente
        let userHtml = '';

        // Si hay una URL de imagen, añadimos la etiqueta <img>
        if (user.imagen_url) {
            userHtml += `<img src="${user.imagen_url}" alt="Foto de perfil" style="max-width: 150px; border-radius: 50%; display: block; margin: 0 auto 20px;">`;
        }

        userHtml += `
            <p><strong>Nombre:</strong> ${user.nombre}</p>
            <p><strong>Apellido:</strong> ${user.apellido}</p>
            <p><strong>Pasaporte:</strong> ${user.pasaporte}</p>
            <p><strong>Fecha de Nacimiento:</strong> ${new Date(user.fecha_nacimiento).toLocaleDateString()}</p>
            <p><strong>ID de Registro:</strong> ${user.id}</p>
        `;
        
        userInfoDiv.innerHTML = userHtml;

    } catch (error) {
        console.error('Error al cargar datos:', error);
        userInfoDiv.innerHTML = `<p style="color: red;">Error: ${error.message}. No se pudo cargar la información.</p>`;
    }
});