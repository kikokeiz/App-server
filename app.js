require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

// Conectar a MongoDB local
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Conectado a MongoDB local'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// Middleware para JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.get('/web', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api', (req, res) => {
  res.json({ message: '¡Hola desde la API!' });
});

// Registro
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'El usuario ya existe' });

    user = new User({ username, email, password });
    await user.save();

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (err) {
    console.error('❌ Error en /register:', err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Credenciales incorrectas' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Credenciales incorrectas' });

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (err) {
    console.error('❌ Error en /login:', err);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No hay token, autorización denegada' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token no válido' });
  }
};

// Ruta protegida
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Acceso autorizado a la ruta protegida' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
