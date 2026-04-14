# Matrice Audit Ready — Module Trésorerie

Ce document synthétise le périmètre du module de trésorerie implémenté dans `app/page.tsx` sous forme de matrice de contrôle.

## Contexte

- Périmètre technique analysé: `app/page.tsx`
- Nature du module: front-end Next.js/React, données mockées en mémoire
- Rôles couverts: `TRESORIER`, `ADMIN_CLIENT`, `BACKOFFICE_BANQUE`, `ADMIN_BANQUE`

## Matrice `Fonction | Rôle | Données | Contrôle | Risque`

| Fonction | Rôle | Données principales | Contrôle implémenté | Risque principal |
|---|---|---|---|---|
| Authentification locale | Tous | `MOCK_USERS` (email, password, role, permissions) | Vérification identifiants côté client dans `handleLogin` | Sécurité faible (mot de passe en clair, pas d’auth serveur) |
| Navigation par rôle | Tous | `activePage`, `menuItems`, `breadcrumb` | Menus conditionnels selon rôle + permissions | Contournement possible si logique UI seule |
| Dashboard trésorerie (`dashboard`) | `TRESORIER`, `ADMIN_CLIENT` | Comptes, flux, KPI consolidés, série temporelle | Filtre compte + visualisation KPI/charts | Décisions basées sur mocks, non temps réel |
| Gestion des flux (`flux`) | `TRESORIER`, `ADMIN_CLIENT` (selon droits) | `flux`, statuts, sources, certitudes, montants, catégories | Filtres, pagination, validation/rejet, doublons, export | Erreur de qualification/validation manuelle |
| Création de flux (drawer) | Rôles avec `canDeclareFlux` | Formulaire flux (compte, sens, contrepartie, montant, date, certitude) | Soumission conditionnée aux droits, statut initial | Données incomplètes (pas de validation backend) |
| Suivi des comptes (`comptes`) | `TRESORIER`, `ADMIN_CLIENT` | Mouvements CBS, soldes progressifs | Filtres période/type + export CSV | Incohérence si source bancaire non synchronisée |
| Prévision de trésorerie (`prevision`) | `TRESORIER`, `ADMIN_CLIENT` | Flux filtrés, horizon, scénario, budgets catégories | Configuration périmètre + scénarios + analyse catégorielle | Modèle de prévision simplifié, risque de faux positifs |
| Analyse par catégorie | `TRESORIER`, `ADMIN_CLIENT` | Catégories, budgets, écarts, parts | Saisie budget inline + export CSV | Erreur humaine de budget impactant l’analyse |
| Alertes (`alertes`) | `TRESORIER`, `ADMIN_CLIENT`, banque via vues dédiées | `alertes` (type, severity, statut dismissed, compte) | Filtrage compte/type/statut + dismissal + compteur | Perte de traçabilité fine (audit trail limité) |
| Notifications cloche | Tous | Alertes non dismissées + filtre compte | Lecture centralisée + lien vers page alertes | Risque de non-traitement sans workflow imposé |
| Rapprochement (`rapprochement`) | Rôles avec accès module | Flux ERP, mouvements CBS, statuts de rapprochement | Scoring par critères + justification anomalies | Rapprochement partiellement heuristique (faux match) |
| Justification anomalie | Rôles autorisés rapprochement | Motif texte, anomalie ciblée | Passage `ANOMALIE` vers `RAPPROCHE` avec justification | Justification non signée/non historisée serveur |
| Multi-devises (`multidevises`) | Rôles avec accès module | Taux FX mockés, soldes convertis, simulations | Cartes FX + simulateur de paiement | Exposition change sous-estimée si taux non réels |
| Interface ERP/EBICS (`erp`) | Rôles avec accès module | Paramètres connexion, statut santé, sync CBS | Tests manuels, resynchronisation, historique sync | Connectivité simulée, pas de preuve de bout en bout |
| Reporting client (`reporting`) | `TRESORIER`, `ADMIN_CLIENT` | Définitions de rapports, comptes, exports | Génération/export par rapport + rapport personnalisé | Mauvaise interprétation si extraction non gouvernée |
| Reporting banque (`reporting`, `reporting_banque`) | `BACKOFFICE_BANQUE`, `ADMIN_BANQUE` | Agrégats multi-clients, exports consolidés | Sélection client + exports ciblés/consolidés | Diffusion inadaptée si gouvernance d’accès insuffisante |
| Dashboard banque (`dashboard_banque`) | `BACKOFFICE_BANQUE`, `ADMIN_BANQUE` | Encours clients, alertes, flux attente | Vue consolidée + drill-down dossier entreprise | Surcharge opérationnelle sans priorisation SLA |
| Gestion entreprises (`entreprises`) | Banque | Fiche entreprise, segment, statut, flux attente, alertes | Recherche/filtre + export + ouverture dossier | Qualité de données client inégale |
| Dossier entreprise (drawer banque) | Banque | Comptes, flux récents, alertes, prévision, historique CBS | Actions traiter alerte, contacter, exporter, générer rapport | Processus manuel fort, traçabilité limitée |
| Paramétrage utilisateurs (`parametrage` > utilisateurs) | `ADMIN_CLIENT` | Utilisateurs locaux, rôles, comptes accessibles | CRUD via drawer + filtres | Gestion IAM locale sans annuaire central |
| Groupes & permissions (`parametrage` > groupes) | `ADMIN_CLIENT` | Groupes, permissions fines | Toggle des droits + sauvegarde | Mauvaise affectation de droits (SoD) |
| Modules & fonctionnalités (`parametrage` > modules) | `ADMIN_CLIENT` (visibilité), banque (pilotage) | Modules actifs/inactifs | Affichage état d’activation par module | Divergence entre besoin métier et abonnement |
| Alertes & seuils (`parametrage` > alertes_seuils) | `ADMIN_CLIENT` | Seuil min/critique par compte, alerte email | Édition inline + sauvegarde | Seuils mal calibrés (sur/sous-alerte) |
| Catégories (`parametrage` > categories) | `ADMIN_CLIENT` | Référentiel catégories encaissement/décaissement | Ajout/édition/suppression | Dérive du référentiel sans gouvernance |
| Paramétrage CBS (`parametrage_cbs`) | `ADMIN_BANQUE` | Config EBICS, flux CBS, accès entreprise, params globaux | Onglets dédiés + test/save + synchro manuelle | Point critique d’administration centralisée |
| Connexion EBICS (`parametrage_cbs`) | `ADMIN_BANQUE` | Host, port, protocole, format, IDs | Test de connexion + sauvegarde | Mauvaise config = interruption service |
| Flux de données CBS (`parametrage_cbs`) | `ADMIN_BANQUE` | Fréquence, statut actif, synchro, format | Activation/désactivation + synchro manuelle | Décalage de données si fréquence inadéquate |
| Accès entreprises (`parametrage_cbs`) | `ADMIN_BANQUE` | Config ERP par entreprise, seuils auto/suggestion | Ouverture config détaillée par entreprise | Incohérence de paramétrage inter-clients |
| Paramètres globaux (`parametrage_cbs`) | `ADMIN_BANQUE` | Seuil global, timeout, devises, rétention, etc. | Édition inline + sauvegarde batch | Effet global d’une mauvaise valeur |
| Exports transverses | Tous selon droits `canExport` | CSV (flux, mouvements, entreprises, rapports) | Boutons export + états loading | Fuite de données si poste non maîtrisé |

## Points d’attention audit

| Domaine | Constat | Niveau |
|---|---|---|
| Sécurité auth | Authentification locale mockée, pas d’identity provider | Élevé |
| Traçabilité | Pas de journal d’audit persistant (qui a fait quoi, quand, avant/après) | Élevé |
| Intégration | Connecteurs ERP/CBS/EBICS simulés côté UI | Élevé |
| Résilience | Pas de gestion d’erreurs backend/réseau réelle | Moyen |
| Gouvernance données | Exports CSV multiples sans classification ni DLP | Moyen |

## Recommandations priorisées

1. Externaliser l’authentification et les autorisations vers un backend sécurisé (RBAC serveur).
2. Mettre en place un journal d’audit persistant (actions critiques: validation flux, seuils, paramètres, exports).
3. Isoler les intégrations ERP/CBS/EBICS dans des services backend avec monitoring et retry.
4. Ajouter une politique de classification des données exportées et contrôles de diffusion.
5. Découper `app/page.tsx` en modules fonctionnels pour réduire le risque de régression.
