// server.js

// --- Dependencias ---
const express = require('express');
const { Pool } = require('pg');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const multer = require('multer'); // Para subir archivos
const cloudinary = require('cloudinary').v2; // Para almacenar imágenes
require('dotenv').config();

// --- Configuración de Cloudinary ---
// Usará las variables de entorno que pusimos en Render
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// --- Configuración de Multer ---
// Le decimos a Multer que guarde el archivo en la memoria temporalmente
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

// POST /api/register - MODIFICADA PARA ACEPTAR IMÁGENES
// Usamos upload.single('foto') para indicarle que esperamos un archivo con el nombre 'foto'
app.post('/api/register', upload.single('foto'), async (req, res) => {
  try {
    // Los datos de texto ahora vienen en req.body
    const { nombre, apellido, pasaporte, fecha_nacimiento } = req.body;
    // El archivo de imagen viene en req.file
    const fotoFile = req.file;

    let imageUrl = null; // Empezamos con la URL de la imagen como nula

    // Si el usuario subió una foto, la procesamos
    if (fotoFile) {
      // Creamos un "stream" de subida a Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "image", folder: "migracion-qr" }, // Opcional: guarda en una carpeta
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(fotoFile.buffer);
      });
      imageUrl = result.secure_url; // Obtenemos la URL segura de la imagen subida
    }

    const id = uuidv4();

    // Guardamos todo en la base de datos, incluida la nueva URL de la imagen
    await pool.query(
      "INSERT INTO usuarios (id, nombre, apellido, pasaporte, fecha_nacimiento, imagen_url) VALUES ($1, $2, $3, $4, $5, $6)",
      [id, nombre, apellido, pasaporte, fecha_nacimiento, imageUrl]
    );

    const userProfileURL = `${process.env.BASE_URL || `https://migracion-qr.onrender.com`}/user.html?id=${id}`;
    const qrCodeDataURL = await qrcode.toDataURL(userProfileURL);

    res.status(201).json({ qrCode: qrCodeDataURL });

  } catch (err) {
    // --- MANEJO DE ERRORES MEJORADO ---
    if (err.code === '23505') { // Código de error de PostgreSQL para "violación de unicidad"
      return res.status(409).json({ message: "Este número de pasaporte ya está registrado." });
    }
    console.error(err.message);
    res.status(500).json({ message: "Ocurrió un error inesperado en el servidor." });
  }
});

// GET /api/user/:id - No necesita cambios, ya funciona
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

// --- Iniciar el Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});