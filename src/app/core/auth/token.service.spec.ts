import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';
import { User } from '../models/user.model';

describe('TokenService', () => {
  let service: TokenService;

  const mockUser: User = {
    id: 1,
    email: 'citoyen@example.fr',
    firstname: 'Marie',
    lastname: 'Dupont',
    roles: ['ROLE_USER'],
    authProvider: 'local',
    verified: true,
    isVerified: true,
    createdAt: '2026-01-15T10:00:00+00:00',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('doit être créé', () => {
    expect(service).toBeTruthy();
  });

  // ─── Jetons d'accès ──────────────────────────────────────────

  describe('getAccessToken', () => {
    it('retourne null si aucun jeton n’est stocké', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('retourne le jeton stocké', () => {
      localStorage.setItem('access_token', 'jwt-access-abc');
      expect(service.getAccessToken()).toBe('jwt-access-abc');
    });
  });

  describe('setAccessToken', () => {
    it('écrit le jeton d’accès dans le stockage', () => {
      service.setAccessToken('nouveau-jeton');
      expect(localStorage.getItem('access_token')).toBe('nouveau-jeton');
    });

    it('écrase un jeton existant (cas du refresh)', () => {
      service.setAccessToken('ancien');
      service.setAccessToken('nouveau');
      expect(service.getAccessToken()).toBe('nouveau');
    });
  });

  // ─── Jetons de rafraîchissement ──────────────────────────────

  describe('getRefreshToken', () => {
    it('retourne null si absent', () => {
      expect(service.getRefreshToken()).toBeNull();
    });

    it('retourne le jeton de rafraîchissement stocké', () => {
      localStorage.setItem('refresh_token', 'jwt-refresh-xyz');
      expect(service.getRefreshToken()).toBe('jwt-refresh-xyz');
    });
  });

  describe('setTokens', () => {
    it('stocke simultanément le jeton d’accès et de rafraîchissement', () => {
      service.setTokens('acc-1', 'ref-1');
      expect(service.getAccessToken()).toBe('acc-1');
      expect(service.getRefreshToken()).toBe('ref-1');
    });
  });

  // ─── Utilisateur courant ─────────────────────────────────────

  describe('getStoredUser', () => {
    it('retourne null si aucun utilisateur n’est stocké', () => {
      expect(service.getStoredUser()).toBeNull();
    });

    it('désérialise correctement l’utilisateur stocké', () => {
      localStorage.setItem('current_user', JSON.stringify(mockUser));
      expect(service.getStoredUser()).toEqual(mockUser);
    });

    it('préserve le tableau de rôles après désérialisation', () => {
      const admin: User = { ...mockUser, roles: ['ROLE_USER', 'ROLE_ADMIN'] };
      service.setStoredUser(admin);
      expect(service.getStoredUser()?.roles).toEqual(['ROLE_USER', 'ROLE_ADMIN']);
    });
  });

  describe('setStoredUser', () => {
    it('sérialise l’utilisateur en JSON', () => {
      service.setStoredUser(mockUser);
      expect(localStorage.getItem('current_user')).toBe(JSON.stringify(mockUser));
    });
  });

  // ─── Purge de session ────────────────────────────────────────

  describe('clear', () => {
    it('supprime les trois clés de session', () => {
      service.setTokens('acc', 'ref');
      service.setStoredUser(mockUser);

      service.clear();

      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
      expect(service.getStoredUser()).toBeNull();
    });

    it('ne lève pas d’erreur si la session est déjà vide', () => {
      expect(() => service.clear()).not.toThrow();
    });

    it('ne supprime pas les clés étrangères au service', () => {
      localStorage.setItem('cookie_consent', 'accepted');
      service.clear();
      expect(localStorage.getItem('cookie_consent')).toBe('accepted');
    });
  });
});
