import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AutopopulateDataService {

  private apiUrl = 'https://api.example.com/all-data'; // Replace with your API URL

  private dataSubject = new BehaviorSubject<any>(this.getLocalData());
  data$ = this.dataSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Fetch data from API and store in localStorage
  fetchData() {
    return this.http.get<any>(this.apiUrl).pipe(
      tap(data => {
        localStorage.setItem('appData', JSON.stringify(data)); // Store in localStorage
        this.dataSubject.next(data); // Update subscribers
      })
    );
  }

  // Get data from localStorage
  getLocalData(): any {
    const storedData = localStorage.getItem('appData');
    return storedData ? JSON.parse(storedData) : null;
  }

  // Get users from stored data
  getUsers() {
    const data = this.getLocalData();
    return data?.users || [];
  }

  // Get products from stored data
  getProducts() {
    const data = this.getLocalData();
    return data?.products || [];
  }

  // Filter users by name
  filterUsers(searchTerm: string) {
    const users = this.getUsers();
    return users.filter((user: any) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Filter products by category
  filterProducts(category: string) {
    const products = this.getProducts();
    return products.filter((product: any) => product.category === category);
  }
}

/*// import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import { isPlatformBrowser } from '@angular/common';

// @Injectable({
//   providedIn: 'root'
// })
// export class AutopopulateDataService {
//   private autopopulateSubject = new BehaviorSubject<any>(null);
//   autopopulate$ = this.autopopulateSubject.asObservable(); // Expose as observable

//   constructor(
//     private http: HttpClient,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {
//     this.loadAutoPopulateData(); // Load existing local data when service initializes
//   }

//   getAutoPopulateData() {
//     return this.http.get<{ data: any }>('YOUR_API_ENDPOINT_HERE');
//   }


//   fetchAndStoreAutoPopulateData() {
//     if (isPlatformBrowser(this.platformId)) {
//       this.getAutoPopulateData().subscribe(
//         (res) => {
//           localStorage.setItem('autopopulate', JSON.stringify(res.data));
//           this.autopopulateSubject.next(res.data); // Update observable
//         },
//         (error) => {
//           console.error('Error fetching auto-populate data:', error);
//         }
//       );
//     }
//   }

//   /**
//    * Load existing data from localStorage if available
//    */
//   private loadAutoPopulateData() {
//     if (isPlatformBrowser(this.platformId)) {
//       const storedData = localStorage.getItem('autopopulate');
//       if (storedData) {
//         this.autopopulateSubject.next(JSON.parse(storedData));
//       }
//     }
//   }

//   // private apiUrl = 'https://api.example.com/all-data'; // Replace with your API URL

//   private dataSubject = new BehaviorSubject<any>(this.getLocalData());
//   data$ = this.dataSubject.asObservable();


//   // Fetch data from API and store in localStorage
//   fetchData() {
//     return this.http.get<any>(this.apiUrl).pipe(
//       tap(data => {
//         localStorage.setItem('appData', JSON.stringify(data)); // Store in localStorage
//         this.dataSubject.next(data); // Update subscribers
//       })
//     );
//   }

//   // Get data from localStorage
//   getLocalData(): any {
//     const storedData = localStorage.getItem('appData');
//     return storedData ? JSON.parse(storedData) : null;
//   }

//   // Get users from stored data
//   getUsers() {
//     const data = this.getLocalData();
//     return data?.users || [];
//   }

//   // Get products from stored data
//   getProducts() {
//     const data = this.getLocalData();
//     return data?.products || [];
//   }

//   // Filter users by name
//   filterUsers(searchTerm: string) {
//     const users = this.getUsers();
//     return users.filter((user: any) =>
//       user.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }

//   // Filter products by category
//   filterProducts(category: string) {
//     const products = this.getProducts();
//     return products.filter((product: any) => product.category === category);
//   }
// }

// import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { BehaviorSubject } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import { isPlatformBrowser } from '@angular/common';

// @Injectable({
//   providedIn: 'root'
// })
// export class AutopopulateDataService {
//   private apiUrl = 'YOUR_API_ENDPOINT_HERE'; // Set your API URL

//   private dataSubject = new BehaviorSubject<any>(this.getLocalData());
//   data$ = this.dataSubject.asObservable();

//   constructor(
//     private http: HttpClient,
//     @Inject(PLATFORM_ID) private platformId: Object
//   ) {
//     this.loadData();
//   }


//   fetchData() {
//     if (!isPlatformBrowser(this.platformId)) return;

//     return this.http.get<{ data: any }>(this.apiUrl).pipe(
//       tap(res => {
//         localStorage.setItem('appData', JSON.stringify(res.data));
//         this.dataSubject.next(res.data);
//       })
//     );
//   }


//   private loadData() {
//     if (!isPlatformBrowser(this.platformId)) return;

//     const storedData = this.getLocalData();
//     if (storedData) {
//       this.dataSubject.next(storedData);
//     } else {
//       this.fetchData()?.subscribe();
//     }
//   }

//   private getLocalData(): any {
//     if (!isPlatformBrowser(this.platformId)) return null;

//     const storedData = localStorage.getItem('appData');
//     return storedData ? JSON.parse(storedData) : null;
//   }


//   getUsers() {
//     return this.dataSubject.getValue()?.users || [];
//   }


//   getProducts() {
//     return this.dataSubject.getValue()?.products || [];
//   }


//   filterUsers(searchTerm: string) {
//     return this.getUsers().filter((user: any) =>
//       user.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }


//   filterProducts(category: string) {
//     return this.getProducts().filter((product: any) => product.category === category);
//   }
// }
// */