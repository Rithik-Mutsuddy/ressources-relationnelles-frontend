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

import { jwtInterceptor } from './jwt.interceptor';
import { TokenService } from '../auth/token.service';

describe('jwtInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let tokenSvc: TokenService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    tokenSvc = TestBed.inject(TokenService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('ajoute l’en-tête Authorization quand un jeton est présent', () => {
    tokenSvc.setAccessToken('jwt-access-abc');

    http.get('/api/resources').subscribe();

    const req = httpMock.expectOne('/api/resources');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-access-abc');
    req.flush([]);
  });

  it('n’ajoute aucun en-tête quand aucun jeton n’est stocké', () => {
    http.get('/api/resources').subscribe();

    const req = httpMock.expectOne('/api/resources');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });

  it('applique le jeton sur toutes les méthodes HTTP', () => {
    tokenSvc.setAccessToken('jwt-abc');

    http.post('/api/resources', { title: 'Test' }).subscribe();
    const post = httpMock.expectOne('/api/resources');
    expect(post.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
    post.flush({});

    http.delete('/api/resources/1').subscribe();
    const del = httpMock.expectOne('/api/resources/1');
    expect(del.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
    del.flush({});
  });

  it('utilise le jeton le plus récent après un rafraîchissement', () => {
    tokenSvc.setAccessToken('ancien-jeton');
    tokenSvc.setAccessToken('nouveau-jeton');

    http.get('/api/profile').subscribe();

    const req = httpMock.expectOne('/api/profile');
    expect(req.request.headers.get('Authorization')).toBe('Bearer nouveau-jeton');
    req.flush({});
  });

  it('préserve les en-têtes déjà positionnés sur la requête', () => {
    tokenSvc.setAccessToken('jwt-abc');

    http.get('/api/resources', { headers: { 'X-Custom': 'valeur' } }).subscribe();

    const req = httpMock.expectOne('/api/resources');
    expect(req.request.headers.get('X-Custom')).toBe('valeur');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
    req.flush([]);
  });
});
