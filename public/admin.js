// public/admin.js - VERSIÓN SIMPLIFICADA SIN FOTOS

window.addEventListener('load', () => {
    const userListBody = document.getElementById('user-list');
    const loadingMessage = document.getElementById('loading-message');

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
                        <button class="delete-btn" data-id="${user.id}" title="Eliminar usuario">
                            <i class="fas fa-trash-alt"></i>
                        </button>
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

    userListBody.addEventListener('click', async (event) => {
        const button = event.target.closest('.delete-btn');
        if (button) {
            const userId = button.dataset.id;
            const userName = button.closest('tr').cells[0].textContent;

            const isConfirmed = confirm(`¿Estás seguro de que quieres eliminar a ${userName}? Esta acción no se puede deshacer.`);

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

    fetchAndDisplayUsers();
});