const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Routes pour les emprunts - uniquement celles nécessaires pour l'enregistrement
router.get('/:id', loanController.getLoanById);
router.post('/', loanController.createLoan);

// Nouvelles routes pour la restitution et le signalement
router.post('/:id/return', loanController.returnDevice);
router.post('/:id/report', loanController.reportDevice);

module.exports = router;
