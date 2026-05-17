# Ressources Relationnelles Frontend

## Description

Frontend Angular 20 de la plateforme « Ressources Relationnelles ». Cette application SPA gère l’accès et l’affichage des ressources en fonction des rôles utilisateur : public, citoyen authentifié, modérateur, administrateur, et super-administrateur.

Le projet utilise des composants standalone, un router Angular moderne, des guards de sécurité, des intercepteurs HTTP et un service d’authentification avec JWT + refresh.

## Table des matières

- [Fonctionnalités principales](#fonctionnalit%C3%A9s-principales)
- [Architecture et structure](#architecture-et-structure)
- [Flux de navigation](#flux-de-navigation)
- [Authentification et sécurité](#authentification-et-s%C3%A9curit%C3%A9)
- [Configuration et environnement](#configuration-et-environnement)
- [Installation et exécution](#installation-et-ex%C3%A9cution)
- [Tests](#tests)
- [Remarques](#remarques)

## Fonctionnalités principales

- Pages publiques : accueil, catalogue de ressources, détails de ressource.
- Authentification via email/mot de passe et FranceConnect.
- Stockage du JWT en localStorage, suivi de l’utilisateur courant.
- Rafraîchissement automatique des tokens en cas d’erreur 401.
- Gestion du contenu en fonction des rôles : citoyen, modérateur, admin, super-admin.
- Interface réactive avec Bootstrap 5 et SCSS.
- Chargement dynamique des routes et composants avec le router Angular.

## Architecture et structure

### Arborescence principale

- `src/app/`
  - `core/`
    - `auth/` : `AuthService`, `TokenService`, `FranceConnect`, modèles utilisateur.
    - `guards/` : `authGuard`, `moderatorGuard`, `adminGuard`, `superAdminGuard`, `guestGuard`.
    - `interceptors/` : `jwtInterceptor`, `errorInterceptor`.
    - `models/` : définition des objets `User`, `Resource`, `Category`, `Comment`, etc.
  - `features/` : modules fonctionnels par périmètre.
  - `shared/` : composants réutilisables, directives (`has-role`, `click-outside`), pipes.
- `src/environnement/` : configuration API et environnement.
- `src/public/` : assets statiques inclus dans le build.
- `src/styles.scss` : styles globaux.
- `src/main.ts` : bootstrap de l’application.

### Composants et modules clés

- `App` : wrapper principal avec `NavbarComponent` et `FooterComponent`.
- `RouterOutlet` : injection de vues selon les routes.
- `Navbar`, `Footer`, `Loader`, `Pagination`, `ResourceCard` pour l’UI partagée.

## Flux de navigation

La configuration de routage est dans `src/app/app.routes.ts`.

### Routes publiques

- `/home` : page d’accueil publique.
- `/resources` : liste des ressources publiques.
- `/resources/:id` : détail d’une ressource.

### Authentification

- `/auth/login` : page de connexion.
- `/auth/register` : page d’inscription.
- `/auth/france-connect/callback` : callback FranceConnect.

### Citoyen (`/citizen`)

Protégé par `authGuard`.

Routes principales :
- `/citizen/dashboard` : tableau de bord citoyen.
- `/citizen/my-resources` : ressources publiées par le citoyen.
- `/citizen/resources/create` : création de ressource.
- `/citizen/favorites` : favoris.
- `/citizen/profile` : gestion du profil.

> Les routes `activities` et `progress` sont présentes en commentaire dans le code, prêtes à être activées.

### Modérateur (`/moderator`)

Protégé par `moderatorGuard`.

Routes principales :
- `/moderator/pending` : ressources en attente de validation.
- `/moderator/comments` : commentaires signalés.

### Administrateur (`/admin`)

Protégé par `adminGuard`.

Routes principales :
- `/admin/resources` : gestion des ressources.
- `/admin/categories` : gestion des catégories.
- `/admin/users` : gestion des utilisateurs.
- `/admin/statistics` : statistiques de l’application.

### Super-administrateur (`/superadmin`)

Protégé par `superAdminGuard`.

Routes principales :
- `/superadmin/resources` : gestion globale des ressources.
- `/superadmin/categories` : gestion globale des catégories.
- `/superadmin/users` : gestion globale des utilisateurs.
- `/superadmin/statistics` : statistiques globales.
- `/superadmin/accounts` : liste des comptes.
- `/superadmin/accounts/create` : création de compte.

## Authentification et sécurité

### AuthService

- Gestion de l’état utilisateur avec `signal`.
- Fonctions de connexion, inscription, refresh, logout.
- Intégration de FranceConnect via `getFranceConnectUrl()` et `handleFranceConnectCallback()`.
- Stockage des tokens et de l’utilisateur courant.

### TokenService

Stocke et récupère en `localStorage` :

- `access_token`
- `refresh_token`
- `current_user`

### Intercepteurs HTTP

- `jwtInterceptor` : ajoute `Authorization: Bearer <token>`.
- `errorInterceptor` : gère les 401 et 403.
  - 401 : tente un refresh de token avant de rejouer la requête.
  - 403 : redirection vers `/forbidden`.

### Guards de route

- `authGuard` : accès utilisateur connecté.
- `guestGuard` : empêche l’accès si déjà connecté.
- `moderatorGuard` : autorisation pour `ROLE_MODERATOR`, `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`.
- `adminGuard` : autorisation pour `ROLE_ADMIN`, `ROLE_SUPER_ADMIN`.
- `superAdminGuard` : autorisation pour `ROLE_SUPER_ADMIN`.

## Configuration et environnement

Les environnements sont définis dans :

- `src/environnement/environment.ts`
- `src/environnement/environment.prod.ts`

La variable clé est `apiUrl` pour pointer vers le backend API.

### Valeurs connues

- `src/environnement/environment.ts`
  - `apiUrl: 'https://ressource-relationnelle.kesug.com/api'`
- `src/environnement/environment.prod.ts`
  - `apiUrl: 'https://votre-api.fr/api'`

## Installation et exécution

### Prérequis

- Node.js 20+
- npm 10+

### Installation

```bash
npm install
```

### Démarrer en local

```bash
npm start
```

### Build production

```bash
npm run build -- --configuration=production
```

### Build avec sous-dossier

```bash
ng build --configuration=production --base-href="/app/"
```

### Build développement

```bash
npm run watch
```

## Tests

```bash
npm test
```

Le projet utilise Karma et Jasmine pour les tests unitaires.

## Notes importantes

- Application basée sur Angular standalone components.
- Routes lazy-loaded pour optimiser les performances.
- Bootstrap 5 est intégré via `angular.json`.
- Le dossier `public/` sert de source pour les assets statiques.

## Améliorations possibles

- Ajouter une page `/forbidden` explicite.
- Activer les routes `activities` et `progress` du module citoyen.
- Ajouter l’internationalisation (`i18n`).
- Ajouter un système de notifications front.

## Licence

Projet privé (`private: true` dans `package.json`).
