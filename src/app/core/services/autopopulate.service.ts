import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ErrorhandlingService } from './errorhandling.service';

@Injectable({ providedIn: 'root' })
export class AutopopulateService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private errorhandler: ErrorhandlingService) {}

  getAutopopulateData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/v1/products/autopopulate`).pipe(
      catchError((error) => this.errorhandler.handleError('getAutopopulateData', error))
    );
  }
}
