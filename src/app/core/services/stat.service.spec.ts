import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { StatService } from './stat.service';
import { environment } from '../../../environnement/environment';

describe('StatService', () => {
  let service: StatService;
  let httpMock: HttpTestingController;

  const API = `${environment.apiUrl}/stats`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('doit être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('getStats', () => {
    it('appelle GET /stats', () => {
      service.getStats().subscribe();

      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('GET');
      req.flush({ totalResources: 120, totalUsers: 450 });
    });

    it('retourne les données agrégées de la plateforme', () => {
      service.getStats().subscribe(stats => {
        expect((stats as any).totalResources).toBe(120);
        expect((stats as any).totalUsers).toBe(450);
      });

      httpMock.expectOne(API).flush({ totalResources: 120, totalUsers: 450 });
    });

    it('ne transmet aucune donnée nominative (statistiques anonymisées)', () => {
      service.getStats().subscribe(stats => {
        expect(Object.keys(stats as any)).not.toContain('email');
        expect(Object.keys(stats as any)).not.toContain('users');
      });

      httpMock.expectOne(API).flush({ totalResources: 120, totalUsers: 450 });
    });

    it('propage une erreur serveur', done => {
      service.getStats().subscribe({
        error: err => {
          expect(err.status).toBe(500);
          done();
        },
      });

      httpMock.expectOne(API).flush({}, { status: 500, statusText: 'Server Error' });
    });
  });
});
