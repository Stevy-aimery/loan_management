const mongoose = require('mongoose');
const Device = require('./models/Device');
const fs = require('fs');
require('dotenv').config();

// Connexion à la base de données
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/device-loan')
  .then(async () => {
    console.log('Connecté à MongoDB');
    
    // Récupérer tous les appareils
    const devices = await Device.find();
    
    // Vérifier si des appareils ont été trouvés
    if (devices.length === 0) {
      console.log('Aucun appareil trouvé dans la base de données.');
    } else {
      // Afficher les IDs et les références des appareils
      console.log('Liste des appareils dans la base de données :');
      devices.forEach(device => {
        console.log(`ID: ${device._id}, Référence: ${device.reference}, Marque: ${device.marque}, Type: ${device.type}`);
        console.log(`URL du formulaire: ${process.env.FRONTEND_URL}/formulaire/${device._id}`);
        
        // Sauvegarder le code QR dans un fichier
        if (device.qrCode) {
          const qrCodePath = `./qrcodes/${device.reference}_qrcode.png`;
          fs.writeFileSync(qrCodePath, device.qrCode.split(',')[1], 'base64');
          console.log(`QR code sauvegardé à: ${qrCodePath}`);
        }
      });
    }
    
    // Déconnexion de MongoDB
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  })
  .catch(error => {
    console.error('Erreur de connexion à MongoDB:', error);
  });
