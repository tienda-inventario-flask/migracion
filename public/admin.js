// public/admin.js

window.addEventListener('load', () => {
    const userListBody = document.getElementById('user-list');
    const loadingMessage = document.getElementById('loading-message');

    // Función para cargar y mostrar los usuarios en la tabla
    const fetchAndDisplayUsers = async () => {
        try {
            loadingMessage.textContent = 'Cargando usuarios...';
            loadingMessage.style.color = 'inherit';
            loadingMessage.style.display = 'block';
            
            const response = await fetch('/api/admin/users');
            if (!response.ok) {
                throw new Error('No se pudo cargar la lista de usuarios.');
            }

            const users = await response.json();
            loadingMessage.style.display = 'none';

            if (users.length === 0) {
                userListBody.innerHTML = '<tr><td colspan="5">No hay usuarios registrados todavía.</td></tr>';
                return;
            }

            userListBody.innerHTML = '';
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.nombre}</td>
                    <td>${user.apellido}</td>
                    <td>${user.pasaporte}</td>
                    <td>${user.fecha_nacimiento_formateada}</td>
                    <td>
                        <button class="delete-btn" data-id="${user.id}">Eliminar</button>
                    </td>
                `;
                userListBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error:', error);
            loadingMessage.textContent = `Error al cargar los datos: ${error.message}`;
            loadingMessage.style.color = 'red';
        }
    };

    // Lógica para eliminar, escuchando clics en la tabla
    userListBody.addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const button = event.target;
            const userId = button.dataset.id; 

            const isConfirmed = confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.');

            if (isConfirmed) {
                try {
                    const response = await fetch(`/api/admin/users/${userId}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'No se pudo eliminar al usuario.');
                    }
                    
                    button.closest('tr').remove();

                } catch (error) {
                    console.error('Error al eliminar:', error);
                    alert(`Error: ${error.message}`);
                }
            }
        }
    });

    // Carga inicial de los usuarios
    fetchAndDisplayUsers();
});