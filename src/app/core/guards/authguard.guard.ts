
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
//       console.log('AuthGuard Check - Token Present:', !!token);
//     }
//     if (this.authService.isAuthenticated()) {
//       console.log('User authenticated, allowing access');
//       return true;
//     } else {
//       console.log('User not authenticated, redirecting to login');
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
    console.log('AuthGuard - Attempting to access:', state.url);
    let isAuthenticatedResult = this.authService.isAuthenticated();
    console.log('AuthGuard - isAuthenticated() result:', isAuthenticatedResult);

    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('authToken'); // Only access localStorage in the browser
      console.log('AuthGuard - Token in localStorage:', !!token);
    }

    if (isAuthenticatedResult) {
      console.log('AuthGuard - User authenticated, allowing access to:', state.url);
      return true;
    } else {
      console.log('AuthGuard - User not authenticated, redirecting to login from:', state.url);
      this.router.navigate(['/auth/login']);
      return false;
    }
  }
}
