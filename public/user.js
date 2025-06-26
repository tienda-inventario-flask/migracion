// public/user.js - VERSIÓN CORREGIDA QUE INCLUYE EL ID DE REGISTRO

window.addEventListener('load', async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const profileCard = document.getElementById('profile-card');

    if (!userId) {
        profileCard.innerHTML = '<h2>Error</h2><p style="color: red;">No se proporcionó un ID de usuario.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) throw new Error('Usuario no encontrado');

        const user = await response.json();
        const profilePic = user.imagen_url || 'https://i.imgur.com/SufHYmU.png'; // Un avatar por defecto

        // Construimos el HTML del perfil, ahora incluyendo el ID
        profileCard.innerHTML = `
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
                        <label>Fecha de Registro</label>
                        <p>${new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                    
                    <div class="detail-field">
                        <label>ID de Registro Único</label>
                        <p class="user-id-detail">${user.id}</p>
                    </div>
                    </div>
            </div>
        `;

    } catch (error) {
        console.error('Error al cargar datos:', error);
        profileCard.innerHTML = `<h2>Error</h2><p style="color: red;">${error.message}</p>`;
    }
});