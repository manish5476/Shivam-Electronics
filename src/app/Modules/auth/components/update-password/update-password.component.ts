// update-password.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="card max-w-md mx-auto p-6">
      <h2 class="text-xl font-bold mb-4">Update Password</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        
        <label class="block mb-2">Current Password</label>
        <input type="password" formControlName="currentPassword" class="p-inputtext p-component w-full mb-4" />
        <small *ngIf="form.get('currentPassword')?.touched && form.get('currentPassword')?.invalid" class="p-error">
          Current password is required
        </small>

        <label class="block mb-2">New Password</label>
        <input type="password" formControlName="password" class="p-inputtext p-component w-full mb-4" />
        <small *ngIf="form.get('password')?.touched && form.get('password')?.hasError('minlength')" class="p-error">
          Password must be at least 6 characters
        </small>

        <label class="block mb-2">Confirm Password</label>
        <input type="password" formControlName="passwordConfirm" class="p-inputtext p-component w-full mb-4" />
        <small *ngIf="form.hasError('passwordMismatch') && form.get('passwordConfirm')?.touched" class="p-error">
          Passwords do not match
        </small>

        <button pButton type="submit" label="Update Password" [disabled]="form.invalid || loading"></button>
      </form>
    </div>
  `
})
export class UpdatePasswordComponent {
  loading = false;
  form!: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private msg: MessageService) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        passwordConfirm: ['', Validators.required]
      },
      { validators: this.passwordsMatchValidator }
    );
  }

  private passwordsMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('passwordConfirm')?.value;
    return pass === confirm ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    // only send required fields to backend
    const { currentPassword, password, passwordConfirm } = this.form.value;

    this.auth.updateUserPassword({ currentPassword, password, passwordConfirm }).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Success', detail: 'Password updated successfully.' });
        this.loading = false;
        this.form.reset();
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to update password.' });
        this.loading = false;
      }
    });
  }
}
