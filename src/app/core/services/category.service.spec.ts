import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CategoryService } from './category.service';
import { Category } from '../models/category.model';
import { environment } from '../../../environnement/environment';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  const PUBLIC_API = `${environment.apiUrl}/categories`;
  const ADMIN_API = `${environment.apiUrl}/admin/categories`;

  const famille: Category = {
    id: 1,
    name: 'Famille',
    description: 'Relations familiales',
    createdAt: '2026-01-01T00:00:00+00:00',
  };

  const couple: Category = {
    id: 2,
    name: 'Couple',
    createdAt: '2026-01-02T00:00:00+00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('doit être créé avec un cache vide', () => {
    expect(service).toBeTruthy();
    expect(service.categories()).toEqual([]);
  });

  // ─── Lecture publique ────────────────────────────────────────

  describe('getAll', () => {
    it('appelle GET /categories', () => {
      service.getAll().subscribe();

      const req = httpMock.expectOne(PUBLIC_API);
      expect(req.request.method).toBe('GET');
      req.flush([famille, couple]);
    });

    it('alimente le signal de cache', () => {
      service.getAll().subscribe();
      httpMock.expectOne(PUBLIC_API).flush([famille, couple]);

      expect(service.categories()).toEqual([famille, couple]);
    });

    it('remplace le cache à chaque appel', () => {
      service.getAll().subscribe();
      httpMock.expectOne(PUBLIC_API).flush([famille, couple]);

      service.getAll().subscribe();
      httpMock.expectOne(PUBLIC_API).flush([famille]);

      expect(service.categories()).toEqual([famille]);
    });

    it('n’altère pas le cache si l’appel échoue', done => {
      service.getAll().subscribe();
      httpMock.expectOne(PUBLIC_API).flush([famille]);

      service.getAll().subscribe({
        error: () => {
          expect(service.categories()).toEqual([famille]);
          done();
        },
      });
      httpMock.expectOne(PUBLIC_API).flush({}, { status: 500, statusText: 'Error' });
    });
  });

  describe('getOne', () => {
    it('appelle GET /categories/:id', () => {
      service.getOne(1).subscribe(c => expect(c.name).toBe('Famille'));

      const req = httpMock.expectOne(`${PUBLIC_API}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(famille);
    });

    it('ne modifie pas le cache', () => {
      service.getOne(1).subscribe();
      httpMock.expectOne(`${PUBLIC_API}/1`).flush(famille);

      expect(service.categories()).toEqual([]);
    });
  });

  // ─── CRUD administrateur ─────────────────────────────────────

  describe('adminGetAll', () => {
    it('appelle GET /admin/categories', () => {
      service.adminGetAll().subscribe();

      const req = httpMock.expectOne(ADMIN_API);
      expect(req.request.method).toBe('GET');
      req.flush([famille, couple]);
    });

    it('alimente le même cache que la lecture publique', () => {
      service.adminGetAll().subscribe();
      httpMock.expectOne(ADMIN_API).flush([famille, couple]);

      expect(service.categories().length).toBe(2);
    });
  });

  describe('create', () => {
    it('appelle POST /admin/categories', () => {
      service.create({ name: 'Amis', description: 'Amitiés' }).subscribe();

      const req = httpMock.expectOne(ADMIN_API);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'Amis', description: 'Amitiés' });
      req.flush({ id: 3, name: 'Amis', createdAt: '2026-03-01T00:00:00+00:00' });
    });

    it('ajoute la catégorie créée au cache', () => {
      service.getAll().subscribe();
      httpMock.expectOne(PUBLIC_API).flush([famille]);

      const nouvelle: Category = {
        id: 3,
        name: 'Amis',
        createdAt: '2026-03-01T00:00:00+00:00',
      };
      service.create({ name: 'Amis' }).subscribe();
      httpMock.expectOne(ADMIN_API).flush(nouvelle);

      expect(service.categories()).toEqual([famille, nouvelle]);
    });

    it('accepte une création sans description', () => {
      service.create({ name: 'Collègues' }).subscribe();

      const req = httpMock.expectOne(ADMIN_API);
      expect(req.request.body).toEqual({ name: 'Collègues' });
      req.flush({ id: 4, name: 'Collègues', createdAt: '2026-03-02T00:00:00+00:00' });
    });
  });

  describe('update', () => {
    beforeEach(() => {
      service.getAll().subscribe();
      httpMock.expectOne(PUBLIC_API).flush([famille, couple]);
    });

    it('appelle PUT /admin/categories/:id', () => {
      service.update(1, { name: 'Famille élargie' }).subscribe();

      const req = httpMock.expectOne(`${ADMIN_API}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: 'Famille élargie' });
      req.flush({ ...famille, name: 'Famille élargie' });
    });

    it('remplace l’élément correspondant dans le cache', () => {
      const modifiee = { ...famille, name: 'Famille élargie' };
      service.update(1, { name: 'Famille élargie' }).subscribe();
      httpMock.expectOne(`${ADMIN_API}/1`).flush(modifiee);

      expect(service.categories()).toEqual([modifiee, couple]);
    });

    it('laisse le cache intact si l’identifiant n’y figure pas', () => {
      service.update(99, { name: 'Inconnue' }).subscribe();
      httpMock
        .expectOne(`${ADMIN_API}/99`)
        .flush({ id: 99, name: 'Inconnue', createdAt: '2026-01-01T00:00:00+00:00' });

      expect(service.categories()).toEqual([famille, couple]);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      service.getAll().subscribe();
      httpMock.expectOne(PUBLIC_API).flush([famille, couple]);
    });

    it('appelle DELETE /admin/categories/:id', () => {
      service.delete(1).subscribe();

      const req = httpMock.expectOne(`${ADMIN_API}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('retire la catégorie du cache', () => {
      service.delete(1).subscribe();
      httpMock.expectOne(`${ADMIN_API}/1`).flush({});

      expect(service.categories()).toEqual([couple]);
    });

    it('conserve le cache si la suppression échoue', done => {
      service.delete(1).subscribe({
        error: () => {
          expect(service.categories().length).toBe(2);
          done();
        },
      });

      httpMock
        .expectOne(`${ADMIN_API}/1`)
        .flush({}, { status: 409, statusText: 'Conflict' });
    });
  });
});
