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

  /**
   * Manually refresh specific module
   */
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


// 



loadAllModulesData(): void {
  const modules = ['products', 'users', 'customers', 'sellers', 'payments', 'invoices', 'orders'];

  modules.forEach(module => {
    this.refreshModuleData(module); // triggers fetch for each module
  });
}
// use like 
// this.autopopulateService.loadAllModulesData();


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



// ngOnInit(): void {
//   this.autoService.getModuleData('products').subscribe((data:any) => {
//     this.productOptions = data;
//   });

//   this.autoService.getModuleData('customers').subscribe((data:any) => {
//     this.customerOptions = data;
//   });
// }

// // Refresh after data changes
// this.autoService.refreshModuleData('products');

// // Search
// this.autoService.searchModuleData('customers', 'john')
//   .subscribe(results => this.filteredCustomers = results);
