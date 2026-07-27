import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ActivityService } from './activity.service';
import { environment } from '../../../environnement/environment';

describe('ActivityService', () => {
  let service: ActivityService;
  let httpMock: HttpTestingController;

  const API = `${environment.apiUrl}/activities`;

  const jeuDuMiroir = {
    id: 1,
    name: 'Le jeu du miroir',
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ActivityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('doit être créé avec un cache vide', () => {
    expect(service).toBeTruthy();
    expect(service.activities()).toEqual([]);
  });

  // ─── Lecture ─────────────────────────────────────────────────

  describe('getAll', () => {
    it('appelle GET /activities', () => {
      service.getAll().subscribe();
      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('GET');
      req.flush([jeuDuMiroir]);
    });

    it('alimente le signal de cache', () => {
      service.getAll().subscribe();
      httpMock.expectOne(API).flush([jeuDuMiroir]);

      expect(service.activities()).toEqual([jeuDuMiroir]);
    });

    it('remplace le cache à chaque appel', () => {
      service.getAll().subscribe();
      httpMock.expectOne(API).flush([jeuDuMiroir]);

      service.getAll().subscribe();
      httpMock.expectOne(API).flush([]);

      expect(service.activities()).toEqual([]);
    });

    it('propage une 401 si le citoyen n’est pas connecté', done => {
      service.getAll().subscribe({
        error: err => {
          expect(err.status).toBe(401);
          done();
        },
      });
      httpMock.expectOne(API).flush({}, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('getOne', () => {
    it('appelle GET /activities/:id', () => {
      service.getOne(1).subscribe();
      const req = httpMock.expectOne(`${API}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(jeuDuMiroir);
    });

    it('ne modifie pas le cache', () => {
      service.getOne(1).subscribe();
      httpMock.expectOne(`${API}/1`).flush(jeuDuMiroir);

      expect(service.activities()).toEqual([]);
    });
  });

  // ─── Actions ─────────────────────────────────────────────────

  describe('start', () => {
    it('appelle POST /activities/:id/start avec un corps vide', () => {
      service.start(1).subscribe();

      const req = httpMock.expectOne(`${API}/1/start`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({ message: 'Activité démarrée', activity: { id: 1, name: 'Le jeu du miroir' } });
    });

    it('retourne le message et l’activité démarrée', () => {
      service.start(1).subscribe(res => {
        expect(res.message).toBe('Activité démarrée');
        expect(res.activity.id).toBe(1);
      });

      httpMock
        .expectOne(`${API}/1/start`)
        .flush({ message: 'Activité démarrée', activity: { id: 1, name: 'Le jeu du miroir' } });
    });
  });

  describe('invite', () => {
    it('appelle POST /activities/:id/invite avec la liste des participants', () => {
      service.invite(1, [5, 8, 12]).subscribe();

      const req = httpMock.expectOne(`${API}/1/invite`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ user_ids: [5, 8, 12] });
      req.flush({ message: '3 participants invités' });
    });

    it('accepte une liste vide de participants', () => {
      service.invite(1, []).subscribe();

      const req = httpMock.expectOne(`${API}/1/invite`);
      expect(req.request.body).toEqual({ user_ids: [] });
      req.flush({ message: 'Aucun participant invité' });
    });

    it('propage une 404 pour une activité inexistante', done => {
      service.invite(999, [5]).subscribe({
        error: err => {
          expect(err.status).toBe(404);
          done();
        },
      });

      httpMock
        .expectOne(`${API}/999/invite`)
        .flush({}, { status: 404, statusText: 'Not Found' });
    });
  });
});
