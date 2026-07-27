import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ResourceService } from './resource.service';
import { Resource } from '../models/resource.model';
import { environment } from '../../../environnement/environment';

describe('ResourceService', () => {
  let service: ResourceService;
  let httpMock: HttpTestingController;

  const API = `${environment.apiUrl}/resources`;

  const mockResource: Resource = {
    id: 1,
    title: 'Renforcer le lien parent-enfant',
    content: 'Contenu de la ressource',
    type: 'article',
    status: 'published',
    visibility: 'public',
    createdAt: '2026-03-01T10:00:00+00:00',
    author: { id: 5, firstname: 'Marie', lastname: 'Dupont' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ResourceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('doit être créé', () => {
    expect(service).toBeTruthy();
  });

  // ─── Lecture ─────────────────────────────────────────────────

  describe('getAll', () => {
    it('appelle GET /resources sans paramètre quand aucun filtre n’est fourni', () => {
      service.getAll().subscribe(list => expect(list.length).toBe(1));

      const req = httpMock.expectOne(r => r.url === API);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush([mockResource]);
    });

    it('transmet le filtre de type', () => {
      service.getAll({ type: 'video' }).subscribe();

      const req = httpMock.expectOne(r => r.url === API);
      expect(req.request.params.get('type')).toBe('video');
      req.flush([]);
    });

    it('transmet le filtre de catégorie', () => {
      service.getAll({ categoryId: 3 }).subscribe();

      const req = httpMock.expectOne(r => r.url === API);
      expect(req.request.params.get('categoryId')).toBe('3');
      req.flush([]);
    });

    it('transmet le terme de recherche', () => {
      service.getAll({ search: 'communication' }).subscribe();

      const req = httpMock.expectOne(r => r.url === API);
      expect(req.request.params.get('search')).toBe('communication');
      req.flush([]);
    });

    it('combine plusieurs filtres simultanément', () => {
      service.getAll({ type: 'guide', categoryId: 2, search: 'couple' }).subscribe();

      const req = httpMock.expectOne(r => r.url === API);
      expect(req.request.params.get('type')).toBe('guide');
      expect(req.request.params.get('categoryId')).toBe('2');
      expect(req.request.params.get('search')).toBe('couple');
      req.flush([]);
    });

    it('ignore les filtres non renseignés', () => {
      service.getAll({ type: 'article', search: undefined }).subscribe();

      const req = httpMock.expectOne(r => r.url === API);
      expect(req.request.params.has('search')).toBeFalse();
      req.flush([]);
    });

    it('retourne une liste vide sans erreur', () => {
      service.getAll().subscribe(list => expect(list).toEqual([]));
      httpMock.expectOne(r => r.url === API).flush([]);
    });
  });

  describe('getOne', () => {
    it('appelle GET /resources/:id', () => {
      service.getOne(1).subscribe(res => expect(res.id).toBe(1));

      const req = httpMock.expectOne(`${API}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResource);
    });

    it('propage une 404 pour une ressource inexistante', done => {
      service.getOne(9999).subscribe({
        error: err => {
          expect(err.status).toBe(404);
          done();
        },
      });

      httpMock.expectOne(`${API}/9999`).flush({}, { status: 404, statusText: 'Not Found' });
    });
  });

  // ─── Écriture ────────────────────────────────────────────────

  describe('create', () => {
    it('appelle POST /resources avec les données', () => {
      const data = { title: 'Nouvelle ressource', content: 'Texte', type: 'article' as const };

      service.create(data).subscribe();

      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(data);
      req.flush(mockResource);
    });

    it('propage une 403 si le citoyen n’est pas autorisé', done => {
      service.create({ title: 'X' }).subscribe({
        error: err => {
          expect(err.status).toBe(403);
          done();
        },
      });

      httpMock.expectOne(API).flush({}, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('update', () => {
    it('appelle PUT /resources/:id', () => {
      service.update(1, { title: 'Titre corrigé' }).subscribe();

      const req = httpMock.expectOne(`${API}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ title: 'Titre corrigé' });
      req.flush(mockResource);
    });

    it('accepte une mise à jour partielle', () => {
      service.update(1, { visibility: 'private' }).subscribe();

      const req = httpMock.expectOne(`${API}/1`);
      expect(req.request.body).toEqual({ visibility: 'private' });
      req.flush(mockResource);
    });
  });

  describe('delete', () => {
    it('appelle DELETE /resources/:id', () => {
      service.delete(1).subscribe();

      const req = httpMock.expectOne(`${API}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  // ─── Modération ──────────────────────────────────────────────

  describe('validateResource', () => {
    it('appelle POST /resources/:id/validate avec un corps vide', () => {
      service.validateResource(12).subscribe();

      const req = httpMock.expectOne(`${API}/12/validate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({ message: 'Ressource publiée' });
    });

    it('propage une 403 si l’utilisateur n’est pas modérateur', done => {
      service.validateResource(12).subscribe({
        error: err => {
          expect(err.status).toBe(403);
          done();
        },
      });

      httpMock
        .expectOne(`${API}/12/validate`)
        .flush({}, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('rejectResource', () => {
    it('appelle POST /resources/:id/reject', () => {
      service.rejectResource(12).subscribe();

      const req = httpMock.expectOne(`${API}/12/reject`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Ressource rejetée' });
    });
  });
});
