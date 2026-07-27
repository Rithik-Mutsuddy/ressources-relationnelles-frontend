import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../auth/token.service';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let tokenSvc: TokenService;
  let router: jasmine.SpyObj<Router>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    localStorage.clear();

    router = jasmine.createSpyObj('Router', ['navigate']);
    auth = jasmine.createSpyObj('AuthService', ['refresh', 'logout']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: auth },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    tokenSvc = TestBed.inject(TokenService);
  });

  afterEach(() => localStorage.clear());

  // ─── Cas nominal ─────────────────────────────────────────────

  it('laisse passer une réponse sans erreur', done => {
    http.get('/api/resources').subscribe(res => {
      expect(res).toEqual([{ id: 1 }]);
      done();
    });

    httpMock.expectOne('/api/resources').flush([{ id: 1 }]);
    httpMock.verify();
  });

  // ─── 401 : rafraîchissement du jeton ─────────────────────────

  describe('erreur 401 sur une route protégée', () => {
    it('déclenche un rafraîchissement du jeton', done => {
      auth.refresh.and.returnValue(of({ access_token: 'nouveau-jeton' }) as any);
      tokenSvc.setAccessToken('nouveau-jeton');

      http.get('/api/resources').subscribe({
        next: () => {
          expect(auth.refresh).toHaveBeenCalled();
          done();
        },
      });

      httpMock
        .expectOne('/api/resources')
        .flush({}, { status: 401, statusText: 'Unauthorized' });

      // La requête est rejouée avec le nouveau jeton
      const rejeu = httpMock.expectOne('/api/resources');
      expect(rejeu.request.headers.get('Authorization')).toBe('Bearer nouveau-jeton');
      rejeu.flush([{ id: 1 }]);
    });

    it('rejoue la requête initiale avec le jeton rafraîchi', done => {
      auth.refresh.and.returnValue(of({ access_token: 'jeton-frais' }) as any);
      tokenSvc.setAccessToken('jeton-frais');

      http.get('/api/profile').subscribe({
        next: res => {
          expect(res).toEqual({ id: 42 });
          done();
        },
      });

      httpMock
        .expectOne('/api/profile')
        .flush({}, { status: 401, statusText: 'Unauthorized' });

      const rejeu = httpMock.expectOne('/api/profile');
      expect(rejeu.request.headers.get('Authorization')).toBe('Bearer jeton-frais');
      rejeu.flush({ id: 42 });
    });

    it('déconnecte l’utilisateur si le rafraîchissement échoue', done => {
      auth.refresh.and.returnValue(
        throwError(() => new Error('refresh token expiré')) as any
      );

      http.get('/api/resources').subscribe({
        error: () => {
          expect(auth.logout).toHaveBeenCalled();
          done();
        },
      });

      httpMock
        .expectOne('/api/resources')
        .flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });

  // ─── 401 : routes d'authentification exclues ─────────────────

  describe('erreur 401 sur une route /auth/', () => {
    it('ne tente pas de rafraîchir sur un échec de connexion', done => {
      http.post('/api/auth/login', {}).subscribe({
        error: err => {
          expect(err.status).toBe(401);
          expect(auth.refresh).not.toHaveBeenCalled();
          done();
        },
      });

      httpMock
        .expectOne('/api/auth/login')
        .flush({ error: 'Identifiants invalides' }, { status: 401, statusText: 'Unauthorized' });

      httpMock.verify();
    });

    it('ne provoque pas de boucle infinie sur /auth/refresh', done => {
      http.post('/api/auth/refresh', {}).subscribe({
        error: () => {
          expect(auth.refresh).not.toHaveBeenCalled();
          done();
        },
      });

      httpMock
        .expectOne('/api/auth/refresh')
        .flush({}, { status: 401, statusText: 'Unauthorized' });

      httpMock.verify();
    });
  });

  // ─── 403 : accès refusé ──────────────────────────────────────

  describe('erreur 403', () => {
    it('redirige vers la page /forbidden', done => {
      http.get('/api/admin/users').subscribe({
        error: () => {
          expect(router.navigate).toHaveBeenCalledWith(['/forbidden']);
          done();
        },
      });

      httpMock
        .expectOne('/api/admin/users')
        .flush({ error: 'Accès refusé' }, { status: 403, statusText: 'Forbidden' });

      httpMock.verify();
    });

    it('ne tente aucun rafraîchissement de jeton', done => {
      http.get('/api/admin/users').subscribe({
        error: () => {
          expect(auth.refresh).not.toHaveBeenCalled();
          done();
        },
      });

      httpMock
        .expectOne('/api/admin/users')
        .flush({}, { status: 403, statusText: 'Forbidden' });

      httpMock.verify();
    });
  });

  // ─── Autres codes d'erreur ───────────────────────────────────

  describe('autres erreurs', () => {
    it('propage une erreur 404 sans traitement particulier', done => {
      http.get('/api/resources/9999').subscribe({
        error: err => {
          expect(err.status).toBe(404);
          expect(router.navigate).not.toHaveBeenCalled();
          expect(auth.refresh).not.toHaveBeenCalled();
          done();
        },
      });

      httpMock
        .expectOne('/api/resources/9999')
        .flush({}, { status: 404, statusText: 'Not Found' });

      httpMock.verify();
    });

    it('propage une erreur 429 (limitation de débit)', done => {
      http.post('/api/auth/login', {}).subscribe({
        error: err => {
          expect(err.status).toBe(429);
          done();
        },
      });

      httpMock
        .expectOne('/api/auth/login')
        .flush(
          { error: 'Trop de tentatives' },
          { status: 429, statusText: 'Too Many Requests' }
        );

      httpMock.verify();
    });

    it('propage une erreur 500 sans déconnecter l’utilisateur', done => {
      http.get('/api/resources').subscribe({
        error: err => {
          expect(err.status).toBe(500);
          expect(auth.logout).not.toHaveBeenCalled();
          done();
        },
      });

      httpMock
        .expectOne('/api/resources')
        .flush({}, { status: 500, statusText: 'Server Error' });

      httpMock.verify();
    });
  });
});
