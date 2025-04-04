const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes pour les utilisateurs
router.get('/', userController.getAllUsers);
router.get('/search', userController.searchUsers);
router.get('/email/:email', userController.getUserByEmail);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);

// Route pour vérifier si un utilisateur existe déjà
router.get('/exists/:email', userController.checkUserExists);

module.exports = router;
