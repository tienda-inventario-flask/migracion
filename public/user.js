// public/user.js - VERSIÓN FINAL PARA EL DISEÑO "COQUETO"

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

        // Construimos el HTML de la nueva tarjeta de perfil
        profileCard.innerHTML = `
            <div class="profile-header">
                <img src="${profilePic}" alt="Foto de perfil" class="profile-picture">
                <h1 class="profile-name">${user.nombre} ${user.apellido}</h1>
            </div>
            <div class="profile-details">
                <div class="detail-item">
                    <i class="fas fa-passport"></i>
                    <div class="detail-item-content">
                        <strong>Pasaporte</strong>
                        <span>${user.pasaporte}</span>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-calendar-alt"></i>
                     <div class="detail-item-content">
                        <strong>Fecha de Nacimiento</strong>
                        <span>${new Date(user.fecha_nacimiento).toLocaleDateString()}</span>
                    </div>
                </div>
                 <div class="detail-item">
                    <i class="fas fa-clock"></i>
                     <div class="detail-item-content">
                        <strong>Fecha de Registro</strong>
                        <span>${new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error('Error al cargar datos:', error);
        profileCard.innerHTML = `<h2>Error</h2><p style="color: red;">${error.message}</p>`;
    }
});