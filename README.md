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

```bash
npm install
```

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