import { exec } from 'child_process';
import express from 'express';
import { promisify } from 'util';

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Route pour récupérer les infos d'un projet
app.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { email, password, headless = 'true' } = req.query;

    // Vérifier que les paramètres obligatoires sont présents
    if (!email) {
      return res.status(400).json({ error: "Paramètre manquant: email" });
    }

    if (!password) {
      return res.status(400).json({ error: "Paramètre manquant: password" });
    }

    // Exécuter le script Puppeteer avec les paramètres
    const command = `node getProjectInfos.js "${projectId}" "${email}" "${password}" "${headless}"`;
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error('Erreur:', stderr);
      return res.status(500).json({ error: 'Erreur lors de l\'exécution', details: stderr });
    }

    // Parser le JSON retourné par le script
    const result = JSON.parse(stdout.trim());

    // Vérifier si c'est une erreur
    if (result.error) {
      return res.status(400).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Route par défaut
app.get('/', (req, res) => {
  res.json({
    message: 'API Codeur Scraper',
    endpoints: {
      'GET /project/:projectId?email=xxx&password=xxx': 'Récupérer les infos d\'un projet',
      'GET /health': 'Vérifier le statut de l\'API'
    },
    example: 'GET /project/455498-site-web-analyse-crypto?email=test@example.com&password=motdepasse'
  });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 