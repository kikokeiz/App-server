const express = require('express');
const path = require('path');  // Esto es para gestionar rutas de archivos
const app = express();
const port = process.env.PORT || 8080;

// Middleware para servir archivos estáticos (como HTML, CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));  // 'public' es la carpeta donde pondremos los archivos

// Endpoint GET para servir el archivo HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));  // Cambia esto por la ubicación correcta si es necesario
});

// Endpoint GET para la API
app.get('/api', (req, res) => {
  res.json({ message: "¡Hola desde la API!" });
});

// Servir API POST
app.post('/api/crear', (req, res) => {
  const { nombre, email } = req.body;
  res.json({
    message: `Usuario ${nombre} con email ${email} creado exitosamente!`
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
