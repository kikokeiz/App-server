// app.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const port = process.env.PORT || 5000;

// Conexión a MongoDB
mongoose.connect('mongodb+srv://<usuario>:<contraseña>@cluster0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.log(err));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint para servir el HTML desde /web
app.get('/web', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint GET para la API
app.get('/api', (req, res) => {
  res.json({ message: "¡Hola desde la API!" });
});

// Middleware para leer JSON en POST
app.use(express.json());

// Ruta para el registro de un nuevo usuario
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Verificar si el usuario ya existe
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'El usuario ya existe' });
    }

    // Crear un nuevo usuario
    user = new User({ username, email, password });
    await user.save();

    // Crear el token JWT
    const payload = { userId: user._id };
    const token = jwt.sign(payload, 'mi-secreto', { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// Ruta para el login de usuario
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Verificar si el usuario existe
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales incorrectas' });
    }

    // Comparar la contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales incorrectas' });
    }

    // Crear el token JWT
    const payload = { userId: user._id };
    const token = jwt.sign(payload, 'mi-secreto', { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// Middleware de autenticación para proteger rutas
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No hay token, autorización denegada' });

  try {
    const decoded = jwt.verify(token, 'mi-secreto');
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token no válido' });
  }
};

// Ruta protegida (requiere autenticación)
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Acceso autorizado a la ruta protegida' });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
