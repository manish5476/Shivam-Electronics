



////////////////////////////////////////////////////////
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AutopopulateService extends BaseApiService {
  private masterCache: { [module: string]: BehaviorSubject<any[]> } = {};

  getModuleData(module: string): Observable<any[]> {
    const key = module.toLowerCase();
    if (!this.masterCache[key]) {
      this.masterCache[key] = new BehaviorSubject<any[]>([]);
      this.fetchModuleData(key); // lazy fetch
    }
    return this.masterCache[key].asObservable();
  }

  refreshModuleData(module: string): void {
    const key = module.toLowerCase();
    if (!this.masterCache[key]) {
      this.masterCache[key] = new BehaviorSubject<any[]>([]);
    }
    this.fetchModuleData(key);
  }

  /**
   * Live search (no caching)
   */
  searchModuleData(module: string, query: string): Observable<any[]> {
    const url = `${this.baseUrl}/v1/master-list/search/${module}?search=${encodeURIComponent(query)}`;
    return this.http.get<{ data: any[] }>(url).pipe(
      map(response => response.data || []), // ✅ Extract only the data array
      catchError((error: HttpErrorResponse) => {
        this.errorhandler.handleError(`Search ${module}`, error);
        return of([]); // Keeps return type Observable<any[]>
      })
    );
  }
  

  /**
   * Internal fetch method (with caching)
   */
  private fetchModuleData(module: string): void {
    const url = `${this.baseUrl}/v1/master-list/${module}`;
    this.http.get<{ data: any[] }>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        this.errorhandler.handleError(`Fetch ${module} data`, error);
        return of({ data: [] });
      }),
      tap(response => {
        this.masterCache[module]?.next(response.data || []);
      })
    ).subscribe();
  }

loadAllModulesData(): void {
  const modules = ['products', 'users', 'customers', 'sellers', 'payments', 'invoices', 'orders'];

  modules.forEach(module => {
    this.refreshModuleData(module); // triggers fetch for each module
  });
}

getAllModulesData(): Observable<{ [key: string]: any[] }> {
  const modules = ['products', 'users', 'customers', 'sellers', 'payments', 'invoices', 'orders'];

  const requests = modules.reduce((acc, module) => {
    acc[module] = this.http.get<{ data: any[] }>(`${this.baseUrl}/v1/master-list/${module}`).pipe(
      map(res => res.data || []),
      catchError(() => of([])) // Prevent one failure from breaking all
    );
    return acc;
  }, {} as { [key: string]: Observable<any[]> });

  return forkJoin(requests); // emits { products: [...], users: [...], ... }
}
// use like
// this.autopopulateService.getAllModulesData().subscribe(result => {
//   this.allAutopopulateData = result;
//   this.products = result.products;
//   this.customers = result.customers;
// });







}


/**import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of, Subject, timer } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { HttpErrorResponse } from '@angular/common/http';

interface ModuleConfig {
  name: string;
  ttl?: number; // cache expiration in ms
}

@Injectable({ providedIn: 'root' })
export class AutopopulateService extends BaseApiService {
  private masterCache: { [module: string]: BehaviorSubject<any[]> } = {};
  private refreshTriggers: { [module: string]: Subject<void> } = {};
  private lastFetched: { [module: string]: number } = {};

  // Central module config: extend this instead of hardcoding everywhere
  private readonly modules: ModuleConfig[] = [
    { name: 'products', ttl: 5 * 60 * 1000 }, // cache 5 min
    { name: 'users' },
    { name: 'customers', ttl: 3 * 60 * 1000 },
    { name: 'sellers' },
    { name: 'payments' },
    { name: 'invoices' },
  ];

  constructor() {
    super();
  }

  
  getModuleData(module: string): Observable<any[]> {
    const key = module.toLowerCase();

    // Initialize cache & refresh trigger if missing
    if (!this.masterCache[key]) {
      this.masterCache[key] = new BehaviorSubject<any[]>([]);
      this.refreshTriggers[key] = new Subject<void>();

      this.refreshTriggers[key]
        .pipe(
          switchMap(() => this.fetchModuleData(key)),
          catchError(() => of([]))
        )
        .subscribe(data => {
          this.lastFetched[key] = Date.now();
          this.masterCache[key].next(data);
        });
    }

    // Auto-refresh if TTL expired
    const config = this.modules.find(m => m.name === key);
    const ttl = config?.ttl;
    if (!this.lastFetched[key] || (ttl && Date.now() - this.lastFetched[key] > ttl)) {
      this.refreshModuleData(key);
    }

    return this.masterCache[key].asObservable().pipe(shareReplay(1));
  }

  refreshModuleData(module: string): void {
    const key = module.toLowerCase();
    this.refreshTriggers[key]?.next();
  }

 
  refreshAllModules(): void {
    this.modules.forEach(m => this.refreshModuleData(m.name));
  }

  searchModuleData(module: string, query: string): Observable<any[]> {
    const url = `${this.baseUrl}/v1/master-list/search/${module}?search=${encodeURIComponent(query)}`;
    return this.http.get<{ data: any[] }>(url).pipe(
      map(response => response.data || []),
      catchError((error: HttpErrorResponse) => {
        this.errorhandler.handleError(`Search ${module}`, error);
        return of([]);
      })
    );
  }

  
  private fetchModuleData(module: string): Observable<any[]> {
    const url = `${this.baseUrl}/v1/master-list/${module}`;
    return this.http.get<{ data: any[] }>(url).pipe(
      map(res => res.data || []),
      catchError((error: HttpErrorResponse) => {
        this.errorhandler.handleError(`Fetch ${module} data`, error);
        return of([]);
      })
    );
  }

 
  getAllModulesData(): Observable<{ [key: string]: any[] }> {
    const requests = this.modules.reduce((acc, m) => {
      acc[m.name] = this.fetchModuleData(m.name);
      return acc;
    }, {} as { [key: string]: Observable<any[]> });

    return forkJoin(requests);
  }

  notifyModuleUpdated(module: string): void {
    this.refreshModuleData(module);
  }
} */