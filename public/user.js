// public/user.js - VERSIÓN FINAL CON NUEVO DISEÑO

window.addEventListener('load', async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const profileContainer = document.getElementById('profile-container');

    if (!userId) {
        profileContainer.innerHTML = '<h2>Error</h2><p style="color: red;">No se proporcionó un ID de usuario.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) throw new Error('Usuario no encontrado');

        const user = await response.json();
        const profilePic = user.imagen_url || 'https://i.imgur.com/SufHYmU.png';

        // Construimos el HTML del nuevo perfil elegante
        profileContainer.innerHTML = `
            <div class="user-profile">
                <div class="user-profile-header">
                    <img src="${profilePic}" alt="Foto de perfil" class="user-profile-picture">
                    <div class="user-profile-name-section">
                        <h2 class="user-profile-name">${user.nombre} ${user.apellido}</h2>
                        <span class="user-profile-subtitle">Residente Temporal</span>
                    </div>
                </div>
                <div class="user-profile-body">
                    <h3>Detalles del Registro</h3>
                    <div class="detail-grid">
                        <div class="detail-field">
                            <label>Número de Pasaporte</label>
                            <p>${user.pasaporte}</p>
                        </div>
                        <div class="detail-field">
                            <label>Fecha de Nacimiento</label>
                            <p>${new Date(user.fecha_nacimiento).toLocaleDateString()}</p>
                        </div>
                        <div class="detail-field">
                            <label>ID de Registro</label>
                            <p class="user-id-detail">${user.id}</p>
                        </div>
                        <div class="detail-field">
                            <label>Fecha de Registro</label>
                            <p>${new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error al cargar datos:', error);
        profileContainer.innerHTML = `<h2>Error</h2><p style="color: red;">${error.message}</p>`;
    }
});