<<<<<<< HEAD
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
=======
# 📱 Ressources Relationnelles - Frontend Angular

## 🎯 Vue d'ensemble

**Ressources Relationnelles** est une plateforme collaborative de gestion de ressources et de relations interpersonnelles. Le frontend Angular permet aux utilisateurs de :
- 🔐 S'authentifier via email/mot de passe **OU** via **FranceConnect**
- 👥 Consulter et gérer des ressources (articles, personnes, organisations)
- 💬 Interagir via un système de commentaires
- 🛡️ Accéder à des fonctionnalités selon leur rôle (utilisateur, modérateur, admin)

---


## 🛠️ Installation & Configuration

### Prérequis

- **Node.js** 18+ et npm 9+ (vérifie avec `node --version` et `npm --version`)
- **Angular CLI** 17+ (installe avec `npm install -g @angular/cli`)
- Un éditeur : **VS Code** (recommandé)

### Étapes d'installation

#### 1️⃣ Cloner et naviguer

```bash
git clone https://github.com/[ton-org]/rr-frontend.git
cd rr-frontend

# Ou si tu as déjà cloné et pull les changements:
git pull origin develop
```

#### 2️⃣ Installer les dépendances
>>>>>>> 4a9a77908ace294cf08be4be21741e9d88191ba7

```bash
npm install
```

<<<<<<< HEAD
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
=======
Cela télécharge tous les packages listés dans `package.json`.

#### 3️⃣ Configurer l'environnement

Crée un fichier `.env` à la racine du projet (ou dans `src/environments/`):

```env
# URL du backend Symfony
API_URL=http://localhost:8000/api

# Authentification FranceConnect
FRANCECONNECT_CLIENT_ID=your_client_id_here
FRANCECONNECT_REDIRECT_URI=http://localhost:4200/auth/callback

# Variables Angular
NG_APP_NAME=Ressources Relationnelles
NG_APP_ENV=development
```

**Important :** Ne commit jamais `.env` — ajoute-le à `.gitignore`

#### 4️⃣ Lancer le serveur de développement

```bash
npm start
# Ou : ng serve

# Le frontend sera disponible à : http://localhost:4200
```

#### 5️⃣ Ouvrir dans le navigateur

Va à **http://localhost:4200** → tu devrais voir la page de login.

---

## 📦 Dépendances Principales

| Package | Version | Usage |
|---------|---------|-------|
| `@angular/core` | ^17.0 | Framework Angular |
| `@angular/router` | ^17.0 | Routage (navigation entre pages) |
| `@angular/common/http` | ^17.0 | Requêtes HTTP vers backend |
| `tailwindcss` | ^3.0 | Styling CSS utilitaire |
| `typescript` | ^5.0 | Langage surensemble de JavaScript |
| `jwt-decode` | ^4.0 | Décode les tokens JWT |
| `@popular/oauth2-client` | ^1.0 | Gestion OAuth2 (optionnel pour FranceConnect) |

Pour ajouter une dépendance :
```bash
npm install [package-name]
# Exemple: npm install axios lodash
```

Pour la dev uniquement :
```bash
npm install --save-dev [package-name]
# Exemple: npm install --save-dev @types/jest
```

---

## 🔐 Authentification

### Flux d'authentification

#### Option 1 : Email + Mot de passe

```
1. Utilisateur saisit email + password
2. Frontend POST /api/login → Backend
3. Backend valide + retourne JWT token
4. Frontend stocke token en localStorage
5. Frontend attach token à chaque requête HTTP
6. Utilisateur accède à l'app
```

#### Option 2 : FranceConnect

```
1. Utilisateur clique "Se connecter avec FranceConnect"
2. Frontend redirige vers FranceConnect (OAuth2)
3. Utilisateur s'authentifie sur FranceConnect
4. FranceConnect redirige vers /auth/callback avec code
5. Frontend échange code contre JWT token
6. Frontend stocke token + redirige vers dashboard
```

### Services d'authentification

**`src/app/core/services/auth.service.ts`**

```typescript
export class AuthService {
  // Vérifie si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  // Récupère le token JWT stocké
  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  // Login avec email + password
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email, password
    });
  }

  // FranceConnect login
  loginWithFranceConnect(): void {
    window.location.href = `${this.apiUrl}/auth/franceconnect/redirect`;
  }

  // Logout (supprime le token)
  logout(): void {
    localStorage.removeItem('jwt_token');
    this.router.navigate(['/login']);
  }
}
```

### JWT Interceptor

**`src/app/core/interceptors/jwt.interceptor.ts`**

Attach le JWT token à **chaque requête HTTP** automatiquement :

```typescript
export class JwtInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      // Clone la requête et ajoute l'Authorization header
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(req);
  }
}
```

**Résultat :** Chaque requête inclut automatiquement `Authorization: Bearer eyJ...`

---


## 📞 Variables d'Environnement

### Dev

```env
API_URL=http://localhost:8000/api
ENVIRONMENT=development
LOG_LEVEL=debug
```

### Production

```env
API_URL=https://api.ressources-relationnelles.fr/api
ENVIRONMENT=production
LOG_LEVEL=error
```

Accès dans le code :

```typescript
import { environment } from '@env/environment';

console.log(environment.apiUrl); // http://localhost:8000/api
```

---

## 🎯 Checklist pour une nouvelle feature

- [ ] Créer une branche `feature/XXX-nom`
- [ ] Créer le composant (`ng generate component`)
- [ ] Ajouter la route dans `app.routes.ts`
- [ ] Créer les services HTTP si nécessaire
- [ ] Écrire les tests unitaires
- [ ] Vérifier le lint (`npm run lint`)
- [ ] Vérifier que les tests passent (`npm test`)
- [ ] Commit avec message conventionnel
- [ ] Push et ouvrir une PR

---

## 🔗 Ressources Utiles

| Ressource | Lien |
|-----------|------|
| Documentation Angular | https://angular.io/docs |
| Tailwind CSS | https://tailwindcss.com/docs |
| TypeScript | https://www.typescriptlang.org/docs/ |
| RxJS (Observables) | https://rxjs.dev/guide/overview |
| Angular Router | https://angular.io/guide/routing-overview |
| JWT | https://jwt.io/introduction |
| FranceConnect | https://franceconnect.gouv.fr/ |

---

## ❓ FAQ

### Q: Mon application ne se compile pas ?
**R:** Exécute `npm install` pour vérifier que toutes les dépendances sont installées. Vérifie aussi les erreurs TypeScript avec `ng build`.

### Q: Comment ajouter une dépendance ?
**R:** `npm install [package-name]` puis importe-la dans ton code.

### Q: Comment changer le port (4200) ?
**R:** `ng serve --port 3000` pour utiliser le port 3000.

### Q: Comment tester l'authentification localement ?
**R:** Le backend doit tourner sur `localhost:8000`. Assure-toi que `API_URL=http://localhost:8000/api` dans `.env`.

### Q: Où stocker le JWT token ?
**R:** En `localStorage` (simple mais moins sécurisé) ou en `httpOnly cookie` (plus sécurisé, recommandé).

---

## 👥 Support & Contact

- **Issues** : Crée une issue sur GitHub
- **Slack** : Canal `#ressources-relationnelles-dev`
- **Email** : contact@ressources-relationnelles.fr

---

## 📝 Licence

MIT License - Voir `LICENSE.md`

---

**Dernière mise à jour :** Avril 2026 | **Maintainers :** Rithik, Ricardo, Dogukan, Yanis
>>>>>>> 4a9a77908ace294cf08be4be21741e9d88191ba7
