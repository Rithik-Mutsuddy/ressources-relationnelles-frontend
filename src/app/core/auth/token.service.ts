import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

const ACCESS_KEY  = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY    = 'current_user';

@Injectable({ providedIn: 'root' })
export class TokenService {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  setAccessToken(token: string) {
    localStorage.setItem(ACCESS_KEY, token);
  }

  setTokens(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  }

  getStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  setStoredUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  }
}