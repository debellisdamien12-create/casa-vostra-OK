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

## 4. Déploiement Render et domaine personnalisé

Le projet Casa Vostra doit être déployé comme **Web Service**, et non comme Static Site, car il utilise un serveur Node.js/tRPC, une base de données et des appels serveur pour les briefs.

Dans Render, utilisez les commandes suivantes :

```text
Build Command: pnpm install --frozen-lockfile && pnpm run build
Start Command: pnpm start
Root Directory: laisser vide
```

Après le premier déploiement, ouvrez le service Render, puis **Settings → Custom Domains → Add Custom Domain** et ajoutez `casavostra.corsica`. Render ajoutera également le sous-domaine `www` associé. Il faut ensuite copier dans la zone DNS Netim exactement les valeurs affichées par Render.

Pour le domaine racine, Render recommande un enregistrement **A** vers `216.24.57.1` si Netim ne propose pas de type ANAME/ALIAS. Pour `www`, utilisez un enregistrement **CNAME** vers le sous-domaine `casa-vostra-ok.onrender.com` ou la cible exacte indiquée par Render. Supprimez les éventuels enregistrements **AAAA** pendant la vérification, car Render utilise IPv4. Les modifications DNS peuvent nécessiter un délai de propagation.

Les enregistrements **MX, TXT et SRV** qui servent à Microsoft 365 doivent rester inchangés. Seuls les enregistrements web du domaine racine et de `www` doivent être ajustés. Une fois le DNS configuré, revenez dans Render et cliquez sur **Verify**. Render émet automatiquement le certificat TLS et redirige les connexions HTTP vers HTTPS.

Références officielles : [Render — Custom Domains](https://render.com/docs/custom-domains) et [Render — Configuring DNS Providers](https://render.com/docs/configure-other-dns).
