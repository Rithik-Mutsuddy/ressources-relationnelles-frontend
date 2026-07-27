import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { CommentService } from './comment.service';
import { Comment } from '../models/comment.model';
import { environment } from '../../../environnement/environment';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;

  const API = `${environment.apiUrl}/resources`;
  const API_MOD = `${environment.apiUrl}/moderator`;

  const mockComment: Comment = {
    id: 1,
    content: 'Merci pour cette ressource',
    createdAt: '2026-03-01T12:00:00+00:00',
    isReported: false,
    user: { id: 5, firstname: 'Marie', lastname: 'Dupont' },
    resourceId: 10,
    parentId: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('doit être créé', () => {
    expect(service).toBeTruthy();
  });

  // ─── Consultation ────────────────────────────────────────────

  describe('getByResource', () => {
    it('appelle GET /resources/:id/comments', () => {
      service.getByResource(10).subscribe(list => expect(list.length).toBe(1));

      const req = httpMock.expectOne(`${API}/10/comments`);
      expect(req.request.method).toBe('GET');
      req.flush([mockComment]);
    });

    it('retourne une liste vide si aucun commentaire', () => {
      service.getByResource(10).subscribe(list => expect(list).toEqual([]));
      httpMock.expectOne(`${API}/10/comments`).flush([]);
    });
  });

  // ─── Publication ─────────────────────────────────────────────

  describe('create', () => {
    it('appelle POST /resources/:id/comments avec le contenu', () => {
      service.create(10, 'Très utile').subscribe();

      const req = httpMock.expectOne(`${API}/10/comments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ content: 'Très utile' });
      req.flush(mockComment);
    });

    it('propage une 401 si le citoyen n’est pas connecté', done => {
      service.create(10, 'Test').subscribe({
        error: err => {
          expect(err.status).toBe(401);
          done();
        },
      });

      httpMock
        .expectOne(`${API}/10/comments`)
        .flush({}, { status: 401, statusText: 'Unauthorized' });
    });

    it('propage une 400 si le contenu est vide', done => {
      service.create(10, '').subscribe({
        error: err => {
          expect(err.status).toBe(400);
          done();
        },
      });

      httpMock
        .expectOne(`${API}/10/comments`)
        .flush({ error: 'Contenu requis' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('reply', () => {
    it('appelle POST /resources/:rid/comments/:cid/reply', () => {
      service.reply(10, 1, 'Je suis d’accord').subscribe();

      const req = httpMock.expectOne(`${API}/10/comments/1/reply`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ content: 'Je suis d’accord' });
      req.flush({ ...mockComment, id: 2, parentId: 1 });
    });

    it('retourne une réponse rattachée au commentaire parent', () => {
      service.reply(10, 1, 'Réponse').subscribe(res => {
        expect(res.parentId).toBe(1);
      });

      httpMock
        .expectOne(`${API}/10/comments/1/reply`)
        .flush({ ...mockComment, id: 2, parentId: 1 });
    });
  });

  // ─── Signalement ─────────────────────────────────────────────

  describe('report', () => {
    it('appelle POST /resources/:rid/comments/:cid/report', () => {
      service.report(1, 10).subscribe();

      const req = httpMock.expectOne(`${API}/10/comments/1/report`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({ message: 'Commentaire signalé' });
    });
  });

  // ─── Modération ──────────────────────────────────────────────

  describe('getReported', () => {
    it('appelle GET /moderator/reported', () => {
      service.getReported().subscribe();

      const req = httpMock.expectOne(`${API_MOD}/reported`);
      expect(req.request.method).toBe('GET');
      req.flush([{ ...mockComment, isReported: true }]);
    });

    it('propage une 403 pour un citoyen simple', done => {
      service.getReported().subscribe({
        error: err => {
          expect(err.status).toBe(403);
          done();
        },
      });

      httpMock
        .expectOne(`${API_MOD}/reported`)
        .flush({}, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('validateComment', () => {
    it('appelle POST /moderator/:id/validate', () => {
      service.validateComment(1).subscribe();

      const req = httpMock.expectOne(`${API_MOD}/1/validate`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush({ message: 'Commentaire validé' });
    });
  });

  describe('rejectComment', () => {
    it('appelle POST /moderator/:id/reject', () => {
      service.rejectComment(1).subscribe();

      const req = httpMock.expectOne(`${API_MOD}/1/reject`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Commentaire rejeté' });
    });
  });
});
