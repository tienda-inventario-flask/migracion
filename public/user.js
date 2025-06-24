// public/user.js

window.addEventListener('load', async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    const profileContent = document.getElementById('profile-content');

    if (!userId) {
        profileContent.innerHTML = '<p style="color: red;">No se proporcionó un ID de usuario.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) throw new Error('Usuario no encontrado');

        const user = await response.json();
        
        let userHtml = `
            <div class="profile-header">
                <img src="${user.imagen_url || 'https://i.imgur.com/SufHYmU.png'}" alt="Foto de perfil" class="profile-picture">
                <h1 class="profile-name">${user.nombre} ${user.apellido}</h1>
                <p class="profile-id">ID: ${user.id}</p>
            </div>
            <div class="profile-details">
                <div class="detail-item">
                    <i class="fas fa-passport"></i>
                    <span><strong>Pasaporte:</strong> ${user.pasaporte}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span><strong>Nacimiento:</strong> ${new Date(user.fecha_nacimiento).toLocaleDateString()}</span>
                </div>
                 <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span><strong>Registrado:</strong> ${new Date(user.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `;
        
        profileContent.innerHTML = userHtml;

    } catch (error) {
        console.error('Error al cargar datos:', error);
        profileContent.innerHTML = `<p style="color: red;">Error: ${error.message}. No se pudo cargar la información.</p>`;
    }
});