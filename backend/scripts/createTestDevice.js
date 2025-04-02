const mongoose = require('mongoose');
const Device = require('../models/Device');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Fonction pour générer un QR code et le sauvegarder comme fichier
const generateQRCode = async (deviceId) => {
  try {
    // Créer le dossier pour les QR codes s'il n'existe pas
    const qrCodeDir = path.join(__dirname, '../imagesqr');
    if (!fs.existsSync(qrCodeDir)) {
      fs.mkdirSync(qrCodeDir, { recursive: true });
    }

    // Générer le QR code
    const qrCodePath = path.join(qrCodeDir, `${deviceId}_qrcode.png`);
    const qrData = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/formulaire/${deviceId}`;
    
    await QRCode.toFile(qrCodePath, qrData);
    
    // Générer également une version Data URL pour stocker dans la base de données
    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    
    // Retourner le chemin relatif du QR code et la version Data URL
    return {
      filePath: `/imagesqr/${deviceId}_qrcode.png`,
      dataURL: qrCodeDataURL
    };
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
    throw error;
  }
};

// Fonction pour créer un appareil et générer son QR code
async function createDeviceWithQRCode(deviceData) {
  try {
    console.log('Tentative de création d\'un nouvel appareil avec les données:', deviceData);
    // Créer un nouvel appareil
    const device = new Device(deviceData);
  
    // Sauvegarder l'appareil pour obtenir son ID
    const savedDevice = await device.save();
    console.log('Appareil sauvegardé avec succès:', savedDevice);
    console.log('Appareil créé avec ID:', savedDevice._id);

    // Générer le QR code avec l'ID de l'appareil
    const qrCode = await generateQRCode(savedDevice._id);
    console.log('QR code généré:', qrCode);

    // Mettre à jour l'appareil avec le QR code (version Data URL)
    savedDevice.qrCode = qrCode.dataURL;
    await savedDevice.save();
    console.log('Appareil mis à jour avec le QR code:', savedDevice);
    console.log('QR code généré et enregistré');

    // Afficher les détails de l'appareil
    console.log('Appareil de test créé:');
    console.log('- Référence:', savedDevice.reference);
    console.log('- Marque:', savedDevice.marque);
    console.log('- Type:', savedDevice.type);
    console.log('- URL de l\'image:', savedDevice.imageUrl);
    console.log('- ID:', savedDevice._id);
    console.log('- URL du formulaire:', `${process.env.FRONTEND_URL || 'http://localhost:4200'}/formulaire/${savedDevice._id}`);
    console.log('- URL du QR code:', qrCode.filePath);
  
    return savedDevice;
  } catch (error) {
    console.error('Erreur lors de la création de l\'appareil:', error);
  }
}

// Fonction principale
async function createTestDevices() {
  try {
    console.log('Début de la création des appareils de test');
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/device-loan');
    // await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/device-loan');
    console.log('Connecté à MongoDB');

    const devicesData = [
      // Premier appareil - Ordinateur portable
      {
        reference: 'LAPTOP-' + Date.now(),
        marque: 'Dell',
        type: 'Ordinateur Portable',
        etat: 'Bon état',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=300&auto=format&fit=crop'
      },
      // Deuxième appareil - Microphone
      {
        reference: 'MICRO-' + Date.now(),
        marque: 'Shure',
        type: 'Microphone',
        etat: 'Bon état',
        imageUrl: 'https://www.pic-event.fr/wp-content/uploads/2019/05/Pic-Event_micro_chant_shure.jpg'
      },
      {
        reference: 'TELE-' + Date.now(),
        marque: 'SHARPE',
        type: 'TELE',
        etat: 'Bon état',
        imageUrl: 'https://th.bing.com/th/id/OIP.7nn86nWTyw6ygJN95dnlIwHaHa?rs=1&pid=ImgDetMain'
      }
    ];

    for (const deviceData of devicesData) {
      await createDeviceWithQRCode(deviceData);
    }
    console.log('Création des appareils de test terminée');

    // Déconnexion de MongoDB
    await mongoose.disconnect();
    console.log('Déconnecté de MongoDB');
  } catch (error) {
    console.error('Erreur lors de la création des appareils de test:', error);
  }
}

// // Exécuter la fonction
createTestDevices();


// const mongoose = require('mongoose');
// const Device = require('../models/Device');
// const QRCode = require('qrcode');
// const fs = require('fs');
// const path = require('path');
// require('dotenv').config();

// // Fonction pour générer un QR code et le sauvegarder comme fichier
// const generateQRCode = async (deviceId) => {
//   try {
//     // Créer le dossier pour les QR codes s'il n'existe pas
//     const qrCodeDir = path.join(__dirname, '../imagesqr');
//     if (!fs.existsSync(qrCodeDir)) {
//       fs.mkdirSync(qrCodeDir, { recursive: true });
//     }

//     // Générer le QR code
//     const qrCodePath = path.join(qrCodeDir, `${deviceId}_qrcode.png`);
//     const qrData = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/formulaire/${deviceId}`;
    
//     await QRCode.toFile(qrCodePath, qrData);
    
//     // Générer également une version Data URL pour stocker dans la base de données
//     const qrCodeDataURL = await QRCode.toDataURL(qrData);
    
//     // Retourner le chemin relatif du QR code et la version Data URL
//     return {
//       filePath: `/imagesqr/${deviceId}_qrcode.png`,
//       dataURL: qrCodeDataURL
//     };
//   } catch (error) {
//     console.error('Erreur lors de la génération du QR code:', error);
//     throw error;
//   }
// };

// // Fonction pour créer un appareil et générer son QR code
// async function createDeviceWithQRCode(deviceData) {
//   // Créer un nouvel appareil
//   const device = new Device(deviceData);
  
//   // Sauvegarder l'appareil pour obtenir son ID
//   const savedDevice = await device.save();
//   console.log('Appareil créé avec ID:', savedDevice._id);

//   // Générer le QR code avec l'ID de l'appareil
//   const qrCode = await generateQRCode(savedDevice._id);

//   // Mettre à jour l'appareil avec le QR code (version Data URL)
//   savedDevice.qrCode = qrCode.dataURL;
//   await savedDevice.save();
//   console.log('QR code généré et enregistré');

//   // Afficher les détails de l'appareil
//   console.log('Appareil de test créé:');
//   console.log('- Référence:', savedDevice.reference);
//   console.log('- Marque:', savedDevice.marque);
//   console.log('- Type:', savedDevice.type);
//   console.log('- URL de l\'image:', savedDevice.imageUrl);
//   console.log('- ID:', savedDevice._id);
//   console.log('- URL du formulaire:', `${process.env.FRONTEND_URL || 'http://localhost:4200'}/formulaire/${savedDevice._id}`);
//   console.log('- URL du QR code:', qrCode.filePath);
  
//   return savedDevice;
// }

// // Fonction principale
// async function createTestDevices() {
//   try {
//     // Connexion à MongoDB
//     await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/device-loan-system');
//     console.log('Connecté à MongoDB');

//     // Premier appareil - Ordinateur portable
//     const laptop = {
//       reference: 'LAPTOP-' + Date.now(),
//       marque: 'Dell',
//       type: 'Ordinateur Portable',
//       etat: 'Bon état',
//       imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=300&auto=format&fit=crop'
//     };
    
//     // Deuxième appareil - Microphone
//     const microphone = {
//       reference: 'MICRO-' + Date.now(),
//       marque: 'Shure',
//       type: 'Microphone',
//       etat: 'Bon état',
//       imageUrl: 'https://www.pic-event.fr/wp-content/uploads/2019/05/Pic-Event_micro_chant_shure.jpg'
//     };

//     const télé = {
//       reference: 'TELE-' + Date.now(),
//       marque: 'SHARPE',
//       type: 'TELE',
//       etat: 'Bon état',
//       imageUrl: 'https://th.bing.com/th/id/OIP.7nn86nWTyw6ygJN95dnlIwHaHa?rs=1&pid=ImgDetMain'
//     };

//     // Créer les deux appareils
//     await createDeviceWithQRCode(laptop);
//     await createDeviceWithQRCode(microphone);
//     await createDeviceWithQRCode(télé);

//     console.log('Appareils de test créés avec succès!');

//     // Déconnexion de MongoDB
//     await mongoose.disconnect();
//     console.log('Déconnecté de MongoDB');
//   } catch (error) {
//     console.error('Erreur:', error);
//   }
// }

// // Exécuter la fonction
// createTestDevices();
