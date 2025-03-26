import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApigethandlerService {
  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  /**
   * Generic method to fetch data with optional filters
   * @param endpoint API endpoint (e.g., 'products', 'users')
   * @param filterParams Optional filter parameters
   */

  getData<T>(endpoint: string, filterParams?: any): Observable<T> {
    let params = new HttpParams();

    if (filterParams) {
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] !== undefined && filterParams[key] !== null) {
          params = params.set(key, filterParams[key]);
        }
      });
    }

    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params })
      .pipe(catchError((error) => {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
      }));
  }
}
