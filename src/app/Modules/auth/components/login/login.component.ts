import { Component, inject, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service'; // adjust path if needed
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AppMessageService } from '../../../../core/services/message.service'; // adjust path if needed
import { Subscription } from 'rxjs';
import { NoteService } from '../../../../core/services/notes.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { LoginSummaryDialogComponent } from '../loginsummary/loginsummary.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [DialogService],
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public errorMessage: string | null = null;
  isSubmitting = false;
  showPassword = false; // <--- added here
  private loginSub: Subscription | null = null;
  private noteService = inject(NoteService);
  loginSummary: any;
  constructor(
    private dialogService: DialogService,
    private auth: AuthService,
    private router: Router,
    private messageService: AppMessageService,
    private fb: FormBuilder,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.messageService.showError(
        'Validation Error',
        'Please fill out the form correctly.',
      );
      return;
    }

    this.isSubmitting = true;
    const loginDetails = this.loginForm.value;

    this.loginSub = this.auth.login(loginDetails).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        if (response?.token && response?.data?.user) {
          const user = response.data.user;

          this.messageService.handleResponse(
            'success',
            'Login Successful',
            `Welcome ${user.name}`,
          );

          // Load summary after login
          this.loadLoginSummary();

          // Navigate based on role
          switch (user.role) {
            case 'admin':
            case 'superAdmin':
              this.router.navigate(['/admin/dashboard']);
              break;
            case 'user':
              this.router.navigate(['/home']);
              break;
            default:
              this.router.navigate(['/home']);
          }
        } else {
          this.messageService.showError(
            'Login Failed',
            'Invalid credentials. Please try again.',
          );
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Login Error:', err);
        this.messageService.handleError(err, 'Login Failed');
      },
    });
  }
  // onLogin() {
  //   if (this.loginForm.invalid) {
  //     this.loginForm.markAllAsTouched();
  //     this.messageService.showError('Validation Error', 'Please fill out the form correctly.');
  //     return;
  //   }

  //   this.isSubmitting = true;
  //   const loginDetails = this.loginForm.value;

  //   this.loginSub = this.auth.login(loginDetails).subscribe({
  //     next: (response) => {
  //       this.isSubmitting = false;

  //       if (response?.token && response?.data?.user) {
  //         const user = response.data.user;

  //         this.messageService.handleResponse(
  //           'success',
  //           'Login Successful',
  //           `Welcome ${user.name}`
  //         );

  //         // Role-based navigation
  //         switch (user.role) {
  //           case 'admin':
  //           case 'superAdmin':
  //             this.router.navigate(['/dashboard']);

  //             break;
  //           case 'user':
  //             this.router.navigate(['/home']);
  //             break;
  //           default:
  //             this.router.navigate(['/home']);
  //         }

  //       } else {
  //         this.messageService.showError('Login Failed', 'Invalid credentials. Please try again.');
  //       }
  //     },
  //     error: (err) => {
  //       this.isSubmitting = false;
  //       console.error('Login Error:', err);
  //       this.messageService.handleError(err, 'Login Failed');
  //     }
  //   });
  // }
  private formatDateForApi = (date: Date): string =>
    date.toISOString().split('T')[0];

  loadLoginSummary(): void {
    this.noteService.getLoginSummary().subscribe({
      next: (res) => {
        if (res.status === 'success') {
          this.openSummaryDialog(res.data);
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load login summary.',
        });
      },
    });
  }

  openSummaryDialog(data: any) {
    const ref = this.dialogService.open(LoginSummaryDialogComponent, {
      header: 'Login Summary',
      width: '80vw',
      modal: true,
      data: data, // pass API response
      contentStyle: { overflow: 'auto' },
    });

    ref.onClose.subscribe(() => {
      console.log('Login summary dialog closed');
    });
  }
}
