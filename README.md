# Codeur Scraper API

API pour récupérer les informations des projets sur Codeur.com

## 🚀 Déploiement sur Railway

### 1. Préparer le code
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Déployer sur Railway
1. Aller sur [railway.app](https://railway.app)
2. Se connecter avec GitHub
3. Cliquer "New Project" → "Deploy from GitHub repo"
4. Sélectionner votre repo

### 3. Aucune variable d'environnement nécessaire ! 🎉
Tout se passe par paramètres dans l'URL.

## 📡 Utilisation de l'API

### Récupérer les infos d'un projet
```
GET https://votre-app.railway.app/project/455498-site-web-analyse-crypto?email=votre-email@codeur.com&password=votre-mot-de-passe
```

### Paramètres
- `projectId` (dans l'URL) : ID du projet Codeur
- `email` (query param) : Votre email Codeur
- `password` (query param) : Votre mot de passe Codeur
- `headless` (query param, optionnel) : `true` ou `false` (défaut: `true`)

### Réponse
```json
{
  "description": "Description du projet...",
  "budget": "500 € à 1 000 €",
  "publication": "03 juin 2025 à 07h21",
  "profils": "Développeur spécifique, ..."
}
```

### Erreurs
```json
{
  "error": "Paramètre manquant: email"
}
```

## 🔗 Intégration avec n8n

Dans n8n, utiliser un nœud "HTTP Request" :
- **Method**: GET
- **URL**: `https://votre-app.railway.app/project/{{$json.projectId}}?email={{$json.email}}&password={{$json.password}}`

## 🧪 Test local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur
npm start

# Tester
curl "http://localhost:3000/project/455498-site-web-analyse-crypto?email=test@example.com&password=motdepasse"

# Ou tester directement le script
node getProjectInfos.js "455498-site-web-analyse-crypto" "email@example.com" "motdepasse"
```

## 🔒 Sécurité

⚠️ **Attention** : Les credentials sont passés dans l'URL. Pour la production, considérez :
- Utiliser HTTPS (Railway le fait automatiquement)
- Passer les credentials dans le body d'une requête POST
- Utiliser des tokens d'authentification
