import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {}

  login(username: string, password: string): Observable<boolean> {
    // Mock login: Accept any non-empty credentials
    if (username && password) {
      const mockToken = `mock-jwt-${username}-${Date.now()}`; // Simulate JWT
      localStorage.setItem(this.tokenKey, mockToken);
      this.isAuthenticatedSubject.next(true);
      return of(true).pipe(delay(500)); // Simulate API delay
    }
    return of(false).pipe(delay(500));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}