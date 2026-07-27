import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { signal } from '@angular/core';

import { authGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';
import { User } from '../models/user.model';

const makeUser = (roles: User['roles']): User => ({
  id: 1,
  email: 'u@example.fr',
  firstname: 'Test',
  lastname: 'User',
  roles,
  authProvider: 'local',
  verified: true,
  isVerified: true,
  createdAt: '2026-01-01T00:00:00+00:00',
});

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let currentUser: ReturnType<typeof signal<User | null>>;

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  const run = () => TestBed.runInInjectionContext(() => authGuard(route, state));

  beforeEach(() => {
    currentUser = signal<User | null>(null);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        {
          provide: AuthService,
          useValue: {
            currentUser,
            isAuthenticated: () => currentUser() !== null,
          },
        },
      ],
    });
  });

  it('autorise l’accès à un citoyen connecté', () => {
    currentUser.set(makeUser(['ROLE_USER']));
    expect(run()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('refuse l’accès à un visiteur non connecté', () => {
    expect(run()).toBeFalse();
  });

  it('redirige le visiteur non connecté vers la page de connexion', () => {
    run();
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('autorise également les rôles à privilèges', () => {
    currentUser.set(makeUser(['ROLE_USER', 'ROLE_ADMIN']));
    expect(run()).toBeTrue();
  });
});
