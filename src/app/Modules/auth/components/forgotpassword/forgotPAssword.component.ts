import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../core/services/auth.service';
import { LoadingService } from '../../../../core/services/loading.service';
import { MessageService } from 'primeng/api';

// --- PrimeNG UI Modules ---
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule
  ],
  template: `
    <div class="card max-w-md mx-auto p-6">
      <h2 class="text-xl font-bold mb-4">Forgot Password</h2>
      <p class="mb-4 text-gray-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label class="block mb-2">Email</label>
        <input
          type="email"
          pInputText
          formControlName="email"
          class="p-inputtext p-component w-full mb-4"
        />
        <small
          *ngIf="email?.invalid && (email?.dirty || email?.touched)"
          class="p-error block mb-4"
        >
          A valid email is required.
        </small>

        <button
          pButton
          type="submit"
          label="Send Reset Link"
          [disabled]="form.invalid || loading"
        ></button>
      </form>
    </div>
  `
})
export class ForgotPasswordComponent {
  form!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private loadingService: LoadingService,
    private msg: MessageService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.form.get('email');
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.loadingService.show();

    this.auth.forgotPassword(this.email!.value)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.loadingService.hide();
        })
      )
      .subscribe({
        next: () => {
          this.msg.add({
            severity: 'success',
            summary: 'Email Sent',
            detail: 'Password reset link has been sent to your email.'
          });
          this.form.reset();
        },
        error: () => {
          this.msg.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to send reset link. Please try again.'
          });
        }
      });
  }
}
