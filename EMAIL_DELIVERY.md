# Guide de Délivrabilité E-mail — Casa Vostra

Ce document formalise le fonctionnement de l'envoi des briefs clients vers la boîte professionnelle **`contact@casavostra.corsica`** (hébergée sur Microsoft 365) via le relais transactionnel **Brevo**.

---

## 1. Distinction entre Acceptation SMTP et Réception Effective

Lorsqu'un visiteur soumet un brief sur le site de Casa Vostra :
1. **Génération et Acceptation (Brevo) :** Le serveur émet une requête HTTPS vers l'API Brevo. Si la clé est valide et le compte opérationnel, Brevo renvoie un code `200 OK` accompagné d'un identifiant unique (ex. `messageId: <20260814...@smtp-relay.mailin.fr>`).
   * *Statut :* L'e-mail a été **accepté** par le relais de sortie Brevo.
2. **Délivrabilité et Réception (Microsoft 365) :** Brevo transmet l'e-mail aux serveurs de messagerie Microsoft 365 associés à `casavostra.corsica`.
   * *Statut :* L'e-mail est **reçu** dans la boîte de réception ou, le cas échéant, filtré dans le dossier **Indésirables (Spam)** ou **Promotions** en l'absence d'enregistrements SPF/DKIM stricts chez Netim.

---

## 2. Procédure de Vérification en Cas de Non-Réception

Si l'artisan ne voit pas l'e-mail dans sa boîte principale :
* **Vérifier les Indésirables / Courrier indésirable** dans Outlook Microsoft 365.
* **Consulter l'historique des envois sur le tableau de bord Brevo** (onglet *Transactional → Logs*), qui indique précisément si l'e-mail a été *Delivered* à Microsoft 365 ou rejeté.
