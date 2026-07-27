import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { FranceConnectService } from './france-connect.service';
import { TokenService } from './token.service';
import { AuthResponse, User } from '../models/user.model';
import { environment } from '../../../environnement/environment';

describe('FranceConnectService', () => {
  let service: FranceConnectService;
  let httpMock: HttpTestingController;
  let tokenSvc: TokenService;
  let router: jasmine.SpyObj<Router>;

  const API = `${environment.apiUrl}/auth/france-connect`;

  const fcUser: User = {
    id: 7,
    email: 'verifie@franceconnect.fr',
    firstname: 'Jean',
    lastname: 'Citoyen',
    roles: ['ROLE_USER'],
    authProvider: 'france_connect',
    verified: true,
    isVerified: true,
    createdAt: '2026-02-01T09:00:00+00:00',
  };

  const fcResponse: AuthResponse = {
    access_token: 'fc-access',
    refresh_token: 'fc-refresh',
    user: fcUser,
    fc_id_token: 'fc-id-token-xyz',
  };

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(FranceConnectService);
    httpMock = TestBed.inject(HttpTestingController);
    tokenSvc = TestBed.inject(TokenService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('doit être créé', () => {
    expect(service).toBeTruthy();
  });

  // ─── Étape 1 : initiation ────────────────────────────────────

  describe('initiateLogin', () => {
    it('stocke le state anti-CSRF et le nonce en sessionStorage', () => {
      // On neutralise la redirection réelle du navigateur
      spyOnProperty(window, 'location', 'get').and.returnValue({
        href: '',
      } as unknown as Location);

      service.initiateLogin();

      httpMock.expectOne(API).flush({
        url: 'https://franceconnect.gouv.fr/api/v1/authorize',
        state: 'state-secure-123',
        nonce: 'nonce-456',
      });

      expect(sessionStorage.getItem('fc_state')).toBe('state-secure-123');
      expect(sessionStorage.getItem('fc_nonce')).toBe('nonce-456');
    });

    it('ne stocke rien si l’appel au backend échoue', () => {
      spyOn(console, 'error');

      service.initiateLogin();
      httpMock.expectOne(API).flush({}, { status: 503, statusText: 'Unavailable' });

      expect(sessionStorage.getItem('fc_state')).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  // ─── Étape 2 : callback ──────────────────────────────────────

  describe('handleCallback', () => {
    beforeEach(() => sessionStorage.setItem('fc_state', 'state-attendu'));

    it('transmet le state attendu dans l’en-tête X-FC-State', () => {
      service.handleCallback('code-abc', 'state-attendu').subscribe();

      const req = httpMock.expectOne(
        `${API}/callback?code=code-abc&state=state-attendu`
      );
      expect(req.request.headers.get('X-FC-State')).toBe('state-attendu');
      req.flush(fcResponse);
    });

    it('encode les paramètres de l’URL', () => {
      service.handleCallback('code avec espace', 'state&special').subscribe();

      const req = httpMock.expectOne(
        `${API}/callback?code=code%20avec%20espace&state=state%26special`
      );
      req.flush(fcResponse);
    });

    it('purge le state et le nonce immédiatement (usage unique)', () => {
      sessionStorage.setItem('fc_nonce', 'nonce-456');

      service.handleCallback('c', 'state-attendu').subscribe();

      expect(sessionStorage.getItem('fc_state')).toBeNull();
      expect(sessionStorage.getItem('fc_nonce')).toBeNull();

      httpMock.expectOne(`${API}/callback?code=c&state=state-attendu`).flush(fcResponse);
    });

    it('stocke les jetons applicatifs après authentification', () => {
      service.handleCallback('c', 'state-attendu').subscribe();
      httpMock.expectOne(`${API}/callback?code=c&state=state-attendu`).flush(fcResponse);

      expect(tokenSvc.getAccessToken()).toBe('fc-access');
      expect(tokenSvc.getRefreshToken()).toBe('fc-refresh');
      expect(tokenSvc.getStoredUser()).toEqual(fcUser);
    });

    it('conserve le fc_id_token pour la déconnexion OIDC', () => {
      service.handleCallback('c', 'state-attendu').subscribe();
      httpMock.expectOne(`${API}/callback?code=c&state=state-attendu`).flush(fcResponse);

      expect(sessionStorage.getItem('fc_id_token')).toBe('fc-id-token-xyz');
    });

    it('ne stocke pas de fc_id_token si le backend n’en renvoie pas', () => {
      const sansIdToken = { ...fcResponse };
      delete sansIdToken.fc_id_token;

      service.handleCallback('c', 'state-attendu').subscribe();
      httpMock.expectOne(`${API}/callback?code=c&state=state-attendu`).flush(sansIdToken);

      expect(sessionStorage.getItem('fc_id_token')).toBeNull();
    });

    it('envoie une chaîne vide si aucun state n’est en session (tentative CSRF)', () => {
      sessionStorage.removeItem('fc_state');

      service.handleCallback('c', 'state-forge').subscribe({ error: () => {} });

      const req = httpMock.expectOne(`${API}/callback?code=c&state=state-forge`);
      expect(req.request.headers.get('X-FC-State')).toBe('');
      req.flush({ error: 'State invalide' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ─── Étape 3 : déconnexion ───────────────────────────────────

  describe('logout', () => {
    it('navigue vers l’accueil sans appel réseau si aucune session FC', () => {
      service.logout();

      httpMock.expectNone(`${API}/logout`);
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('demande l’URL de déconnexion officielle si une session FC existe', () => {
      sessionStorage.setItem('fc_id_token', 'fc-id-token-xyz');
      spyOnProperty(window, 'location', 'get').and.returnValue({
        href: '',
      } as unknown as Location);

      service.logout();

      const req = httpMock.expectOne(`${API}/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ fc_id_token: 'fc-id-token-xyz' });
      req.flush({ url: 'https://franceconnect.gouv.fr/logout' });

      expect(sessionStorage.getItem('fc_id_token')).toBeNull();
    });

    it('déconnecte localement si l’appel de déconnexion FC échoue', () => {
      sessionStorage.setItem('fc_id_token', 'fc-id-token-xyz');

      service.logout();
      httpMock
        .expectOne(`${API}/logout`)
        .flush({}, { status: 500, statusText: 'Server Error' });

      expect(sessionStorage.getItem('fc_id_token')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  // ─── Helpers ─────────────────────────────────────────────────

  describe('isFranceConnectUser', () => {
    it('retourne faux si aucun utilisateur n’est stocké', () => {
      expect(service.isFranceConnectUser()).toBeFalse();
    });

    it('retourne vrai pour un utilisateur FranceConnect', () => {
      tokenSvc.setStoredUser(fcUser);
      expect(service.isFranceConnectUser()).toBeTrue();
    });

    it('retourne faux pour un compte local', () => {
      tokenSvc.setStoredUser({ ...fcUser, authProvider: 'local' });
      expect(service.isFranceConnectUser()).toBeFalse();
    });
  });

  describe('getFcIdToken', () => {
    it('retourne null si absent', () => {
      expect(service.getFcIdToken()).toBeNull();
    });

    it('retourne le jeton stocké', () => {
      sessionStorage.setItem('fc_id_token', 'abc');
      expect(service.getFcIdToken()).toBe('abc');
    });
  });
});
