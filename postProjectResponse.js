import puppeteer from 'puppeteer';

// Récupérer les arguments depuis la ligne de commande
const projectId = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];
const message = process.argv[5];
const headless = process.argv[6] !== 'false'; // Par défaut true

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

if (!message) {
  console.log(JSON.stringify({ error: "Argument manquant: message" }));
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

    // Réponse
    try {
      // Cliquer sur le bouton "Faire une offre"
      let offerButton = await page.$('a[data-url*="/offers/new"]');

      if (!offerButton) {
        // Chercher par XPath si le premier sélecteur ne fonctionne pas
        const buttons = await page.$x("//a[contains(text(), 'Faire une offre')]");
        if (buttons.length > 0) {
          offerButton = buttons[0];
        }
      }

      if (!offerButton) {
        console.log(JSON.stringify({ error: "Impossible de trouver le bouton 'Faire une offre'" }));
        return;
      }

      // Attendre que le bouton soit cliquable
      await page.waitForSelector('a[data-url*="/offers/new"]', { visible: true, timeout: 10000 });
      await offerButton.click();
      await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre plus longtemps

      // Attendre que le formulaire soit chargé
      await page.waitForSelector('input[name="offer[amount]"]', { visible: true, timeout: 15000 });

      // Remplir le champ montant
      const amountInput = await page.$('input[name="offer[amount]"]');
      if (amountInput) {
        // Attendre que le champ soit visible et cliquable
        await page.waitForSelector('input[name="offer[amount]"]', { visible: true });
        await page.focus('input[name="offer[amount]"]');
        await page.evaluate(() => document.querySelector('input[name="offer[amount]"]').value = '');
        await page.type('input[name="offer[amount]"]', '42');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Remplir le champ délai
        const durationInput = await page.$('input[name="offer[duration]"]');
        if (durationInput) {
          await page.waitForSelector('input[name="offer[duration]"]', { visible: true });
          await page.focus('input[name="offer[duration]"]');
          await page.evaluate(() => document.querySelector('input[name="offer[duration]"]').value = '');
          await page.type('input[name="offer[duration]"]', '30');
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          console.log(JSON.stringify({ error: "Impossible de trouver le champ délai" }));
          return;
        }

        // Remplir le champ message
        const messageTextarea = await page.$('textarea[name="offer[comments_attributes][0][content]"]');
        if (messageTextarea) {
          await page.waitForSelector('textarea[name="offer[comments_attributes][0][content]"]', { visible: true });
          await page.focus('textarea[name="offer[comments_attributes][0][content]"]');
          await page.evaluate(() => document.querySelector('textarea[name="offer[comments_attributes][0][content]"]').value = '');
          await page.type('textarea[name="offer[comments_attributes][0][content]"]', message);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.log(JSON.stringify({ error: "Impossible de trouver le champ message" }));
          return;
        }

        // Cliquer sur le bouton "Publier mon offre"
        const submitButton = await page.$('input[type="submit"][value="Publier mon offre"]');
        if (submitButton) {
          await page.waitForSelector('input[type="submit"][value="Publier mon offre"]', { visible: true });
          await page.evaluate(() => {
            const btn = document.querySelector('input[type="submit"][value="Publier mon offre"]');
            if (btn) btn.click();
          });
          await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
          console.log(JSON.stringify({ error: "Impossible de trouver le bouton 'Publier mon offre'" }));
          return;
        }

        console.log(JSON.stringify({
          success: true,
          message: "Offre complète envoyée avec succès",
          projectId: projectId,
          amount: 42,
          duration: 30
        }));
      } else {
        console.log(JSON.stringify({ error: "Impossible de trouver le champ montant" }));
      }

    } catch (postError) {
      console.log(JSON.stringify({ error: "Erreur lors du remplissage", details: postError.message }));
    }

  } catch (generalError) {
    console.log(JSON.stringify({ error: "Erreur générale", details: generalError.message }));
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})(); 