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

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private messageService: AppMessageService,
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const user = this.getItem<User>(this.USER_KEY);
    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
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
    return this.http.post<LoginResponse>(`${this.baseUrl}/v1/users/login`, data).pipe(
      tap(response => this.setAuthState(response)),
      catchError(this.handleAuthError('Login Failed'))
    );
  }

  signUp(data: any): Observable<LoginResponse | null> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/v1/users/signup`, data).pipe(
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
    return this.http.post(`${this.baseUrl}/v1/users/forgotPassword`, { email }).pipe(
      tap((res: any) => {
        this.messageService.showSuccess('Password Reset Email Sent', res.message || 'Check your inbox for reset instructions.');
      }),
      catchError(this.handleAuthError('Forgot Password Failed'))
    );
  }

  resetPassword(resetToken: string, passwords: { password: string; passwordConfirm: string }): Observable<LoginResponse | null> {
    return this.http.patch<LoginResponse>(`${this.baseUrl}/v1/users/resetPassword/${resetToken}`, passwords).pipe(
      tap(response => {
        this.setAuthState(response);
        this.messageService.showSuccess('Password Reset Successful', 'You can now log in with your new password.');
      }),
      catchError(this.handleAuthError('Password Reset Failed'))
    );
  }

  updateUserPassword(data: { currentPassword: string; password: string; passwordConfirm: string }): Observable<LoginResponse | null> {
    return this.http.patch<LoginResponse>(`${this.baseUrl}/v1/users/updatePassword`, data).pipe(
      tap(response => {
        this.setAuthState(response);
        this.messageService.showSuccess('Password Updated', 'Your password has been changed successfully.');
      }),
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

  // --- LocalStorage Wrappers ---
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
// import { tap, catchError, map } from 'rxjs/operators';
// import { AppMessageService } from './message.service';
// import { environment } from '../../../environments/environment';

// export interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   // Add any other user properties you need
// }

// export interface LoginResponse {
//   token: string;
//   data: {
//     user: User;
//   };
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private readonly TOKEN_KEY = 'authToken';
//   private readonly USER_KEY = 'currentUser';
//   private baseUrl = environment.apiUrl;

//   // Use a single BehaviorSubject for the user object
//   private currentUserSubject: BehaviorSubject<User | null>;
//   public currentUser$: Observable<User | null>;
//   public isAuthenticated$: Observable<boolean>;

//   constructor(
//     private messageService: AppMessageService,
//     private http: HttpClient,
//     private router: Router,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {
//     // Initialize subjects from localStorage
//     const user = this.getItem<User>(this.USER_KEY);
//     this.currentUserSubject = new BehaviorSubject<User | null>(user);
//     this.currentUser$ = this.currentUserSubject.asObservable();
    
//     // Create a reactive stream for the authentication status
//     this.isAuthenticated$ = this.currentUser$.pipe(map(user => !!user));
//   }

//   // --- Public Getters ---
  
//   public get currentUserValue(): User | null {
//     return this.currentUserSubject.value;
//   }

//   public getToken(): string | null {
//     return this.getItem<string>(this.TOKEN_KEY);
//   }
  
//   public getUserRole(): string | null {
//     return this.currentUserValue?.role || null;
//   }

//   // --- Core Auth Methods ---

//   login(data: any): Observable<LoginResponse | null> {
//     return this.http.post<LoginResponse>(`${this.baseUrl}/v1/users/login`, data)
//       .pipe(
//         tap(response => this.setAuthState(response)),
//         catchError(this.handleAuthError('Login Failed'))
//       );
//   }

//   signUp(data: any): Observable<LoginResponse | null> {
//     return this.http.post<LoginResponse>(`${this.baseUrl}/v1/users/signup`, data)
//       .pipe(
//         tap(response => this.setAuthState(response)),
//         catchError(this.handleAuthError('Signup Failed'))
//       );
//   }

//   logout(): void {
//     this.removeItem(this.TOKEN_KEY);
//     this.removeItem(this.USER_KEY);
//     this.currentUserSubject.next(null);
//     this.router.navigate(['/auth/login']);
//   }

//   // --- Password Management ---
//   forgotPassword(email: string): Observable<any> {
//     return this.http.post(`${this.baseUrl}/v1/users/forgotPassword`, { email });
//   }

//   /**
//    * @param resetToken The temporary token from the user's email URL.
//    * @param passwords Object containing the new password and confirmation.
//    */
//   resetPassword(resetToken: string, passwords: { password: string; passwordConfirm: string }): Observable<LoginResponse | null> {
//     return this.http.patch<LoginResponse>(`${this.baseUrl}/v1/users/resetPassword/${resetToken}`, passwords)
//       .pipe(
//         tap(response => this.setAuthState(response)),
//         catchError(this.handleAuthError('Password Reset Failed'))
//       );
//   }

//   updatePassword(data: { currentPassword: string; password: string; passwordConfirm: string }): Observable<LoginResponse | null> {
//     return this.http.patch<LoginResponse>(`${this.baseUrl}/v1/users/updatePassword`, data)
//       .pipe(
//         tap(response => this.setAuthState(response)),
//         catchError(this.handleAuthError('Password Update Failed'))
//       );
//   }

//   // --- Private Helper Methods ---

//   private setAuthState(response: LoginResponse): void {
//     if (!response || !response.token || !response.data.user) return;
    
//     this.setItem(this.TOKEN_KEY, response.token);
//     this.setItem(this.USER_KEY, response.data.user);
//     this.currentUserSubject.next(response.data.user);
//   }

//   private handleAuthError(operation: string) {
//     return (error: any): Observable<null> => {
//       this.messageService.handleResponse(error, operation, 'Invalid credentials or server error.');
//       console.error(`AuthService - ${operation} error:`, error);
//       return of(null);
//     };
//   }

//   // --- LocalStorage Wrappers (Platform Safe) ---

//   private setItem(key: string, value: any): void {
//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.setItem(key, JSON.stringify(value));
//     }
//   }

//   private getItem<T>(key: string): T | null {
//     if (isPlatformBrowser(this.platformId)) {
//       try {
//         const item = localStorage.getItem(key);
//         return item ? JSON.parse(item) : null;
//       } catch (e) {
//         console.error(`Error parsing item from localStorage key: ${key}`, e);
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
// }
