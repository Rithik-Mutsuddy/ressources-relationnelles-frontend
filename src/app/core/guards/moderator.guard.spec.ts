import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { signal } from '@angular/core';

import { moderatorGuard } from './moderator.guard';
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

describe('moderatorGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let currentUser: ReturnType<typeof signal<User | null>>;

  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  const run = () => TestBed.runInInjectionContext(() => moderatorGuard(route, state));

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

  it('autorise un modérateur', () => {
    currentUser.set(makeUser(['ROLE_USER', 'ROLE_MODERATOR']));
    expect(run()).toBeTrue();
  });

  it('autorise un administrateur (hiérarchie de rôles)', () => {
    currentUser.set(makeUser(['ROLE_USER', 'ROLE_ADMIN']));
    expect(run()).toBeTrue();
  });

  it('autorise un super-administrateur', () => {
    currentUser.set(makeUser(['ROLE_USER', 'ROLE_SUPER_ADMIN']));
    expect(run()).toBeTrue();
  });

  it('refuse un citoyen simple', () => {
    currentUser.set(makeUser(['ROLE_USER']));
    expect(run()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/forbidden']);
  });

  it('refuse un visiteur non connecté', () => {
    expect(run()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/forbidden']);
  });
});
