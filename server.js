// server.js

// --- Dependencias ---
const express = require('express');
const { Pool } = require('pg');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// --- Configuración de Cloudinary ---
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// --- Configuración de Multer ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Inicialización de la App ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- Conexión a la Base de Datos ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- RUTAS DE LA API ---

// POST /api/register - Para registrar un nuevo usuario con foto
app.post('/api/register', upload.single('foto'), async (req, res) => {
  try {
    const { nombre, apellido, pasaporte, fecha_nacimiento } = req.body;
    const fotoFile = req.file;
    let imageUrl = null;

    if (fotoFile) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "image", folder: "migracion-qr" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
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

// GET /api/user/:id - Para ver el perfil de un solo usuario
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


// --- RUTAS DE ADMINISTRADOR ---

// GET /api/admin/users - Devuelve todos los usuarios registrados
app.get('/api/admin/users', async (req, res) => {
  try {
    const allUsers = await pool.query(
      "SELECT id, nombre, apellido, pasaporte, to_char(fecha_nacimiento, 'DD/MM/YYYY') as fecha_nacimiento_formateada FROM usuarios ORDER BY created_at DESC"
    );
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error al obtener la lista de usuarios." });
  }
});

// DELETE /api/admin/users/:id - Borra un usuario por su ID
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteUser = await pool.query("DELETE FROM usuarios WHERE id = $1", [id]);

    if (deleteUser.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado, no se pudo eliminar." });
    }

    res.status(200).json({ message: "Usuario eliminado exitosamente." });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error al eliminar el usuario." });
  }
});


// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});