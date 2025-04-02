const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// Route pour l'autocomplétion des utilisateurs
router.get('/autocomplete/users', deviceController.getUsersForAutocomplete);

// Routes pour les appareils - uniquement celle nécessaire pour obtenir les informations d'un appareil
router.get('/:id', deviceController.getDeviceById);

// Route pour les emprunts
router.post('/:id/borrow', deviceController.borrowDevice);

module.exports = router;
