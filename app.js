const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

// Middleware para poder leer los datos enviados en POST
app.use(express.json());

// Endpoint GET
app.get('/api', (req, res) => {
  res.json({ message: "¡Hola desde la API!" });
});

// Endpoint POST
app.post('/api/crear', (req, res) => {
  const { nombre, email } = req.body;
  res.json({
    message: `Usuario ${nombre} con email ${email} creado exitosamente!`
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
