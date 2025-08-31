import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service'; // Adjust path
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="card max-w-md mx-auto p-6">
      <h2 class="text-xl font-bold mb-4">Forgot Password</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label class="block mb-2">Email</label>
        <input type="email" formControlName="email" class="p-inputtext p-component w-full mb-4" />

        <button pButton type="submit" label="Send Reset Link" [disabled]="form.invalid || loading"></button>
      </form>

      <p *ngIf="message" class="mt-4 text-green-600">{{ message }}</p>
    </div>
  `
})
export class ForgotPasswordComponent {
  form!: FormGroup;
  loading = false;
  message = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private msg: MessageService) {
    // ✅ Now fb is available
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    this.auth.forgotPassword(this.form.value.email!).subscribe({
      next: () => {
        this.message = 'Password reset link sent to your email.';
        this.loading = false;
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to send reset link.' });
        this.loading = false;
      }
    });
  }
}
