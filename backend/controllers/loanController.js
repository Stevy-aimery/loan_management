const Loan = require('../models/loan');
const User = require('../models/user');
const Device = require('../models/device');

// Récupérer un emprunt par son ID
exports.getLoanById = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate('user', 'nom prenom email telephone')
      .populate('device', 'reference marque type');
    
    if (!loan) {
      return res.status(404).json({ message: 'Emprunt non trouvé' });
    }
    
    res.status(200).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un nouvel emprunt
exports.createLoan = async (req, res) => {
  try {
    const { 
      nom, prenom, adresse, email, telephone, 
      deviceId, motif_restitution, date_emprunt, 
      date_restitution, etat_materiel, materiel 
    } = req.body;
    
    // Vérifier si l'appareil existe
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ message: 'Appareil non trouvé' });
    }
    
    // Vérifier si l'appareil est disponible
    if (!device.disponible) {
      return res.status(400).json({ message: 'Cet appareil n\'est pas disponible pour l\'emprunt' });
    }
    
    // Créer ou récupérer l'utilisateur
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({
        nom,
        prenom,
        adresse,
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
      date_emprunt: new Date(date_emprunt),
      date_restitution: new Date(date_restitution),
      etat_materiel,
      materiel,
      status: 'emprunté',
      type_action: 'emprunt'
    });
    
    // Enregistrer l'emprunt
    const savedLoan = await newLoan.save();
    
    // Mettre à jour l'appareil
    device.disponible = false;
    await device.save();
    
    // Retourner l'emprunt avec les informations de l'utilisateur et de l'appareil
    const populatedLoan = await Loan.findById(savedLoan._id)
      .populate('user', 'nom prenom email telephone')
      .populate('device', 'reference marque type');
    
    res.status(201).json(populatedLoan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Enregistrer une restitution
exports.returnDevice = async (req, res) => {
  try {
    const deviceId = req.params.id;
    const { 
      nom, prenom, email, telephone, 
      motif_restitution, date_restitution_reelle, 
      etat_materiel, commentaire 
    } = req.body;
    
    // Vérifier si l'appareil existe
    const device = await Device.findById(deviceId);
    if (!device) {
      return res.status(404).json({ message: 'Appareil non trouvé' });
    }
    
    // Vérifier si l'appareil est actuellement emprunté
    if (device.disponible) {
      return res.status(400).json({ message: 'Cet appareil n\'est pas actuellement emprunté' });
    }
    
    // Trouver l'emprunt actif pour cet appareil
    const activeLoan = await Loan.findOne({ 
      device: deviceId, 
      status: 'emprunté' 
    }).sort({ createdAt: -1 });
    
    if (!activeLoan) {
      return res.status(404).json({ message: 'Aucun emprunt actif trouvé pour cet appareil' });
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
    
    // Mettre à jour l'emprunt
    activeLoan.date_restitution_reelle = new Date(date_restitution_reelle);
    activeLoan.etat_materiel = etat_materiel;
    activeLoan.motif_restitution = motif_restitution;
    activeLoan.commentaire = commentaire;
    activeLoan.status = 'rendu';
    activeLoan.type_action = 'restitution';
    
    // Enregistrer les modifications
    await activeLoan.save();
    
    // Mettre à jour l'appareil
    device.disponible = true;
    device.etat = etat_materiel;
    await device.save();
    
    // Retourner l'emprunt mis à jour
    const populatedLoan = await Loan.findById(activeLoan._id)
      .populate('user', 'nom prenom email telephone')
      .populate('device', 'reference marque type');
    
    res.status(200).json(populatedLoan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Enregistrer un signalement
exports.reportDevice = async (req, res) => {
  try {
    const deviceId = req.params.id;
    const { 
      nom, prenom, email, telephone, 
      description_signalement, etat_appareil,
      commentaire 
    } = req.body;
    
    // Vérifier si l'appareil existe
    const device = await Device.findById(deviceId);
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
    
    // Créer un nouveau signalement (sous forme d'emprunt avec statut 'signalé')
    const newReport = new Loan({
      user: user._id,
      device: device._id,
      motif_restitution: 'Signalement',
      date_emprunt: new Date(),
      date_restitution: new Date(),
      etat_materiel: etat_appareil,
      description_signalement,
      commentaire,
      status: 'signalé',
      type_action: 'signalement'
    });
    
    // Enregistrer le signalement
    const savedReport = await newReport.save();
    
    // Mettre à jour l'état de l'appareil
    device.etat = etat_appareil;
    await device.save();
    
    // Retourner le signalement avec les informations de l'utilisateur et de l'appareil
    const populatedReport = await Loan.findById(savedReport._id)
      .populate('user', 'nom prenom email telephone')
      .populate('device', 'reference marque type');
    
    res.status(201).json(populatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
