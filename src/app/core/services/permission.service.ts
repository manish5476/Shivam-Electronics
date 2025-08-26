
/*
================================================================================
File: /app/core/services/permission.service.ts
================================================================================
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseApiService } from './base-api.service'; // Assuming this is the correct path

export interface Permission {
  tag: string;
  method: string;
  path: string;
  description: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'staff' | 'admin' | 'superAdmin';
  allowedRoutes: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService extends BaseApiService {
  private endpoint = '/v1/permissions';

  getAllPermissions(): Observable<{ status: string, data: Permission[] }> {
    const url = `${this.baseUrl}${this.endpoint}/all`;
    return this.http.get<{ status: string, data: Permission[] }>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllPermissions', error)));
  }

  getUsersWithPermissions(): Observable<{ status: string, data: User[] }> {
    const url = `${this.baseUrl}${this.endpoint}/users`;
    return this.http.get<{ status: string, data: User[] }>(url)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getUsersWithPermissions', error)));
  }

  updateUserPermissions(userId: string, permissions: string[]): Observable<any> {
    const url = `${this.baseUrl}${this.endpoint}/users/${userId}`;
    const body = { allowedRoutes: permissions };
    return this.http.put(url, body)
      .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateUserPermissions', error)));
  }
}


// import { Injectable } from '@angular/core';
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { BaseApiService } from './base-api.service';

// /* ==============================
//    Interfaces
//    ============================== */
// export interface Permission {
//   tag: string;
//   method: string;
//   path: string;
//   description: string;
// }

// export interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: 'user' | 'staff' | 'admin' | 'superAdmin';
//   allowedRoutes: string[];
// }

// export interface ApiResponse<T> {
//   success: boolean;
//   message: string;
//   data: T;
// }


// /* ==============================
//    Service
//    ============================== */
// @Injectable({
//   providedIn: 'root' // ensures service is app-wide singleton
// })
// export class PermissionService extends BaseApiService {
//   /** Permissions API endpoint */
//   private readonly endpoint = '/v1/permissions';

//   // constructor(protected override http: HttpClient) {
//   //   super(http);
//   // }

//   /** Get all available permissions in the system */
//   getAllPermissions(): Observable<any> {
//     const url = `${this.baseUrl}${this.endpoint}/all`;
//     return this.http.get<any>(url).pipe(
//       catchError((error: HttpErrorResponse) =>
//         this.errorhandler.handleError('getAllPermissions', error)
//       )
//     );
//   }

//   /** Fetch all users along with their assigned permissions */
//   getUsersWithPermissions(): Observable<any> {
//     const url = `${this.baseUrl}${this.endpoint}/users`;
//     return this.http.get<any>(url).pipe(
//       catchError((error: HttpErrorResponse) =>
//         this.errorhandler.handleError('getUsersWithPermissions', error)
//       )
//     );
//   }

//   /** Update permissions for a given user */
//   updateUserPermissions(userId: string, permissions: string[]): Observable<ApiResponse<User>> {
//     const url = `${this.baseUrl}${this.endpoint}/users/${userId}`;
//     const body = { allowedRoutes: permissions };

//     return this.http.put<ApiResponse<User>>(url, body).pipe(
//       catchError((error: HttpErrorResponse) =>
//         this.errorhandler.handleError('updateUserPermissions', error)
//       )
//     );
//   }
// }


// // import { Injectable } from '@angular/core';
// // import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// // import { Observable } from 'rxjs';
// // import { catchError } from 'rxjs/operators';
// // import { BaseApiService } from './base-api.service'; // Adjust path to your BaseApiService

// // // Define interfaces for your data for type safety
// // export interface Permission {
// //   tag: string;
// //   method: string;
// //   path: string;
// //   description: string;
// // }

// // export interface User {
// //   _id: string;
// //   name: string;
// //   email: string;
// //   role: 'user' | 'staff' | 'admin' | 'superAdmin';
// //   allowedRoutes: string[];
// // }

// // @Injectable()
// // export class PermissionService extends BaseApiService {
// //   // The specific path for the permissions API
// //   private endpoint = '/v1/permissions';

// //   getAllPermissions(): Observable<{ status: string, data: Permission[] }> {
// //     const url = `${this.baseUrl}${this.endpoint}/all`;
// //     return this.http.get<{ status: string, data: Permission[] }>(url)
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getAllPermissions', error)));
// //   }

// //   getUsersWithPermissions(): Observable<{ status: string, data: User[] }> {
// //     const url = `${this.baseUrl}${this.endpoint}/users`;
// //     return this.http.get<{ status: string, data: User[] }>(url)
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('getUsersWithPermissions', error)));
// //   }

// //   updateUserPermissions(userId: string, permissions: string[]): Observable<any> {
// //     const url = `${this.baseUrl}${this.endpoint}/users/${userId}`;
// //     const body = { allowedRoutes: permissions };
// //     return this.http.put(url, body)
// //       .pipe(catchError((error: HttpErrorResponse) => this.errorhandler.handleError('updateUserPermissions', error)));
// //   }
// // }

