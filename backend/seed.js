const mongoose = require('mongoose');
const Device = require('./models/Device');
const QRCode = require('qrcode');
require('dotenv').config();

// Fonction pour générer un QR code
const generateQRCode = async (deviceId) => {
  try {
    const qrData = `${process.env.FRONTEND_URL}/formulaire/${deviceId}`;
    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
    throw error;
  }
};

// Connexion à la base de données
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connecté à MongoDB');
    
    // Supprimer tous les appareils existants
    await Device.deleteMany({});
    console.log('Base de données nettoyée');
    
    // Créer de nouveaux appareils
    const devices = [
      {
        reference: 'LAPTOP-001',
        marque: 'Dell',
        type: 'Ordinateur',
        etat: 'Bon état',
        disponible: true
      },
      {
        reference: 'TABLET-001',
        marque: 'Samsung',
        type: 'Tablette',
        etat: 'Neuf',
        disponible: true
      },
      {
        reference: 'PHONE-001',
        marque: 'iPhone',
        type: 'Téléphone',
        etat: 'État moyen',
        disponible: true
      }
    ];
    
    // Sauvegarder les appareils et générer les QR codes
    for (const deviceData of devices) {
      const device = new Device(deviceData);
      const savedDevice = await device.save();
      
      // Générer et sauvegarder le QR code
      const qrCode = await generateQRCode(savedDevice._id);
      savedDevice.qrCode = qrCode;
      await savedDevice.save();
      
      console.log(`Appareil créé: ${savedDevice.reference}`);
    }
    
    console.log('Données initiales créées avec succès');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1);
  });
