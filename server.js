// server.js

const express = require('express');
const { Pool } = require('pg');
const qrcode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/register', async (req, res) => {
  try {
    const { nombre, apellido, pasaporte, fecha_nacimiento } = req.body;
    const id = uuidv4();

    await pool.query(
      "INSERT INTO usuarios (id, nombre, apellido, pasaporte, fecha_nacimiento) VALUES ($1, $2, $3, $4, $5)",
      [id, nombre, apellido, pasaporte, fecha_nacimiento]
    );

    // !!! IMPORTANTE: REEMPLAZA ESTA URL CON LA TUYA DE RENDER !!!
    const userProfileURL = `https://migracion-qr-app.onrender.com/user.html?id=${id}`;

    const qrCodeDataURL = await qrcode.toDataURL(userProfileURL);
    res.status(201).json({ qrCode: qrCodeDataURL });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
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

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});