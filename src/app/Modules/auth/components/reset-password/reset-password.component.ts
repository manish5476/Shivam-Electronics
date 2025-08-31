import { AppMessageService } from '../../../../core/services/message.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 class="text-xl font-bold mb-4">Reset Password</h2>
      
      <form [formGroup]="resetForm" (ngSubmit)="onSubmit()">
        <div class="mb-3">
          <label class="block text-sm font-medium">New Password</label>
          <input type="password" formControlName="password" class="w-full p-2 border rounded" />
        </div>

        <div class="mb-3">
          <label class="block text-sm font-medium">Confirm Password</label>
          <input type="password" formControlName="confirmPassword" class="w-full p-2 border rounded" />
        </div>

        <button 
          type="submit" 
          class="w-full bg-blue-600 text-white py-2 rounded mt-3"
          [disabled]="resetForm.invalid">
          Reset Password
        </button>
      </form>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  token!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token')!;
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.resetForm.invalid) return;

    const { password, confirmPassword } = this.resetForm.value;
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    this.authService.resetPassword(this.token, password).subscribe({
      next: () => {
        alert('Password reset successful! Please login.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        alert(err.error.message || 'Failed to reset password');
      }
    });
  }
}
