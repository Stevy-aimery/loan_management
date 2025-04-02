const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true
  },
  marque: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  qrCode: {
    type: String,
    unique: true
  },
  imageUrl: {
    type: String,
    default: ''
  },
  etat: {
    type: String,
    enum: ['Neuf', 'Bon état', 'État moyen', 'Usé', 'bon', 'moyen', 'mauvais'],
    default: 'Bon état'
  },
  disponible: {
    type: Boolean,
    default: true
  },
  dateAcquisition: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware pour générer un QR code avant de sauvegarder
deviceSchema.pre('save', function(next) {
  // Le QR code sera généré dans le contrôleur
  next();
});

const Device = mongoose.models.Device || mongoose.model("Device", deviceSchema);

module.exports = Device;
