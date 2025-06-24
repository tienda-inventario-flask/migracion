// server.js - VERSIÓN CON SEGURIDAD

// --- Dependencias ---
const express = require('express');
const { Pool } = require('pg');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cookieParser = require('cookie-parser'); // ¡NUEVA DEPENDENCIA!
const path = require('path'); // Para manejar rutas de archivos
require('dotenv').config();

// --- Configuraciones ---
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // ¡USAMOS EL NUEVO MIDDLEWARE!
app.use(express.static('public')); // Servimos archivos estáticos

// --- MIDDLEWARE DE AUTENTICACIÓN (EL "GUARDIÁN") ---
const checkAuth = (req, res, next) => {
    // Buscamos la cookie que crearemos al hacer login
    if (req.cookies.session_token === 'admin_logged_in') {
        // Si la cookie existe y es correcta, dejamos pasar al usuario
        next();
    } else {
        // Si no, lo redirigimos a la página de login
        res.redirect('/login.html');
    }
};

// --- RUTAS PÚBLICAS (Cualquiera puede acceder) ---
app.post('/api/register', upload.single('foto'), async (req, res) => { /* ...código sin cambios... */ });
app.get('/api/user/:id', async (req, res) => { /* ...código sin cambios... */ });

// --- RUTAS DE AUTENTICACIÓN ---
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    // Comparamos la contraseña enviada con la que guardamos en Render
    if (password === process.env.ADMIN_PASSWORD) {
        // Si es correcta, creamos una cookie segura que dura 1 día
        res.cookie('session_token', 'admin_logged_in', {
            httpOnly: true, // La cookie no es accesible desde JavaScript en el navegador (más seguro)
            secure: process.env.NODE_ENV === 'production', // Solo se envía sobre HTTPS en producción
            maxAge: 24 * 60 * 60 * 1000 // 1 día en milisegundos
        });
        res.status(200).json({ message: 'Login exitoso' });
    } else {
        res.status(401).json({ message: 'Contraseña incorrecta.' });
    }
});

app.get('/api/logout', (req, res) => {
    res.clearCookie('session_token');
    res.redirect('/login.html');
});


// --- RUTAS PROTEGIDAS (Solo el admin puede acceder) ---

// Protegemos el acceso a la PÁGINA de admin
app.get('/admin.html', checkAuth, (req, res) => {
    // Si checkAuth nos deja pasar, enviamos el archivo
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Protegemos el acceso a los DATOS de admin
app.get('/api/admin/users', checkAuth, async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT id, nombre, apellido, pasaporte, to_char(fecha_nacimiento, 'DD/MM/YYYY') as fecha_nacimiento_formateada FROM usuarios ORDER BY created_at DESC");
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error al obtener la lista de usuarios." });
  }
});

app.delete('/api/admin/users/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteUser = await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);
    if (deleteUser.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    res.status(200).json({ message: "Usuario eliminado." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error al eliminar el usuario." });
  }
});

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});