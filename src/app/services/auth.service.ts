import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { RouteEnum } from '@core/enums/route.enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(false);
  private tokenTimer: any;
  private readonly TOKEN_EXPIRATION_KEY = 'token_expiration';
  private readonly IS_LOGGED_IN_KEY = 'isLoggedIn';
  private readonly TOKEN_DURATION = 3 * 60 * 1000; // 3 minutes

  constructor(private router: Router) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    const isLoggedIn = localStorage.getItem(this.IS_LOGGED_IN_KEY) === 'true';
    const expirationTime = Number(localStorage.getItem(this.TOKEN_EXPIRATION_KEY));

    if (isLoggedIn && expirationTime) {
      const now = new Date().getTime();

      if (expirationTime > now) {
        this.isAuthenticated.next(true);
        this.setAutoLogout(expirationTime - now);
      } else {
        this.logout();
      }
    }
  }

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin') {
      const expirationTime = new Date().getTime() + this.TOKEN_DURATION;

      localStorage.setItem(this.IS_LOGGED_IN_KEY, 'true');
      localStorage.setItem(this.TOKEN_EXPIRATION_KEY, expirationTime.toString());

      this.isAuthenticated.next(true);
      this.setAutoLogout(this.TOKEN_DURATION);

      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.IS_LOGGED_IN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRATION_KEY);

    this.isAuthenticated.next(false);

    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
      this.tokenTimer = null;
    }

    this.router.navigate([RouteEnum.HOME]);
  }

  refreshToken(): void {
    if (this.isAuthenticated.value) {
      const expirationTime = new Date().getTime() + this.TOKEN_DURATION;

      localStorage.setItem(this.TOKEN_EXPIRATION_KEY, expirationTime.toString());

      if (this.tokenTimer) {
        clearTimeout(this.tokenTimer);
      }

      this.setAutoLogout(this.TOKEN_DURATION);
    }
  }

  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  isLoggedInValue(): boolean {
    return this.isAuthenticated.value;
  }

  getRemainingTime(): number {
    const expirationTime = Number(localStorage.getItem(this.TOKEN_EXPIRATION_KEY));
    if (!expirationTime) return 0;

    const now = new Date().getTime();
    return Math.max(0, expirationTime - now);
  }

  private setAutoLogout(duration: number): void {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }
}
