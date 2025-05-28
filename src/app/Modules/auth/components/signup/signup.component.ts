import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service'; // Adjust path
import { AppMessageService } from '../../../../core/services/message.service'; // Adjust path

// --- Custom Validator for Password Match (Keep this) ---
export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const passwordConfirm = control.get('passwordConfirm');
  // Don't validate if controls missing or untouched/empty in confirm field (prevents premature error)
  if (!password || !passwordConfirm || !passwordConfirm.value) {
    return null;
  }
  return password.value === passwordConfirm.value ? null : { passwordMismatch: true };
};
// --- End Custom Validator ---

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css' // Use styleUrl consistently
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  isSubmitting = false; // Flag for loading state

  // errorMessage is kept for displaying signup errors
  public errorMessage: string | null = null;

  constructor(
    private messageService: AppMessageService,
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    // Initialize signupForm using FormBuilder with your validators
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', [Validators.required]],
      role: ['', [Validators.required]]
    }, { validators: passwordMatchValidator }); // Apply the custom validator at the form group level
  }

  signUp() {
    // Trigger validation display on all fields if invalid
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      // Optionally show a message for invalid form
       this.messageService.showError("Validation Error", "Please fix the errors in the form.");
      return;
    }
    this.isSubmitting = true; // Set loading state
    this.errorMessage = 'null'; // Clear previous errors

    const signupDetails = this.signupForm.value;

    this.auth.signUp(signupDetails).subscribe({
      next: (response: any) => {
        this.isSubmitting = false; // Turn off loading state
        if (response?.token) { // Safer check for token
          this.messageService.handleResponse(response.status || 200, 'Signup Successful', 'You are now registered.'); // Adjust status handling if needed
          this.router.navigate(['/dashboard']); // Or appropriate route after signup
        } else {
          // Handle cases where API succeeds but doesn't return expected token/structure
          this.errorMessage = response?.message || 'Signup process completed, but could not log you in. Please try logging in manually.';
          this.messageService.showWarn("Signup Status",);
          // Optionally navigate to login page
           this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        this.isSubmitting = false; // Turn off loading state
        console.error('Signup Error:', error);
        // Set a user-friendly error message
        this.errorMessage = error?.error?.message || 'An unexpected error occurred during signup.';
        this.messageService.handleError(error, "Signup Failed");
      },
    });
  }
}