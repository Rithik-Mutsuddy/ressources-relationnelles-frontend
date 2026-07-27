import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { SuperAdminService } from './super-admin.service';
import { UserRole } from '../models/user.model';
import { environment } from '../../../environnement/environment';

describe('SuperAdminService', () => {
  let service: SuperAdminService;
  let httpMock: HttpTestingController;

  const API = `${environment.apiUrl}/superadmin`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SuperAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('doit être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('getAccounts', () => {
    it('appelle GET /superadmin/accounts', () => {
      service.getAccounts().subscribe();
      const req = httpMock.expectOne(`${API}/accounts`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('propage une 403 pour un administrateur simple', done => {
      service.getAccounts().subscribe({
        error: err => {
          expect(err.status).toBe(403);
          done();
        },
      });
      httpMock
        .expectOne(`${API}/accounts`)
        .flush({}, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('createAccount', () => {
    it('crée un compte à privilèges via POST /superadmin/accounts', () => {
      const data = {
        email: 'moderateur@ministere.fr',
        firstname: 'Luc',
        lastname: 'Bernard',
        role: 'ROLE_MODERATOR',
      };

      service.createAccount(data).subscribe();

      const req = httpMock.expectOne(`${API}/accounts`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(data);
      req.flush({ id: 20 });
    });
  });

  describe('changeRole', () => {
    const roles: UserRole[] = [
      'ROLE_USER',
      'ROLE_MODERATOR',
      'ROLE_ADMIN',
      'ROLE_SUPER_ADMIN',
    ];

    roles.forEach(role => {
      it(`attribue le rôle ${role} via PUT /superadmin/accounts/:id/role`, () => {
        service.changeRole(20, role).subscribe();

        const req = httpMock.expectOne(`${API}/accounts/20/role`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual({ role });
        req.flush({ id: 20, roles: [role] });
      });
    });
  });

  describe('deleteAccount', () => {
    it('appelle DELETE /superadmin/accounts/:id', () => {
      service.deleteAccount(20).subscribe();
      const req = httpMock.expectOne(`${API}/accounts/20`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});
