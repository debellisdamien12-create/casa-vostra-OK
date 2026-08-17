# Guide de Reprise et Migration — Casa Vostra SARL

Ce document récapitule l’architecture du projet et les étapes nécessaires pour déployer l’application sur un autre hébergeur compatible Node.js si vous le souhaitez.

## 1. Contenu de l’archive
- **`client/`** : Application React 19, Tailwind CSS 4, composants de la page d’accueil, galerie XXL, formulaire de qualification brief et écrans de confirmation avec synthèse IA.
- **`server/`** : Serveur Express / tRPC, logique de soumission des leads, intégration Brevo pour les e-mails de notification et de déblocage client, gestion des pièces jointes S3.
- **`drizzle/`** : Schéma de base de données MySQL / TiDB et migrations.
- **`shared/`** : Types et constantes partagés.

## 2. Prérequis pour un nouvel hébergement
Pour faire fonctionner l’application ailleurs qu’sur Manus, l’hébergeur cible doit supporter :
1. **Node.js** (version 20 ou supérieure).
2. **Une base de données MySQL ou compatible TiDB**.
3. **Des variables d'environnement (secrets)** :
   - `DATABASE_URL` : Chaîne de connexion MySQL.
   - `BREVO_API_KEY` : Clé API Brevo pour l’envoi des e-mails.
   - `JWT_SECRET` : Clé de signature des sessions.

## 3. Lancement en local ou sur un VPS
1. Installer les dépendances :
   ```bash
   pnpm install
   ```
2. Configurer le fichier `.env` avec vos accès base de données et clé Brevo.
3. Exécuter les migrations de base de données :
   ```bash
   pnpm db:push
   ```
4. Lancer le serveur de développement :
   ```bash
   pnpm dev
   ```
5. Compiler pour la production :
   ```bash
   pnpm build
   pnpm start
   ```

---
*Généré pour Casa Vostra SARL — Rénovation, carrelage et faïence haut de gamme.*
