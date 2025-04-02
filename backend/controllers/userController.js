const User = require('../models/user');

// Récupérer un utilisateur par son ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'nom prenom email telephone');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rechercher des utilisateurs par terme de recherche
exports.searchUsers = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({ message: 'Le terme de recherche doit contenir au moins 2 caractères' });
    }

    const regex = new RegExp(searchTerm, 'i');
    const users = await User.find({
      $or: [
        { nom: regex },
        { prenom: regex },
        { email: regex },
        { telephone: regex }
      ]
    }).limit(10);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un utilisateur par email
exports.getUserByEmail = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vérifier si un utilisateur existe déjà par email
exports.checkUserExists = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({ exists: true, user });
    }
    res.status(200).json({ exists: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un nouvel utilisateur
exports.createUser = async (req, res) => {
  try {
    const { nom, prenom, email, telephone } = req.body;
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Utilisateur déjà enregistré' });
    }
    const user = new User({ nom, prenom, email, telephone });
    await user.save();
    res.status(201).json({ message: 'Utilisateur enregistré avec succès', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
