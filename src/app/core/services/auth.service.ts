// import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { BehaviorSubject, Observable, of } from 'rxjs';
// import { tap, catchError } from 'rxjs/operators';
// import { AppMessageService } from './message.service';
// import { response } from 'express';
// import { environment } from '../../../environments/environment';

// export interface LoginResponse {
//   token: string;
//   refresh_token?: string;
//   data: {
//     user: any;
//   };
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private tokenKey = 'authToken';
//   // private refreshTokenKey = 'refreshToken';
//   private userKey = 'user';
//   // private baseUrl = 'https://4000-idx-backend-1737022093659.cluster-7ubberrabzh4qqy2g4z7wgxuw2.cloudworkstations.dev/api';
//   // private baseUrl = 'http://localhost:4002/api'
//   private baseUrl = environment.apiUrl;

//   private userSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(this.getStoredToken()?.token || null);
//   public user: Observable<string | null> = this.userSubject.asObservable();
//   private userDataSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.getStoredToken()?.user || null);

//   constructor(
//     private messageService: AppMessageService,
//     private http: HttpClient,
//     private router: Router,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {
//     if (isPlatformBrowser(this.platformId)) {
//       const storedToken = this.getStoredToken()?.token || null;
//       this.userSubject.next(storedToken);
//       this.userDataSubject.next(this.getStoredToken()?.user || null);
//     }
//   }

//   getToken(): string | null {
//     return this.userSubject.value;
//   }

//   getUser(): any {
//     return this.userDataSubject.value;
//   }

//   public setItem(key: string, value: any): void {
//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.setItem(key, JSON.stringify(value));
//     }
//   }

//   public getItem<T>(key: string): T | null {
//     if (isPlatformBrowser(this.platformId)) {
//       try {
//         return JSON.parse(localStorage.getItem(key) || 'null') as T;
//       } catch {
//         console.error(`Error parsing key: ${key}`);
//         this.removeItem(key);
//         return null;
//       }
//     }
//     return null;
//   }

//   private removeItem(key: string): void {
//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.removeItem(key);
//     }
//   }

//   private getStoredToken(): { token: string | null; user: any | null } {
//     return {
//       token: this.getItem<string>(this.tokenKey),
//       user: this.getItem<any>(this.userKey),
//     };
//   }

//   private handleTokens(response: LoginResponse): void {
//     if (isPlatformBrowser(this.platformId)) {
//       this.setItem(this.tokenKey, response.token);
//       // if (response.refresh_token) {
//       //   this.setItem(this.refreshTokenKey, response.refresh_token);
//       // }
//       this.setItem(this.userKey, response.data.user);
//       this.userSubject.next(response.token);
//       this.userDataSubject.next(response.data.user);
//     }
//   }

//   login(data: any): Observable<LoginResponse | null> {
//     return this.http
//       .post<LoginResponse>(`${this.baseUrl}/v1/users/login`, data)
//       .pipe(
//         tap((response) => this.handleTokens(response)),
//         catchError((error) => {
//           this.messageService.handleResponse(error, 'Request Successful', 'The data was fetched correctly.');
//           console.error('Login error:', error);
//           return of(null);
//         })
//       );
//   }

//   signUp(data: any): Observable<LoginResponse | null> {
//     return this.http
//       .post<LoginResponse>(`${this.baseUrl}/v1/users/signup`, data)
//       .pipe(
//         tap((response) => this.handleTokens(response)),
//         catchError((error) => {
//           console.error('Signup error:', error);
//           return of(null);
//         })
//       );
//   }

//   isAuthenticated(): boolean {
//     const token = this.userSubject.value;
//     return !!token && !this.isTokenExpired(token);
//   }

//   private isTokenExpired(token: string): boolean {
//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       return payload.exp * 1000 < Date.now();
//     } catch {
//       return true;
//     }
//   }

//   logout(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       this.removeItem(this.tokenKey);
//       // this.removeItem(this.refreshTokenKey);
//       this.removeItem(this.userKey);
//     }
//     this.userSubject.next(null);
//     this.userDataSubject.next(null);
//     this.router.navigate(['/auth/login']);
//   }

