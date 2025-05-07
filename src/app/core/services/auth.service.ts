
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

    if (isPlatformBrowser(this.platformId)) {
      const storedToken = this.getStoredToken()?.token || null;
      this.userSubject.next(storedToken);
      this.userDataSubject.next(this.getStoredToken()?.user || null);


    } else {

    }
  }

  getToken(): string | null {
    return this.userSubject.value;
  }

  getUser(): any {
    return this.userDataSubject.value;
  }

  public setItem(key: string, value: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, JSON.stringify(value));
    } else {
    }
  }

  public getItem<T>(key: string): T | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const item = localStorage.getItem(key);
        const parsedItem = item ? JSON.parse(item) : null;

        return parsedItem as T;
      } catch (error) {
        console.error(`AuthService - Error parsing key: ${key}`, error);
        this.removeItem(key);
        return null;
      }
    } else {
      return null;
    }
  }

  private removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);

    } else {

    }
  }

  private getStoredToken(): { token: string | null; user: any | null } {
    const stored = {
      token: this.getItem<string>(this.tokenKey),
      user: this.getItem<any>(this.userKey),
    };
    return stored;
  }

  private handleTokens(response: LoginResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setItem(this.tokenKey, response.token);
      this.setItem(this.userKey, response.data.user);
      this.userSubject.next(response.token);
      this.userDataSubject.next(response.data.user);
    } else {
    }
  }

  login(data: any): Observable<LoginResponse | null> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/v1/users/login`, data)
      .pipe(
        tap((response) => {

          this.handleTokens(response);
        }),
        catchError((error) => {
          this.messageService.handleResponse(error, 'Login Failed', 'Invalid credentials or server error.');
          console.error('AuthService - Login error:', error);
          return of(null);
        })
      );
  }
  
  resetPassword( data: { password: string; passwordConfirm: string }): Observable<LoginResponse | null> {
   let token = this.getItem('authToken')
    return this.http
      .patch<LoginResponse>(`${this.baseUrl}/v1/users/resetPassword/${token}`, data)
      .pipe(
        tap((response) => {
          this.handleTokens(response); // Log the user in after password reset
        }),
        catchError((error) => {
          this.messageService.handleResponse(error, 'Reset Failed', 'Invalid token or server error.');
          return of(null);
        })
      );
  }
  
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/users/forgotPassword`, { email })
    
  }
  

  updatePassword(data: { currentPassword: string; password: string; passwordConfirm: string }): Observable<LoginResponse | null> {
    return this.http
      .patch<LoginResponse>(`${this.baseUrl}/v1/users/updatePassword`, data)
      .pipe(
        tap((response) => {this.handleTokens(response)}),
        catchError((error) => {
          this.messageService.handleResponse(error, 'Update Failed', 'Could not update password.');
          console.error('AuthService - Update password error:', error);
          return of(null);
        })
      );
  }
  

  signUp(data: any): Observable<LoginResponse | null> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/v1/users/signup`, data)
      .pipe(
        tap((response) => {

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
    return isAuth;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = payload.exp * 1000 < Date.now();
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
    } else {
    }
    this.userSubject.next(null);
    this.userDataSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
}



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