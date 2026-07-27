import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { InteractionService } from './interaction.service';
import { InteractionType } from '../models/interaction.model';
import { environment } from '../../../environnement/environment';

describe('InteractionService', () => {
  let service: InteractionService;
  let httpMock: HttpTestingController;

  const API = `${environment.apiUrl}/resources`;
  const API_MOD = `${environment.apiUrl}/moderator`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InteractionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('doit être créé', () => {
    expect(service).toBeTruthy();
  });

  // ─── Lecture ─────────────────────────────────────────────────

  describe('getByResource', () => {
    it('appelle GET /resources/:id/interactions', () => {
      service.getByResource(5).subscribe();

      const req = httpMock.expectOne(`${API}/5/interactions`);
      expect(req.request.method).toBe('GET');
      req.flush([{ id: 1, type: 'favorite', createdAt: '2026-01-01T00:00:00+00:00' }]);
    });
  });

  describe('listes de progression du citoyen', () => {
    it('getFavorites appelle GET /resources/favorites', () => {
      service.getFavorites().subscribe();
      const req = httpMock.expectOne(`${API}/favorites`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('getAsides appelle GET /resources/favorites/aside', () => {
      service.getAsides().subscribe();
      const req = httpMock.expectOne(`${API}/favorites/aside`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('getPending appelle GET /resources/pending', () => {
      service.getPending().subscribe();
      const req = httpMock.expectOne(`${API}/pending`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('getDraft appelle GET /resources/draft', () => {
      service.getDraft().subscribe();
      const req = httpMock.expectOne(`${API}/draft`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('getPendingAll', () => {
    it('appelle la route modérateur GET /moderator/pendingAll', () => {
      service.getPendingAll().subscribe();

      const req = httpMock.expectOne(`${API_MOD}/pendingAll`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('propage une 403 si l’utilisateur n’est pas modérateur', done => {
      service.getPendingAll().subscribe({
        error: err => {
          expect(err.status).toBe(403);
          done();
        },
      });

      httpMock
        .expectOne(`${API_MOD}/pendingAll`)
        .flush({}, { status: 403, statusText: 'Forbidden' });
    });
  });

  // ─── Écriture ────────────────────────────────────────────────

  describe('interact', () => {
    const types: InteractionType[] = ['favorite', 'progress', 'aside', 'share'];

    types.forEach(type => {
      it(`envoie le type « ${type} » en POST`, () => {
        service.interact(7, type).subscribe();

        const req = httpMock.expectOne(`${API}/7/interactions`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ type });
        req.flush({ id: 1, type, createdAt: '2026-01-01T00:00:00+00:00' });
      });
    });

    it('propage une 401 si le citoyen n’est pas connecté', done => {
      service.interact(7, 'favorite').subscribe({
        error: err => {
          expect(err.status).toBe(401);
          done();
        },
      });

      httpMock
        .expectOne(`${API}/7/interactions`)
        .flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('remove', () => {
    it('appelle DELETE /resources/:id/interactions/:type', () => {
      service.remove(7, 'favorite').subscribe();

      const req = httpMock.expectOne(`${API}/7/interactions/favorite`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('gère le retrait d’une mise de côté', () => {
      service.remove(7, 'aside').subscribe();

      const req = httpMock.expectOne(`${API}/7/interactions/aside`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
