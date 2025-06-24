// server.js - VERSIÓN FINAL CON LOGIN COMO PÁGINA DE INICIO

// --- Dependencias ---
const express = require('express');
const { Pool } = require('pg');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const cookieParser = require('cookie-parser');
const path = require('path');
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
app.use(cookieParser());

// --- RUTA PRINCIPAL ---
// Ahora, cuando alguien visite la raíz del sitio, lo redirigimos al login.
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Servimos los archivos estáticos DESPUÉS de definir nuestra ruta principal
app.use(express.static('public'));

// --- MIDDLEWARE DE AUTENTICACIÓN (EL "GUARDIÁN") ---
const checkAuth = (req, res, next) => {
    if (req.cookies.session_token === 'admin_logged_in') {
        next();
    } else {
        res.redirect('/login.html');
    }
};

// --- RUTAS PÚBLICAS (Formulario de registro y perfil de usuario) ---
app.post('/api/register', upload.single('foto'), async (req, res) => {
    try {
        const { nombre, apellido, pasaporte, fecha_nacimiento } = req.body;
        const fotoFile = req.file;
        let imageUrl = null;

        if (fotoFile) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image", folder: "migracion-qr" }, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                uploadStream.end(fotoFile.buffer);
            });
            imageUrl = result.secure_url;
        }

        const id = uuidv4();
        await pool.query(
            "INSERT INTO usuarios (id, nombre, apellido, pasaporte, fecha_nacimiento, imagen_url) VALUES ($1, $2, $3, $4, $5, $6)",
            [id, nombre, apellido, pasaporte, fecha_nacimiento, imageUrl]
        );

        const userProfileURL = `${process.env.BASE_URL}/user.html?id=${id}`;
        const qrCodeDataURL = await qrcode.toDataURL(userProfileURL);
        res.status(201).json({ qrCode: qrCodeDataURL });
    } catch (err) {
        if (err.code === '23505') { 
            return res.status(409).json({ message: "Este número de pasaporte ya está registrado." });
        }
        console.error(err.message);
        res.status(500).json({ message: "Ocurrió un error inesperado en el servidor." });
    }
});

app.get('/api/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
        if (user.rows.length === 0) {
            return res.status(404).json("Usuario no encontrado");
        }
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Error en el servidor");
    }
});

// --- RUTAS DE AUTENTICACIÓN ---
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        res.cookie('session_token', 'admin_logged_in', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 día
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
app.get('/admin.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

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