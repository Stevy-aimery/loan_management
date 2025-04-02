const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { PORT } = require('./config/config');
const path = require('path');
require('dotenv').config();

// Connexion à la base de données
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du dossier imagesqr
app.use('/imagesqr', express.static(path.join(__dirname, 'imagesqr')));
// Servir les fichiers statiques du dossier public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/devices', require('./routes/deviceRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/loans', require('./routes/loanRoutes'));

// Route de base
app.get('/', (req, res) => {
  res.send('API du système de gestion des appareils');
});

// Port et démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
