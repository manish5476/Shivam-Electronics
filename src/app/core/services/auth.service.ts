import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AppMessageService } from './message.service';
import { environment } from '../../../environments/environment';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  // Add any other user properties you need
}

export interface LoginResponse {
  token: string;
  data: {
    user: User;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'currentUser';
  private baseUrl = environment.apiUrl;

  // Use a single BehaviorSubject for the user object
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private messageService: AppMessageService,
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Initialize subjects from localStorage
    const user = this.getItem<User>(this.USER_KEY);
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    // Create a reactive stream for the authentication status
    this.isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));
  }

  // --- Public Getters ---
  
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getToken(): string | null {
    return this.getItem<string>(this.TOKEN_KEY);
  }
  
  public getUserRole(): string | null {
    return this.currentUserValue?.role || null;
  }

  // --- Core Auth Methods ---

  login(data: any): Observable<LoginResponse | null> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/v1/users/login`, data)
      .pipe(
        tap(response => this.setAuthState(response)),
        catchError(this.handleAuthError('Login Failed'))
      );
  }

  signUp(data: any): Observable<LoginResponse | null> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/v1/users/signup`, data)
      .pipe(
        tap(response => this.setAuthState(response)),
        catchError(this.handleAuthError('Signup Failed'))
      );
  }

  logout(): void {
    this.removeItem(this.TOKEN_KEY);
    this.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // --- Password Management ---

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/v1/users/forgotPassword`, { email });
  }

  /**
   * @param resetToken The temporary token from the user's email URL.
   * @param passwords Object containing the new password and confirmation.
   */
  resetPassword(resetToken: string, passwords: { password: string; passwordConfirm: string }): Observable<LoginResponse | null> {
    return this.http.patch<LoginResponse>(`${this.baseUrl}/v1/users/resetPassword/${resetToken}`, passwords)
      .pipe(
        tap(response => this.setAuthState(response)),
        catchError(this.handleAuthError('Password Reset Failed'))
      );
  }

  updatePassword(data: { currentPassword: string; password: string; passwordConfirm: string }): Observable<LoginResponse | null> {
    return this.http.patch<LoginResponse>(`${this.baseUrl}/v1/users/updatePassword`, data)
      .pipe(
        tap(response => this.setAuthState(response)),
        catchError(this.handleAuthError('Password Update Failed'))
      );
  }

  // --- Private Helper Methods ---

  private setAuthState(response: LoginResponse): void {
    if (!response || !response.token || !response.data.user) return;
    
    this.setItem(this.TOKEN_KEY, response.token);
    this.setItem(this.USER_KEY, response.data.user);
    this.currentUserSubject.next(response.data.user);
  }

  private handleAuthError(operation: string) {
    return (error: any): Observable<null> => {
      this.messageService.handleResponse(error, operation, 'Invalid credentials or server error.');
      console.error(`AuthService - ${operation} error:`, error);
      return of(null);
    };
  }

  // --- LocalStorage Wrappers (Platform Safe) ---

  private setItem(key: string, value: any): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  private getItem<T>(key: string): T | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (e) {
        console.error(`Error parsing item from localStorage key: ${key}`, e);
        this.removeItem(key);
        return null;
      }
    }
    return null;
  }

  private removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }
}


// import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { BehaviorSubject, Observable, of } from 'rxjs';
// import { tap, catchError } from 'rxjs/operators';
// import { AppMessageService } from './message.service';
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
//     } else {

//     }
//   }

//   getToken(): string | null {
//     return this.userSubject.value;
//   }

//   getUser(): any {
//     return this.userDataSubject.value;
//   }

//     getUserRole(): string | null {
//     const user = this.getUser();
//     return user ? user.role : null;
//   }

//   public setItem(key: string, value: any): void {
//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.setItem(key, JSON.stringify(value));
//     } else {
//     }
//   }

//   public getItem<T>(key: string): T | null {
//     if (isPlatformBrowser(this.platformId)) {
//       try {
//         const item = localStorage.getItem(key);
//         const parsedItem = item ? JSON.parse(item) : null;

//         return parsedItem as T;
//       } catch (error) {
//         console.error(`AuthService - Error parsing key: ${key}`, error);
//         this.removeItem(key);
//         return null;
//       }
//     } else {
//       return null;
//     }
//   }

//   private removeItem(key: string): void {
//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.removeItem(key);
//     } else {

//     }
//   }

//   private getStoredToken(): { token: string | null; user: any | null } {
//     const stored = {
//       token: this.getItem<string>(this.tokenKey),
//       user: this.getItem<any>(this.userKey),
//     };
//     return stored;
//   }

//   private handleTokens(response: LoginResponse): void {
//     if (isPlatformBrowser(this.platformId)) {
//       this.setItem(this.tokenKey, response.token);
//       this.setItem(this.userKey, response.data.user);
//       this.userSubject.next(response.token);
//       this.userDataSubject.next(response.data.user);
//     } else {
//     }
//   }

//   login(data: any): Observable<LoginResponse | null> {
//     return this.http
//       .post<LoginResponse>(`${this.baseUrl}/v1/users/login`, data)
//       .pipe(
//         tap((response) => {

//           this.handleTokens(response);
//         }),
//         catchError((error) => {
//           this.messageService.handleResponse(error, 'Login Failed', 'Invalid credentials or server error.');
//           console.error('AuthService - Login error:', error);
//           return of(null);
//         })
//       );
//   }
  
//   resetPassword( data: { password: string; passwordConfirm: string }): Observable<LoginResponse | null> {
//    let token = this.getItem('authToken')
//     return this.http
//       .patch<LoginResponse>(`${this.baseUrl}/v1/users/resetPassword/${token}`, data)
//       .pipe(
//         tap((response) => {
//           this.handleTokens(response); // Log the user in after password reset
//         }),
//         catchError((error) => {
//           this.messageService.handleResponse(error, 'Reset Failed', 'Invalid token or server error.');
//           return of(null);
//         })
//       );
//   }
  
//   forgotPassword(email: string): Observable<any> {
//     return this.http.post(`${this.baseUrl}/v1/users/forgotPassword`, { email })
    
//   }
  

//   updatePassword(data: { currentPassword: string; password: string; passwordConfirm: string }): Observable<LoginResponse | null> {
//     return this.http
//       .patch<LoginResponse>(`${this.baseUrl}/v1/users/updatePassword`, data)
//       .pipe(
//         tap((response) => {this.handleTokens(response)}),
//         catchError((error) => {
//           this.messageService.handleResponse(error, 'Update Failed', 'Could not update password.');
//           console.error('AuthService - Update password error:', error);
//           return of(null);
//         })
//       );
//   }
  

//   signUp(data: any): Observable<LoginResponse | null> {
//     return this.http
//       .post<LoginResponse>(`${this.baseUrl}/v1/users/signup`, data)
//       .pipe(
//         tap((response) => {

//           this.handleTokens(response);
//         }),
//         catchError((error) => {
//           console.error('AuthService - Signup error:', error);
//           return of(null);
//         })
//       );
//   }

//   isAuthenticated(): boolean {
//     const token = this.userSubject.value;
//     const isAuth = !!token && !this.isTokenExpired(token);
//     return isAuth;
//   }

//   private isTokenExpired(token: string): boolean {
//     try {
//       const payload = JSON.parse(atob(token.split('.')[1]));
//       const isExpired = payload.exp * 1000 < Date.now();
//       return isExpired;
//     } catch (error) {
//       console.error('AuthService - Error decoding or checking token expiration:', error);
//       return true;
//     }
//   }

//   logout(): void {
//     if (isPlatformBrowser(this.platformId)) {
//       this.removeItem(this.tokenKey);
//       this.removeItem(this.userKey);
//     } else {
//     }
//     this.userSubject.next(null);
//     this.userDataSubject.next(null);
//     this.router.navigate(['/auth/login']);
//   }
// }


