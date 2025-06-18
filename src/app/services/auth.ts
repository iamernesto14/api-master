import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private isAuthenticatedSubject: BehaviorSubject<boolean>;
  isAuthenticated$: Observable<boolean>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Initialize BehaviorSubject safely
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  login(username: string, password: string): Observable<boolean> {
    if (username && password && isPlatformBrowser(this.platformId)) {
      const mockToken = `mock-jwt-${username}-${Date.now()}`;
      localStorage.setItem(this.tokenKey, mockToken);
      this.isAuthenticatedSubject.next(true);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}