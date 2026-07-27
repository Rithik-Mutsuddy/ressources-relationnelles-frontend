import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { signal } from '@angular/core';

import { guestGuard } from './guest.guard';
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

describe('guestGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let currentUser: ReturnType<typeof signal<User | null>>;

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  const run = () => TestBed.runInInjectionContext(() => guestGuard(route, state));

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

  it('laisse passer un visiteur non connecté vers /auth/login', () => {
    expect(run()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('refuse l’accès à un utilisateur déjà connecté', () => {
    currentUser.set(makeUser(['ROLE_USER']));
    expect(run()).toBeFalse();
  });

  it('redirige l’utilisateur connecté vers son tableau de bord', () => {
    currentUser.set(makeUser(['ROLE_USER']));
    run();
    expect(router.navigate).toHaveBeenCalledWith(['/citizen/dashboard']);
  });

  it('redirige aussi un administrateur déjà connecté', () => {
    currentUser.set(makeUser(['ROLE_USER', 'ROLE_ADMIN']));
    expect(run()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/citizen/dashboard']);
  });
});
