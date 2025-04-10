const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT;

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

// Endpoint POST de ejemplo
app.post('/api/crear', (req, res) => {
  const { nombre, email } = req.body;
  res.json({
    message: `Usuario ${nombre} con email ${email} creado exitosamente!`
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo correctamente`);
});
