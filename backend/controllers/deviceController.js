const Device = require('../models/Device');
const User = require('../models/user');
const Loan = require('../models/loan');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Générer un QR code pour un appareil
exports.generateQRCode = async (deviceId) => {
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
    
    // Retourner le chemin relatif du QR code
    return `/imagesqr/${deviceId}_qrcode.png`;
  } catch (error) {
    console.error('Erreur lors de la génération du QR code:', error);
    throw error;
  }
};

// Obtenir un appareil par ID
exports.getDeviceById = async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: 'Appareil non trouvé' });
    }
    
    // Vérifier si l'URL de l'image est externe (commence par http ou https)
    if (device.imageUrl && !device.imageUrl.startsWith('http')) {
      // Si l'URL est relative, s'assurer qu'elle est correctement formatée
      if (!device.imageUrl.startsWith('/')) {
        device.imageUrl = '/' + device.imageUrl;
      }
    }
    
    res.status(200).json(device);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Enregistrer un emprunt d'appareil
exports.borrowDevice = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, motif_restitution, dateEmprunt, dateRestitution, etat_materiel, type_action, description_signalement } = req.body;
    
    const device = await Device.findById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: 'Appareil non trouvé' });
    }
    
    // Créer ou récupérer l'utilisateur
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        nom,
        prenom,
        email,
        telephone
      });
      
      user = await user.save();
    }
    
    // Créer un nouvel emprunt
    const newLoan = new Loan({
      user: user._id,
      device: device._id,
      motif_restitution,
      date_emprunt: new Date(dateEmprunt),
      date_restitution: new Date(dateRestitution),
      etat_materiel,
      type_action: type_action || 'emprunt',
      description_signalement,
      status: type_action === 'restitution' ? 'rendu' : (type_action === 'signalement' ? 'signalé' : 'emprunté')
    });
    
    // Enregistrer l'emprunt
    const savedLoan = await newLoan.save();
    
    // Mettre à jour l'état de l'appareil en fonction du type d'action
    if (type_action === 'emprunt') {
      device.disponible = false;
    } else if (type_action === 'restitution') {
      device.disponible = true;
    }
    
    const updatedDevice = await device.save();
    
    // Retourner l'emprunt avec les informations de l'utilisateur et de l'appareil
    const populatedLoan = await Loan.findById(savedLoan._id)
      .populate('user', 'nom prenom email telephone')
      .populate('device', 'reference marque type');
    
    res.status(200).json({
      loan: populatedLoan,
      device: updatedDevice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer les utilisateurs pour l'autocomplétion
exports.getUsersForAutocomplete = async (req, res) => {
  try {
    const users = await User.find({}, 'nom prenom email telephone');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
