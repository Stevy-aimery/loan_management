# API de Gestion des Appareils

Cette API permet de gérer les appareils de l'entreprise, de générer des codes QR uniques pour chaque appareil, et de suivre les emprunts et restitutions.

## Configuration requise

- Node.js
- MongoDB

## Installation

1. Cloner le dépôt
2. Installer les dépendances : `npm install`
3. Créer un fichier `.env` à la racine du projet avec les variables suivantes :
   ```
   MONGODB_URI=mongodb://localhost:27017/device_management
   PORT=5000
   FRONTEND_URL=http://localhost:4200
   ```

## Démarrage

- Mode développement : `npm run dev`
- Mode production : `npm start`

## Endpoints API

### Appareils

- `GET /api/devices` - Récupérer tous les appareils
- `GET /api/devices/:id` - Récupérer un appareil par son ID
- `POST /api/devices` - Créer un nouvel appareil
- `PUT /api/devices/:id` - Mettre à jour un appareil
- `DELETE /api/devices/:id` - Supprimer un appareil

### Emprunts et Restitutions

- `POST /api/devices/:id/borrow` - Enregistrer un emprunt d'appareil
- `POST /api/devices/:id/return` - Enregistrer une restitution d'appareil

## Structure des données

### Appareil

```json
{
  "reference": "REF123",
  "marque": "Dell",
  "type": "Ordinateur",
  "qrCode": "data:image/png;base64,...",
  "etat": "Bon état",
  "disponible": true,
  "dateAcquisition": "2025-03-05T10:30:00.000Z",
  "historique": [
    {
      "utilisateur": {
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean.dupont@example.com"
      },
      "dateEmprunt": "2025-03-01T09:00:00.000Z",
      "dateRestitution": "2025-03-05T09:00:00.000Z",
      "motif": "Télétravail"
    }
  ]
}
```
