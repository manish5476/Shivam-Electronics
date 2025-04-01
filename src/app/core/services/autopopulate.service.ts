// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { environment } from '../../../environments/environment';
// import { ErrorhandlingService } from './errorhandling.service';

// @Injectable({ providedIn: 'root' })
// export class AutopopulateService {
//   private baseUrl = environment.apiUrl;

//   constructor(private http: HttpClient, private errorhandler: ErrorhandlingService) {}

//   getAutopopulateData(): Observable<any> {
//     return this.http.get(`${this.baseUrl}/v1/products/autopopulate`).pipe(
//       catchError((error) => this.errorhandler.handleError('getAutopopulateData', error))
//     );
//   }
// }

// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject, Observable, of } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { environment } from '../../../environments/environment';
// import { ErrorhandlingService } from './errorhandling.service';

// @Injectable({ providedIn: 'root' })
// export class AutopopulateService {
//   private baseUrl = environment.apiUrl;
//   private autopopulateData$ = new BehaviorSubject<any>(null); // Store data in a BehaviorSubject

//   constructor(private http: HttpClient, private errorhandler: ErrorhandlingService) {
//     this.refreshAutopopulateData(); // Initial data fetch
//   }

//   getAutopopulateData(): Observable<any> {
//     return this.autopopulateData$.asObservable();
//   }

//   refreshAutopopulateData(): void {
//     this.http.get(`${this.baseUrl}/v1/products/autopopulate`).pipe(
//       catchError((error) => {
//         this.errorhandler.handleError('getAutopopulateData', error);
//         return of(null); // Return null or a default value on error
//       })
//     ).subscribe((res) => {
//       if (res && res.data) {
//         this.autopopulateData$.next(res.data);
//       }
//     });
//   }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ErrorhandlingService } from './errorhandling.service';

// Define the interface (or import it)
interface AutopopulateResponse {
  data: any; // Replace 'any' with a more specific type if possible!
}

@Injectable({ providedIn: 'root' })
export class AutopopulateService {
  private baseUrl = environment.apiUrl;
  // Consider typing the BehaviorSubject more specifically if you know the type of 'data'
  // private autopopulateData$ = new BehaviorSubject<SpecificDataType[] | null>(null);
  private autopopulateData$ = new BehaviorSubject<any>(null); // Store data in a BehaviorSubject

  constructor(private http: HttpClient, private errorhandler: ErrorhandlingService) {
    this.refreshAutopopulateData(); // Initial data fetch
  }

  getAutopopulateData(): Observable<any> { // Also consider updating the return type here
    return this.autopopulateData$.asObservable();
  }

  refreshAutopopulateData(): void {
    // Use the interface as the generic type for http.get
    this.http.get<AutopopulateResponse>(`${this.baseUrl}/v1/products/autopopulate`).pipe(
      catchError((error) => {
        this.errorhandler.handleError('getAutopopulateData', error);
        return of(null); // Return null or a default value on error
      })
    ).subscribe((res) => {
      // Now TypeScript knows 'res' can be null (from catchError) or AutopopulateResponse
      // And AutopopulateResponse has a 'data' property.
      if (res && res.data) { // No more error here!
        this.autopopulateData$.next(res.data);
      } else if (res === null) {
         // Handle the error case if necessary, maybe clear the BehaviorSubject
         // this.autopopulateData$.next(null); // Or keep the previous value
      }
      // Optional: Handle the case where 'res' is received but 'res.data' is missing/falsy
      // else if (res) {
      //    console.warn('Autopopulate response received, but missing data property:', res);
      //    // Decide how to handle this - clear data? Keep old data?
      // }
    });
  }
}