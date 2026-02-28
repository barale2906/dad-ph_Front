import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { tap, catchError, of } from 'rxjs';
import { ApiService } from '../../http/api.service';

const TOKEN_KEY = 'uniph_token';
const USER_KEY = 'uniph_user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  document?: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  readonly isAuthenticated = computed(() => !!this._user());

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /** Usado tras instalación: guarda token y opcionalmente usuario */
  setSession(token: string, user?: User): void {
    this.setToken(token);
    if (user) {
      this._user.set(user);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  private clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  /** Limpia sesión sin llamar al API (útil en 401) */
  clearSession(): void {
    this.clearToken();
    this.router.navigate(['/login']);
  }

  login(credentials: LoginCredentials) {
    return this.api
      .post<{ token: string; user: User }>('/login', credentials)
      .pipe(
        tap((res) => {
          this.setToken(res.token);
          this._user.set(res.user);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        })
      );
  }

  logout(): void {
    this.api.post<unknown>('/logout', {}).subscribe({
      error: () => this.clearSession(),
      complete: () => this.clearSession(),
    });
  }

  loadCurrentUser() {
    return this.api.get<User>('/me').pipe(
      tap((user) => {
        this._user.set(user);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }),
      catchError(() => {
        this.clearToken();
        return of(null);
      })
    );
  }

  getCurrentUser(): User | null {
    const cached = localStorage.getItem(USER_KEY);
    if (cached) {
      try {
        return JSON.parse(cached) as User;
      } catch {
        return null;
      }
    }
    return this._user();
  }

  hasRole(role: string | string[]): boolean {
    const user = this.getCurrentUser() ?? this._user();
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }
}
