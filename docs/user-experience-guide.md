# Guide UX du Projet — Expérience Utilisateur, Couleurs et Organisation

Ce document décrit l’expérience utilisateur actuelle du projet, le système visuel (couleurs) et l’organisation des écrans.

## 1) Expérience utilisateur (UX)

## 1.1 Objectif UX

L’interface est pensée pour un usage **opérationnel quotidien** de la trésorerie, avec deux contextes:

- **Entreprise**: pilotage cash, flux, alertes, prévision, reporting.
- **Banque**: supervision multi-clients, paramétrage CBS/EBICS, reporting consolidé.

Les principes UX dominants sont:

- Accès rapide aux actions critiques (rechercher, valider, exporter).
- Densité d’information élevée mais structurée (KPI + tableaux + graphiques).
- Feedback immédiat (toasts, badges de statut, états de chargement).

## 1.2 Parcours utilisateur principaux

### A. Parcours entreprise (trésorier / admin client)

1. Connexion.
2. Lecture du `dashboard` (KPI, tendances).
3. Traitement des `flux` (filtrer, valider/rejeter, créer).
4. Vérification `alertes` et ajustement des seuils si nécessaire.
5. Analyse `prevision` et export de rapports.

### B. Parcours banque (backoffice / admin banque)

1. Connexion.
2. Vue `dashboard_banque` (encours, urgences, clients à risque).
3. Accès à `entreprises` puis ouverture du dossier entreprise.
4. Traitement alertes/anomalies et génération de rapports.
5. Administration de `parametrage_cbs`.

## 1.3 Mécanismes UX transverses

- **Sidebar**: navigation principale persistante, mode réduit possible.
- **Breadcrumb**: repère de contexte (`Trésorerie > ...` ou `Banque > ...`).
- **Header**: notifications, profil utilisateur, action de déconnexion.
- **Toasts**: confirmation succès/erreur/info.
- **Modales**: confirmation actions sensibles (suppression, rejet, etc.).
- **Drawers**: édition/consultation contextuelle (flux, utilisateurs, dossier entreprise, config ERP).

## 2) Système de couleurs

## 2.1 Palette principale

Couleurs dominantes observées dans `app/page.tsx`:

- `#111E3F`: fond sidebar / identité sombre.
- `#1B2E5E`: couleur primaire (actions principales, titres, CTA).
- `#3B6FD4`: accent secondaire (liens, infos, sélection, rôles).
- `#F4F6FB`: fond global application.
- `#FFFFFF`: surfaces cartes/tableaux/drawers.
- `#DDE3EF`: bordures neutres, séparateurs.
- `#64748B` / `#94A3B8`: textes secondaires et labels.

## 2.2 Couleurs sémantiques

- **Succès / positif**: `#16A34A`
- **Alerte / warning**: `#D97706`
- **Erreur / critique**: `#DC2626`
- **Violet complémentaire**: `#7C3AED` (certaines catégories/rôles)

## 2.3 Couleurs par statut métier

Les badges utilisent une codification claire:

- `CONFIRME` → vert
- `PROBABLE` → orange
- `INCERTAIN` → rouge
- `VALIDE` / `EXECUTE` → vert / bleu foncé
- `EN_ATTENTE` → orange
- `REJETE` → rouge

Cette cohérence visuelle réduit le temps de lecture des tableaux et des listes d’alertes.

## 2.4 Couleurs par rôle

Couleurs de rôles (`ROLE_COLORS`):

- `TRESORIER` → `#3B6FD4`
- `ADMIN_CLIENT` → `#7C3AED`
- `BACKOFFICE_BANQUE` → `#D97706`
- `ADMIN_BANQUE` → `#DC2626`

## 3) Organisation de l’interface

## 3.1 Structure générale écran

- **Colonne gauche**: sidebar (navigation).
- **Zone haute**: header (breadcrumb, notifications, profil).
- **Zone centrale**: contenu de page (titre + composants métier).

Layout orienté desktop avec largeur fixe pour certains panneaux (drawers, filtres).

## 3.2 Organisation de navigation

### Menu côté entreprise

- `dashboard`
- `flux`
- `prevision`
- `alertes`
- `comptes`
- `rapprochement` (si module actif)
- `multidevises` (si module actif)
- `erp` (si module actif)
- `reporting`
- `parametrage` (si admin client)

### Menu côté banque

- `dashboard_banque`
- `entreprises`
- `reporting_banque`
- `parametrage_cbs` (si admin banque)

## 3.3 Organisation des contenus par page

Pattern dominant:

1. **Barre de filtres/recherche** en haut.
2. **Barre d’actions** (ajout/export/réinitialiser).
3. **Visualisation** (KPI/cards/charts).
4. **Tableau détaillé** (lignes métiers).
5. **Interactions contextuelles** (drawer/modal).

Ce pattern est cohérent sur `flux`, `comptes`, `entreprises`, `rapprochement`, `reporting`.

## 3.4 Organisation par onglets

Onglets présents dans plusieurs zones:

- Prévision: graphique, tableau, flux, catégories.
- Paramétrage client: utilisateurs, groupes, modules, alertes/seuils, catégories.
- Paramétrage CBS: connexion EBICS, flux données, accès entreprises, paramètres globaux.
- Dossier entreprise: overview, flux, alertes, prévision, historique CBS.

Cela évite les changements de page excessifs et garde le contexte utilisateur.

## 4) Qualité perçue UX

## 4.1 Points forts

- Bonne lisibilité opérationnelle (KPI + tables + badges).
- Codification couleur claire pour statut/criticité.
- Parcours orienté action (recherche, validation, export).
- Feedback immédiat à chaque action importante.

## 4.2 Frictions actuelles

- Très forte densité fonctionnelle dans une seule page (`app/page.tsx`).
- Responsivité mobile non prioritaire (expérience surtout desktop).
- Variété de composants UI disponibles mais peu normalisés dans la page monolithique.

## 5) Recommandations UX

1. Créer un **design token set** centralisé (couleurs, espacements, rayons, typo) pour harmoniser encore davantage.
2. Découper l’UI en sous-pages/composants métier pour améliorer lisibilité et cohérence interactionnelle.
3. Introduire une hiérarchie “priorité d’alerte” plus explicite (SLA, tri par impact).
4. Standardiser les actions d’export (formats, nomenclature, confirmation post-export).
5. Ajouter des adaptations responsive pour les écrans plus étroits.

---

Document UX généré à partir de l’état actuel du code, principalement `app/page.tsx`.
