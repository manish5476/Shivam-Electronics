import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // Use the isAuthenticated$ observable
    return this.authService.isAuthenticated$.pipe(
      take(1), // Take the first value and complete
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          // Redirect to login if not authenticated
          this.router.navigate(['/auth/login']);
          return false;
        }
      })
    );
  }
}