const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes        = require('./modules/auth/auth.routes');
const usersRoutes       = require('./modules/users/users.routes');
const calificadorRoutes = require('./modules/calificador/calificador.routes');
const gruposRoutes      = require('./modules/grupos/grupos.routes');
const iaRoutes          = require('./modules/ia/ia.routes');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth',        authRoutes);
app.use('/api/users',       usersRoutes);
app.use('/api/calificador', calificadorRoutes);
app.use('/api/grupos',      gruposRoutes);
app.use('/api/ia',          iaRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});