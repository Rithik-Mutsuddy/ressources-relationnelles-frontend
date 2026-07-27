import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { AdminService } from './admin.service';
import { environment } from '../../../environnement/environment';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  const API = `${environment.apiUrl}/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('doit être créé', () => {
    expect(service).toBeTruthy();
  });

  // ─── Catalogue de ressources ─────────────────────────────────

  describe('gestion des ressources', () => {
    it('getResources appelle GET /admin/resources', () => {
      service.getResources().subscribe();
      const req = httpMock.expectOne(`${API}/resources`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('deleteResource appelle DELETE /admin/resources/:id', () => {
      service.deleteResource(3).subscribe();
      const req = httpMock.expectOne(`${API}/resources/3`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });

    it('propage une 403 si l’appelant n’est pas administrateur', done => {
      service.getResources().subscribe({
        error: err => {
          expect(err.status).toBe(403);
          done();
        },
      });
      httpMock
        .expectOne(`${API}/resources`)
        .flush({}, { status: 403, statusText: 'Forbidden' });
    });
  });

  // ─── Catégories ──────────────────────────────────────────────

  describe('gestion des catégories', () => {
    it('getCategories appelle GET /admin/categories', () => {
      service.getCategories().subscribe();
      const req = httpMock.expectOne(`${API}/categories`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('createCategory transmet le corps de la requête', () => {
      service.createCategory({ name: 'Amis' }).subscribe();
      const req = httpMock.expectOne(`${API}/categories`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ name: 'Amis' });
      req.flush({ id: 1 });
    });

    it('updateCategory appelle PUT /admin/categories/:id', () => {
      service.updateCategory(1, { name: 'Amitiés' }).subscribe();
      const req = httpMock.expectOne(`${API}/categories/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ name: 'Amitiés' });
      req.flush({ id: 1 });
    });

    it('deleteCategory appelle DELETE /admin/categories/:id', () => {
      service.deleteCategory(1).subscribe();
      const req = httpMock.expectOne(`${API}/categories/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  // ─── Comptes citoyens ────────────────────────────────────────

  describe('gestion des comptes citoyens', () => {
    it('getUsers appelle GET /admin/users', () => {
      service.getUsers().subscribe();
      const req = httpMock.expectOne(`${API}/users`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('banUser désactive un compte via PUT /admin/users/:id/ban', () => {
      service.banUser(9).subscribe();
      const req = httpMock.expectOne(`${API}/users/9/ban`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush({ message: 'Compte désactivé' });
    });

    it('unbanUser réactive un compte via PUT /admin/users/:id/unban', () => {
      service.unbanUser(9).subscribe();
      const req = httpMock.expectOne(`${API}/users/9/unban`);
      expect(req.request.method).toBe('PUT');
      req.flush({ message: 'Compte réactivé' });
    });

    it('deleteUser appelle DELETE /admin/users/:id (droit à l’effacement)', () => {
      service.deleteUser(9).subscribe();
      const req = httpMock.expectOne(`${API}/users/9`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  // ─── Statistiques ────────────────────────────────────────────

  describe('statistiques', () => {
    it('getStatistics appelle GET /admin/statistics', () => {
      service.getStatistics().subscribe();
      const req = httpMock.expectOne(`${API}/statistics`);
      expect(req.request.method).toBe('GET');
      req.flush({ totalResources: 42 });
    });

    it('exportStats appelle GET /admin/statistics/export', () => {
      service.exportStats().subscribe();
      const req = httpMock.expectOne(`${API}/statistics/export`);
      expect(req.request.method).toBe('GET');
      req.flush({ url: '/exports/stats.csv' });
    });
  });
});
