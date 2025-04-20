
// import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
// import { CanActivate, Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';
// import { isPlatformBrowser } from '@angular/common';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard implements CanActivate {
//   constructor(
//     private authService: AuthService,
//     private router: Router,
//     @Inject(PLATFORM_ID) private platformId: Object // Inject platform ID
//   ) { }

//   canActivate(): boolean {
//     if (isPlatformBrowser(this.platformId)) {
//       const token = localStorage.getItem('authToken'); // Only access localStorage in the browser
//     
//     }
//     if (this.authService.isAuthenticated()) {
//     
//       return true;
//     } else {
//     
//       // this.authService.logout()
//       this.router.navigate(['/auth/login']);
//       return false;
//     }
//   }
// }

import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Inject platform ID
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let isAuthenticatedResult = this.authService.isAuthenticated();
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken'); // Only access localStorage in the browser
    }
    if (isAuthenticatedResult) {
      return true;
    } else {
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