// }
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AppMessageService } from './message.service';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  token: string;
  refresh_token?: string;
  data: {
    user: any;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey = 'authToken';
  // private refreshTokenKey = 'refreshToken';
  private userKey = 'user';
  private baseUrl = environment.apiUrl;

  private userSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(this.getStoredToken()?.token || null);
  public user: Observable<string | null> = this.userSubject.asObservable();
  private userDataSubject: BehaviorSubject<any> = new BehaviorSubject<any>(this.getStoredToken()?.user || null);

  constructor(
    private messageService: AppMessageService,
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    console.log('AuthService - Constructor called');
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = this.getStoredToken()?.token || null;
      this.userSubject.next(storedToken);
      this.userDataSubject.next(this.getStoredToken()?.user || null);
      console.log('AuthService - Initial token from storage:', !!storedToken);
      console.log('AuthService - Initial user data from storage:', !!this.getStoredToken()?.user);
    } else {
      console.log('AuthService - Running on server-side');
    }
  }

  getToken(): string | null {
    console.log('AuthService - getToken() called, returning:', this.userSubject.value);
    return this.userSubject.value;
  }

  getUser(): any {
    console.log('AuthService - getUser() called, returning:', this.userDataSubject.value);
    return this.userDataSubject.value;
  }

  public setItem(key: string, value: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, JSON.stringify(value));
      console.log('AuthService - setItem() called, key:', key, 'value:', value);
    } else {
      console.log('AuthService - setItem() called on server-side, key:', key);
    }
  }

  public getItem<T>(key: string): T | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const item = localStorage.getItem(key);
        const parsedItem = item ? JSON.parse(item) : null;
        console.log('AuthService - getItem() called, key:', key, 'returning:', parsedItem);
        return parsedItem as T;
      } catch (error) {
        console.error(`AuthService - Error parsing key: ${key}`, error);
        this.removeItem(key);
        return null;
      }
    } else {
      console.log('AuthService - getItem() called on server-side, key:', key);
      return null;
    }
  }

  private removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
      console.log('AuthService - removeItem() called, key:', key);
    } else {
      console.log('AuthService - removeItem() called on server-side, key:', key);
    }
  }

  private getStoredToken(): { token: string | null; user: any | null } {
    const stored = {
      token: this.getItem<string>(this.tokenKey),
      user: this.getItem<any>(this.userKey),
    };
    console.log('AuthService - getStoredToken() called, returning:', stored);
    return stored;
  }

  private handleTokens(response: LoginResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setItem(this.tokenKey, response.token);
      this.setItem(this.userKey, response.data.user);
      this.userSubject.next(response.token);
      this.userDataSubject.next(response.data.user);
      console.log('AuthService - handleTokens() called, token set, user set, subjects updated');
    } else {
      console.log('AuthService - handleTokens() called on server-side');
    }
  }

  login(data: any): Observable<LoginResponse | null> {
    console.log('AuthService - login() initiated with data:', data);
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/v1/users/login`, data)
      .pipe(
        tap((response) => {
          console.log('AuthService - login() successful, response:', response);
          this.handleTokens(response);
        }),
        catchError((error) => {
          this.messageService.handleResponse(error, 'Login Failed', 'Invalid credentials or server error.');
          console.error('AuthService - Login error:', error);
          return of(null);
        })
      );
  }

  signUp(data: any): Observable<LoginResponse | null> {
    console.log('AuthService - signUp() initiated with data:', data);
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/v1/users/signup`, data)
      .pipe(
        tap((response) => {
          console.log('AuthService - signUp() successful, response:', response);
          this.handleTokens(response);
        }),
        catchError((error) => {
          console.error('AuthService - Signup error:', error);
          return of(null);
        })
      );
  }

  isAuthenticated(): boolean {
    const token = this.userSubject.value;
    const isAuth = !!token && !this.isTokenExpired(token);
    console.log('AuthService - isAuthenticated() called, current token:', !!token, 'isExpired:', !token ? 'N/A' : this.isTokenExpired(token), 'returning:', isAuth);
    return isAuth;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
      console.log('AuthService - isTokenExpired() called, expiry:', new Date(payload.exp * 1000), 'now:', new Date(), 'returning:', isExpired);
      return isExpired;
    } catch (error) {
      console.error('AuthService - Error decoding or checking token expiration:', error);
      return true;
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.removeItem(this.tokenKey);
      this.removeItem(this.userKey);
      console.log('AuthService - logout() called, token and user removed from storage');
    } else {
      console.log('AuthService - logout() called on server-side');
    }
    this.userSubject.next(null);
    this.userDataSubject.next(null);
    console.log('AuthService - logout() - subjects updated, navigating to /auth/login');
    this.router.navigate(['/auth/login']);
  }
}