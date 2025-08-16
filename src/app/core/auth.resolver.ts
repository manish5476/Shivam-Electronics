

import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthResolver implements Resolve<boolean> {
  constructor(private authService: AuthService, private router: Router) {}

  resolve(): Observable<boolean> {
    // Use the isAuthenticated$ observable
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        }
        this.router.navigate(['/auth/login']);
        return false;
      })
    );
  }
}
// import { Injectable } from '@angular/core';
// import { Resolve, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
// import { AuthService } from './services/auth.service';
// import { Observable, of } from 'rxjs';
// import { catchError, map } from 'rxjs/operators';

// @Injectable({ providedIn: 'root' })
// export class AuthResolver implements Resolve<boolean> {
//   constructor(private authService: AuthService, private router: Router) {}

//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
//     return of(this.authService.isAuthenticated()).pipe(
//       map(isAuthenticated => {
//         if (isAuthenticated) {
//           return true;
//         } else {
//           this.router.navigate(['/auth/login']);
//           return false;
//         }
//       }),
//       catchError(() => {
//         this.router.navigate(['/auth/login']);
//         return of(false);
//       })
//     );
//   }
// }