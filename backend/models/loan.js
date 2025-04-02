const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  motif_restitution: {
    type: String,
    required: true
  },
  date_emprunt: {
    type: Date,
    required: true,
    default: Date.now
  },
  date_restitution: {
    type: Date,
    required: true
  },
  date_restitution_reelle: {
    type: Date
  },
  etat_materiel: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['emprunté', 'rendu', 'signalé'],
    default: 'emprunté'
  },
  type_action: {
    type: String,
    enum: ['emprunt', 'restitution', 'signalement'],
    default: 'emprunt'
  },
  description_signalement: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Loan', loanSchema);
