# Diagnostic e-mail Brevo — 17 août 2026

## Constat de production

Le journal Render du brief testé à 16:42 indique l’appel de notification propriétaire avec une pièce jointe, puis une réponse positive de Brevo avec le message ID `<202608171442.17872675340@smtp-relay.mailin.fr>`.

Dans Brevo Transactionnel > Temps réel, ce même message, intitulé `[Casa Vostra] Nouveau brief #467108 - 11111`, est enregistré comme **Délivré** à `contact@casavostra.corsica`. L’activité Brevo indique aussi des ouvertures pour d’autres briefs récents et aucun rejet.

La boîte Outlook actuellement ouverte est identifiée comme `Damien@casavostra.corsica`, alors que le destinataire configuré dans le site est `contact@casavostra.corsica`. Cette différence doit être vérifiée : ces adresses peuvent être deux boîtes Microsoft 365 distinctes, ou une règle/alias peut détourner les messages.

## Conséquence

Le formulaire, Render et l’API Brevo ont bien transmis le message jusqu’au serveur de messagerie destinataire. La suite du diagnostic doit se concentrer sur la boîte Microsoft 365 réellement associée à `contact@casavostra.corsica`, ses règles de réception et son éventuel rôle d’alias.
