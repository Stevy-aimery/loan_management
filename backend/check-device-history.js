require('dotenv').config();
const mongoose = require('mongoose');
const Device = require('./models/Device');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connecté'))
  .catch(err => console.error('Erreur de connexion MongoDB:', err));

// Fonction pour vérifier l'historique d'un appareil
async function checkDeviceHistory(deviceId) {
  try {
    const device = await Device.findById(deviceId);
    
    if (!device) {
      console.log(`Appareil avec l'ID ${deviceId} non trouvé`);
      return;
    }
    
    console.log('Informations de l\'appareil:');
    console.log(`Référence: ${device.reference}`);
    console.log(`Marque: ${device.marque}`);
    console.log(`Type: ${device.type}`);
    console.log(`Disponible: ${device.disponible}`);
    
    if (device.historique && device.historique.length > 0) {
      console.log('\nHistorique des emprunts:');
      device.historique.forEach((emprunt, index) => {
        console.log(`\nEmprunt #${index + 1}:`);
        console.log(`Utilisateur: ${emprunt.utilisateur.nom} ${emprunt.utilisateur.prenom}`);
        console.log(`Email: ${emprunt.utilisateur.email}`);
        console.log(`Téléphone: ${emprunt.utilisateur.telephone || 'Non spécifié'}`);
        console.log(`Date d'emprunt: ${emprunt.dateEmprunt}`);
        console.log(`Date de restitution prévue: ${emprunt.dateRestitution}`);
        console.log(`Motif: ${emprunt.motif || 'Non spécifié'}`);
        console.log(`Matériel: ${emprunt.materiel || 'Non spécifié'}`);
        console.log(`État du matériel: ${emprunt.etat_materiel || 'Non spécifié'}`);
      });
    } else {
      console.log('\nAucun historique d\'emprunt pour cet appareil');
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'historique:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Vérifier l'historique de l'appareil avec l'ID spécifié
// Remplacez l'ID ci-dessous par l'ID de l'appareil que vous souhaitez vérifier
const deviceId = '67c828e833fdfdd61dc08c01';
checkDeviceHistory(deviceId);
