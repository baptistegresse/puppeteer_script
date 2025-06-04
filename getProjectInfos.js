import puppeteer from 'puppeteer';

// Récupérer les arguments depuis la ligne de commande
const projectId = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];
const headless = process.argv[5] !== 'false'; // Par défaut true

// Vérifier que tous les arguments obligatoires sont présents
if (!projectId) {
  console.log(JSON.stringify({ error: "Argument manquant: projectId" }));
  process.exit(1);
}

if (!email) {
  console.log(JSON.stringify({ error: "Argument manquant: email" }));
  process.exit(1);
}

if (!password) {
  console.log(JSON.stringify({ error: "Argument manquant: password" }));
  process.exit(1);
}

(async () => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    const page = await browser.newPage();

    // Connexion
    try {
      await page.goto('https://www.codeur.com/users/sign_in');
      await page.type('#user_email', email);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.type("#user_password", password);

      await page.evaluate(() => {
        document.getElementById('user_remember_me').checked = false;
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      await page.evaluate(() => {
        document.querySelector('input[type="submit"]').click();
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (loginError) {
      console.log(JSON.stringify({ error: "Erreur de connexion", details: loginError.message }));
      return;
    }

    // Navigation vers le projet
    try {
      await page.goto(`https://www.codeur.com/projects/${projectId}`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (navError) {
      console.log(JSON.stringify({ error: "Erreur de navigation", details: navError.message }));
      return;
    }

    // Extraction des données
    try {
      const projectInfos = await page.evaluate(() => {
        const description = document.querySelector('.project-description .content');
        const budget = document.querySelector('.project-details p:nth-child(1) .font-semibold');
        const publication = document.querySelector('.project-details p:nth-child(2) .font-semibold');
        const profils = document.querySelector('.project-details p:nth-child(3) .font-semibold');

        return {
          description: description ? description.textContent.trim() : null,
          budget: budget ? budget.textContent.trim() : null,
          publication: publication ? publication.textContent.trim() : null,
          profils: profils ? profils.textContent.trim() : null
        };
      });

      console.log(JSON.stringify(projectInfos));

    } catch (extractError) {
      console.log(JSON.stringify({ error: "Erreur d'extraction", details: extractError.message }));
    }

  } catch (generalError) {
    console.log(JSON.stringify({ error: "Erreur générale", details: generalError.message }));
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();