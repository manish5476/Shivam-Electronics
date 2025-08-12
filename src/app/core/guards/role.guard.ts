// import { AuthService } from '../services/auth.service';
// role.guard.ts// role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredRoles = route.data['roles'] as string[];
    const userRole = this.authService.getUserRole();

    if (!userRole) {
      return this.router.createUrlTree(['/auth/login']);
    }

    if (requiredRoles && requiredRoles.includes(userRole)) {
      return true;
    }
    return this.router.createUrlTree(['/unauthorized']);
  }
}