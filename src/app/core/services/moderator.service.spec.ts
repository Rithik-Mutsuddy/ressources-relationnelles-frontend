import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { ModeratorService } from './moderator.service';
import { environment } from '../../../environnement/environment';

describe('ModeratorService', () => {
  let service: ModeratorService;
  let httpMock: HttpTestingController;

  const API = `${environment.apiUrl}/moderator`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ModeratorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('doit être créé', () => {
    expect(service).toBeTruthy();
  });

  // ─── File de modération des ressources ───────────────────────

  describe('getPendingResources', () => {
    it('appelle GET /moderator/resources/pending', () => {
      service.getPendingResources().subscribe();
      const req = httpMock.expectOne(`${API}/resources/pending`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('propage une 403 pour un citoyen simple', done => {
      service.getPendingResources().subscribe({
        error: err => {
          expect(err.status).toBe(403);
          done();
        },
      });
      httpMock
        .expectOne(`${API}/resources/pending`)
        .flush({}, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('validateResource', () => {
    it('publie une ressource via PUT /moderator/resources/:id/validate', () => {
      service.validateResource(4).subscribe();
      const req = httpMock.expectOne(`${API}/resources/4/validate`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush({ message: 'Ressource publiée' });
    });
  });

  describe('rejectResource', () => {
    it('rejette une ressource via PUT /moderator/resources/:id/reject', () => {
      service.rejectResource(4).subscribe();
      const req = httpMock.expectOne(`${API}/resources/4/reject`);
      expect(req.request.method).toBe('PUT');
      req.flush({ message: 'Ressource rejetée' });
    });
  });

  // ─── Modération des commentaires ─────────────────────────────

  describe('getReportedComments', () => {
    it('appelle GET /moderator/comments/reported', () => {
      service.getReportedComments().subscribe();
      const req = httpMock.expectOne(`${API}/comments/reported`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('deleteComment', () => {
    it('appelle DELETE /moderator/comments/:id', () => {
      service.deleteComment(11).subscribe();
      const req = httpMock.expectOne(`${API}/comments/11`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('replyComment', () => {
    it('appelle POST /moderator/comments/:id/reply avec le contenu', () => {
      service.replyComment(11, 'Ce commentaire enfreint la charte').subscribe();

      const req = httpMock.expectOne(`${API}/comments/11/reply`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        content: 'Ce commentaire enfreint la charte',
      });
      req.flush({ id: 12 });
    });
  });
});
