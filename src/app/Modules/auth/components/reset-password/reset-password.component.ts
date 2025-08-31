// reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service'; // Adjust path
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="card max-w-md mx-auto p-6">
      <h2 class="text-xl font-bold mb-4">Reset Password</h2>
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <label class="block mb-2">New Password</label>
        <input type="password" formControlName="password" class="p-inputtext p-component w-full mb-4" />

        <label class="block mb-2">Confirm Password</label>
        <input type="password" formControlName="passwordConfirm" class="p-inputtext p-component w-full mb-4" />

        <button pButton type="submit" label="Reset Password" [disabled]="form.invalid || loading"></button>
      </form>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  
  resetToken!: string;
  loading = false;
  form!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private msg: MessageService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirm: ['', [Validators.required]]
  });
    this.resetToken = this.route.snapshot.paramMap.get('token')!;
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;

    this.auth.resetPassword(this.resetToken, this.form.value).subscribe({
      next: () => {
        this.msg.add({ severity: 'success', summary: 'Success', detail: 'Password reset successfully.' });
        this.router.navigate(['/login']);
      },
      error: () => {
        this.msg.add({ severity: 'error', summary: 'Error', detail: 'Password reset failed.' });
        this.loading = false;
      }
    });
  }
}

// import { Component, OnInit } from '@angular/core'; // Import OnInit
// import { RouterModule, Router } from '@angular/router';
// import { AuthService } from '../../../../core/services/auth.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import ReactiveFormsModule, FormBuilder, FormGroup, Validators
// import { AppMessageService } from '../../../../core/services/message.service';
// @Component({
//   selector: 'app-reset-password',
//   imports: [],
//   templateUrl: './reset-password.component.html',
//   styleUrl: './reset-password.component.css'
// })
// export class ResetPasswordComponent {
//     public errorMessage: string | null = null;

//     constructor(
//         private auth: AuthService,
//         private router: Router,
//         private messageService: AppMessageService,
//         private fb: FormBuilder // Inject FormBuilder
//     ) {
//     }

// }
