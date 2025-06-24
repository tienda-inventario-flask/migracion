// public/admin.js

window.addEventListener('load', async () => {
    const userListBody = document.getElementById('user-list');
    const loadingMessage = document.getElementById('loading-message');

    try {
        // Hacemos la petición a nuestra nueva ruta del backend
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
            throw new Error('No se pudo cargar la lista de usuarios.');
        }

        const users = await response.json();

        // Ocultamos el mensaje de "cargando"
        loadingMessage.style.display = 'none';

        if (users.length === 0) {
            userListBody.innerHTML = '<tr><td colspan="4">No hay usuarios registrados todavía.</td></tr>';
            return;
        }

        // Limpiamos cualquier contenido previo
        userListBody.innerHTML = '';

        // Recorremos la lista de usuarios y creamos una fila para cada uno
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.nombre}</td>
                <td>${user.apellido}</td>
                <td>${user.pasaporte}</td>
                <td>${user.fecha_nacimiento_formateada}</td>
            `;
            userListBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error:', error);
        loadingMessage.textContent = `Error al cargar los datos: ${error.message}`;
        loadingMessage.style.color = 'red';
    }
});