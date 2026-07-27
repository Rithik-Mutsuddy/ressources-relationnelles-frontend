import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { AuthResponse, User } from '../models/user.model';
import { environment } from '../../../environnement/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenSvc: TokenService;
  let router: jasmine.SpyObj<Router>;

  const API = `${environment.apiUrl}/auth`;

  const mockUser: User = {
    id: 42,
    email: 'citoyen@example.fr',
    firstname: 'Marie',
    lastname: 'Dupont',
    roles: ['ROLE_USER'],
    authProvider: 'local',
    verified: true,
    isVerified: true,
    createdAt: '2026-01-15T10:00:00+00:00',
  };

  const mockAuthResponse: AuthResponse = {
    access_token: 'access-jwt',
    refresh_token: 'refresh-jwt',
    user: mockUser,
  };

  beforeEach(() => {
    localStorage.clear();
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenSvc = TestBed.inject(TokenService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('doit être créé', () => {
    expect(service).toBeTruthy();
  });

  // ─── État initial ────────────────────────────────────────────

  describe('état initial', () => {
    it('currentUser est null quand aucune session n’existe', () => {
      expect(service.currentUser()).toBeNull();
    });

    it('isAuthenticated est faux sans utilisateur', () => {
      expect(service.isAuthenticated()).toBeFalse();
    });
  });

  // ─── register() ──────────────────────────────────────────────

  describe('register', () => {
    it('envoie un POST vers /auth/register avec les données du formulaire', () => {
      const payload = {
        email: 'nouveau@example.fr',
        password: 'MotDePasse1',
        firstname: 'Paul',
        lastname: 'Martin',
      };

      service.register(payload).subscribe();

      const req = httpMock.expectOne(`${API}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ message: 'Compte créé' });
    });

    it('ne crée pas de session tant que l’utilisateur ne se connecte pas', () => {
      service
        .register({
          email: 'a@b.fr',
          password: 'MotDePasse1',
          firstname: 'A',
          lastname: 'B',
        })
        .subscribe();

      httpMock.expectOne(`${API}/register`).flush({ message: 'ok' });
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('propage une erreur 400 en cas d’e-mail déjà utilisé', done => {
      service
        .register({
          email: 'existe@example.fr',
          password: 'MotDePasse1',
          firstname: 'A',
          lastname: 'B',
        })
        .subscribe({
          error: err => {
            expect(err.status).toBe(400);
            done();
          },
        });

      httpMock
        .expectOne(`${API}/register`)
        .flush({ error: 'Email déjà utilisé' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  // ─── login() ─────────────────────────────────────────────────

  describe('login', () => {
    it('envoie les identifiants en POST vers /auth/login', () => {
      service.login('citoyen@example.fr', 'MotDePasse1').subscribe();

      const req = httpMock.expectOne(`${API}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        email: 'citoyen@example.fr',
        password: 'MotDePasse1',
      });
      req.flush(mockAuthResponse);
    });

    it('stocke les jetons et l’utilisateur après une connexion réussie', () => {
      service.login('citoyen@example.fr', 'MotDePasse1').subscribe();
      httpMock.expectOne(`${API}/login`).flush(mockAuthResponse);

      expect(tokenSvc.getAccessToken()).toBe('access-jwt');
      expect(tokenSvc.getRefreshToken()).toBe('refresh-jwt');
      expect(tokenSvc.getStoredUser()).toEqual(mockUser);
    });

    it('met à jour le signal currentUser', () => {
      service.login('citoyen@example.fr', 'MotDePasse1').subscribe();
      httpMock.expectOne(`${API}/login`).flush(mockAuthResponse);

      expect(service.currentUser()).toEqual(mockUser);
      expect(service.isAuthenticated()).toBeTrue();
    });

    it('ne crée aucune session si les identifiants sont invalides', done => {
      service.login('citoyen@example.fr', 'mauvais').subscribe({
        error: err => {
          expect(err.status).toBe(401);
          expect(service.currentUser()).toBeNull();
          expect(tokenSvc.getAccessToken()).toBeNull();
          done();
        },
      });

      httpMock
        .expectOne(`${API}/login`)
        .flush({ error: 'Identifiants invalides' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ─── refresh() ───────────────────────────────────────────────

  describe('refresh', () => {
    it('envoie le jeton de rafraîchissement stocké', () => {
      tokenSvc.setTokens('vieux-access', 'refresh-jwt');

      service.refresh().subscribe();

      const req = httpMock.expectOne(`${API}/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refresh_token: 'refresh-jwt' });
      req.flush({ access_token: 'nouveau-access' });
    });

    it('remplace uniquement le jeton d’accès', () => {
      tokenSvc.setTokens('vieux-access', 'refresh-jwt');

      service.refresh().subscribe();
      httpMock.expectOne(`${API}/refresh`).flush({ access_token: 'nouveau-access' });

      expect(tokenSvc.getAccessToken()).toBe('nouveau-access');
      expect(tokenSvc.getRefreshToken()).toBe('refresh-jwt');
    });

    it('envoie null si aucun jeton de rafraîchissement n’existe', () => {
      service.refresh().subscribe({ error: () => {} });

      const req = httpMock.expectOne(`${API}/refresh`);
      expect(req.request.body).toEqual({ refresh_token: null });
      req.flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ─── logout() ────────────────────────────────────────────────

  describe('logout', () => {
    beforeEach(() => {
      service.login('citoyen@example.fr', 'MotDePasse1').subscribe();
      httpMock.expectOne(`${API}/login`).flush(mockAuthResponse);
    });

    it('notifie le serveur pour révoquer le jeton de rafraîchissement', () => {
      service.logout();

      const req = httpMock.expectOne(`${API}/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refresh_token: 'refresh-jwt' });
      req.flush({});
    });

    it('purge le stockage local', () => {
      service.logout();
      httpMock.expectOne(`${API}/logout`).flush({});

      expect(tokenSvc.getAccessToken()).toBeNull();
      expect(tokenSvc.getRefreshToken()).toBeNull();
      expect(tokenSvc.getStoredUser()).toBeNull();
    });

    it('réinitialise le signal currentUser', () => {
      service.logout();
      httpMock.expectOne(`${API}/logout`).flush({});

      expect(service.currentUser()).toBeNull();
      expect(service.isAuthenticated()).toBeFalse();
    });

    it('redirige vers la page d’accueil', () => {
      service.logout();
      httpMock.expectOne(`${API}/logout`).flush({});

      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('purge la session même si l’appel serveur échoue', () => {
      service.logout();
      httpMock
        .expectOne(`${API}/logout`)
        .flush({}, { status: 500, statusText: 'Server Error' });

      expect(service.currentUser()).toBeNull();
    });
  });

  // ─── Gestion des rôles ───────────────────────────────────────

  describe('hasRole et computed de rôles', () => {
    const loginAs = (roles: User['roles']) => {
      service.login('x@y.fr', 'MotDePasse1').subscribe();
      httpMock
        .expectOne(`${API}/login`)
        .flush({ ...mockAuthResponse, user: { ...mockUser, roles } });
    };

    it('retourne faux pour tout rôle si non connecté', () => {
      expect(service.hasRole('ROLE_ADMIN')).toBeFalse();
      expect(service.isAdmin()).toBeFalse();
      expect(service.isModerator()).toBeFalse();
      expect(service.isSuperAdmin()).toBeFalse();
    });

    it('identifie un citoyen simple', () => {
      loginAs(['ROLE_USER']);
      expect(service.hasRole('ROLE_USER')).toBeTrue();
      expect(service.isAdmin()).toBeFalse();
      expect(service.isModerator()).toBeFalse();
    });

    it('identifie un modérateur', () => {
      loginAs(['ROLE_USER', 'ROLE_MODERATOR']);
      expect(service.isModerator()).toBeTrue();
      expect(service.isAdmin()).toBeFalse();
    });

    it('identifie un administrateur', () => {
      loginAs(['ROLE_USER', 'ROLE_ADMIN']);
      expect(service.isAdmin()).toBeTrue();
      expect(service.isSuperAdmin()).toBeFalse();
    });

    it('identifie un super-administrateur', () => {
      loginAs(['ROLE_USER', 'ROLE_SUPER_ADMIN']);
      expect(service.isSuperAdmin()).toBeTrue();
    });
  });

  // ─── FranceConnect ───────────────────────────────────────────

  describe('FranceConnect', () => {
    it('getFranceConnectUrl appelle GET /auth/france-connect', () => {
      service.getFranceConnectUrl().subscribe(res => {
        expect(res.url).toContain('franceconnect');
      });

      const req = httpMock.expectOne(`${API}/france-connect`);
      expect(req.request.method).toBe('GET');
      req.flush({ url: 'https://franceconnect.gouv.fr/auth', state: 's', nonce: 'n' });
    });

    it('handleFranceConnectCallback transmet le state original en en-tête', () => {
      service.handleFranceConnectCallback('code-123', 'state-abc', 'state-abc').subscribe();

      const req = httpMock.expectOne(
        `${API}/france-connect/callback?code=code-123&state=state-abc`
      );
      expect(req.request.headers.get('X-FC-State')).toBe('state-abc');
      req.flush(mockAuthResponse);
    });

    it('handleFranceConnectCallback ouvre la session applicative', () => {
      service.handleFranceConnectCallback('c', 's', 's').subscribe();
      httpMock
        .expectOne(`${API}/france-connect/callback?code=c&state=s`)
        .flush(mockAuthResponse);

      expect(service.isAuthenticated()).toBeTrue();
      expect(tokenSvc.getAccessToken()).toBe('access-jwt');
    });

    it('getFranceConnectLogoutUrl envoie le id_token FranceConnect', () => {
      service.getFranceConnectLogoutUrl('fc-id-token').subscribe();

      const req = httpMock.expectOne(`${API}/france-connect/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ fc_id_token: 'fc-id-token' });
      req.flush({ url: 'https://franceconnect.gouv.fr/logout' });
    });
  });
});
