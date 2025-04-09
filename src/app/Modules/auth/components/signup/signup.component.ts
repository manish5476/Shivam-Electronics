import { Component, OnInit } from '@angular/core'; // Added OnInit
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'; // Added more from @angular/forms
import { RouterModule, Router } from '@angular/router'; // Combined Router imports
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { AppMessageService } from '../../../../core/services/message.service';
// FormsModule is often not needed when using ReactiveFormsModule exclusively
// import { FormsModule } from '@angular/forms';

// --- Custom Validator for Password Match ---
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
  standalone: true, // Make it explicitly standalone
  imports: [
    CommonModule, // Use CommonModule instead of BrowserModule in components
    RouterModule,
    ReactiveFormsModule, // Use ReactiveFormsModule
   // FormsModule // Often not needed with Reactive Forms
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit { // Implement OnInit
  signupForm!: FormGroup; // Use definite assignment assertion
  isSubmitting = false; // Flag for loading state
  passwordFieldType: 'password' | 'text' = 'password'; // For visibility toggle

  // errorMessage is kept from your original code, though AppMessageService might handle display
  public errorMessage: string | null = null;

  constructor(
    private messageService: AppMessageService,
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {} // Constructor remains largely the same

  ngOnInit(): void { // Use ngOnInit for form initialization
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]], // Added minlength example
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]], // Added minlength example
      passwordConfirm: ['', [Validators.required]],
      role: ['', [Validators.required]]
    }, { validators: passwordMatchValidator }); // Apply the custom validator
  }

  // --- Password Visibility Toggle Method ---
  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }
  // --- End Toggle Method ---

  // --- Getters for easier template access (Optional) ---
  get name() { return this.signupForm.get('name'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get passwordConfirm() { return this.signupForm.get('passwordConfirm'); }
  get role() { return this.signupForm.get('role'); }
  // --- End Getters ---

  signUp() {
    // Trigger validation display on all fields if invalid
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true; // Set loading state
    this.errorMessage = null; // Clear previous errors

    this.auth.signUp(this.signupForm.value).subscribe({
      next: (response: any) => {
        this.isSubmitting = false; // Turn off loading state
        if (response?.token) { // Safer check for token
          this.messageService.handleResponse(response, 'Signup Successful', 'You are now registered.');
          this.router.navigate(['/dashboard']); // Or appropriate route
        } else {
          // Use message service, but also consider setting component error message if needed
          this.errorMessage = response?.message || 'Signup failed. Please check your details.';
          this.messageService.handleError(response?.status || 500, 'Signup Failed');
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
// import { Component } from '@angular/core';
// import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { Router } from '@angular/router';
// import { CommonModule } from '@angular/common';
// import { AuthService } from '../../../../core/services/auth.service';
// import { AppMessageService } from '../../../../core/services/message.service';
// import { FormsModule } from '@angular/forms';
// @Component({
//   selector: 'app-signup',
//   imports: [RouterModule, CommonModule, FormsModule, ReactiveFormsModule],
//   templateUrl: './signup.component.html',
//   styleUrl: './signup.component.css'
// })
// export class SignupComponent {
//   signupForm: FormGroup;

//   constructor(
//     private messageService: AppMessageService,
//     private auth: AuthService,
//     private router: Router,
//     private fb: FormBuilder // Inject FormBuilder
//   ) {
//     this.signupForm = this.fb.group({
//       name: ['', Validators.required],
//       email: ['', [Validators.required, Validators.email]], // Email control with email validator
//       password: ['', Validators.required], // Password control
//       passwordConfirm: ['', Validators.required], // Confirm Password control
//       role: ['', Validators.required] // Role control
//     });
//   }

//   public errorMessage: string | null = null; // To display error messages


//   signUp() {
//     if (this.signupForm.valid) {
//       this.errorMessage = null;
//       this.auth.signUp(this.signupForm.value).subscribe({
//         next: (response: any) => {
//           if (response && response.token) {
//             this.messageService.handleResponse(response, 'Signup Successful', 'You are now registered.'); // Using handleResponse for success
//             this.router.navigate(['/dashboard']);
//           } else {
//             this.messageService.handleError(response.status, 'Signup Failed'); // Using handleError for specific error case
//           }
//         },
//         error: (error) => {
//           console.error('Signup Error:', error);
//           this.messageService.handleError(error, "Signup Failed"); // Using handleError for general error
//         },
//       });
//     } else {
//       // You can optionally mark controls as touched to show validation errors immediately
//       Object.values(this.signupForm.controls).forEach(control => {
//         if (control.invalid) {
//           control.markAsTouched();
//           control.updateValueAndValidity({ onlySelf: true });
//         }
//       });
//     }
//   }
//   // signUp() {
//   //   if (this.signupForm.valid) {
//   //     this.errorMessage = null;
//   //     this.auth.signUp(this.signupForm.value).subscribe({
//   //       next: (response: any) => {
//   //         if (response && response.token) {
//   //           this.messageService.showSuccessMessage('success', response.status)
//   //           this.router.navigate(['/dashboard']);
//   //         } else {
//   //           this.errorMessage = 'Invalid credentials. Please try again.';
//   //           this.messageService.handleError(response.status, this.errorMessage)
//   //         }
//   //       },
//   //       error: (error) => {
//   //         console.error('Signup Error:', error);
//   //         this.messageService.handleError(error, "check the credencials")
//   //         this.errorMessage = 'An error occurred during signup.'; // Display a generic error message
//   //         if (error?.error?.message) {
//   //           this.errorMessage = error.error.message;
//   //         }
//   //       },
//   //     });
//   //   } else {
//   //     // You can optionally mark controls as touched to show validation errors immediately
//   //     Object.values(this.signupForm.controls).forEach(control => {
//   //       if (control.invalid) {
//   //         control.markAsTouched();
//   //         control.updateValueAndValidity({ onlySelf: true });
//   //       }
//   //     });
//   //   }
//   // }
// }




// ////////////////////////////
// import { Component } from '@angular/core';
// import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { Router } from '@angular/router';
// import { AuthService } from '../../../../core/services/auth.service';

// @Component({
//   selector: 'app-signup',
//   imports: [RouterModule, ReactiveFormsModule],
//   templateUrl: './signup.component.html',
//   styleUrl: './signup.component.css'
// })
// export class SignupComponent {
//   signupForm: FormGroup; // Declare signupForm

//   constructor(
//     private auth: AuthService,
//     private router: Router,
//     private fb: FormBuilder // Inject FormBuilder
//   ) {
//     // Use FormBuilder to create the form group
//     this.signupForm = this.fb.group({
//       name: ['', Validators.required], // Full Name control
//       email: ['', [Validators.required, Validators.email]], // Email control with email validator
//       password: ['', Validators.required], // Password control
//       passwordConfirm: ['', Validators.required], // Confirm Password control
//       role: ['', Validators.required] // Role control
//     });
//   }

//   public errorMessage: string | null = null; // To display error messages

//   signUp() {
//     if (this.signupForm.valid) {
//       this.errorMessage = null; // Clear any previous error messages

//       // Access form values using this.signupForm.value
//       this.auth.signUp(this.signupForm.value).subscribe({
//         next: (response: any) => {
//           if (response && response.token) {
//             // Check if token exists in the response
//             this.router.navigate(['/dashboard']);
//           } else {
//             this.errorMessage = 'Invalid credentials. Please try again.';
//           }
//         },
//         error: (error) => {
//           console.error('Signup Error:', error);
//           this.errorMessage = 'An error occurred during signup.'; // Display a generic error message
//           if (error?.error?.message) {
//             this.errorMessage = error.error.message;
//           }
//         },
//       });
//     } else {
//       // Form is invalid, handle accordingly (e.g., display validation errors)
//       console.log('Form is invalid');
//       // You can optionally mark controls as touched to show validation errors immediately
//       Object.values(this.signupForm.controls).forEach(control => {
//         if (control.invalid) {
//           control.markAsTouched();
//           control.updateValueAndValidity({ onlySelf: true });
//         }
//       });
//     }
//   }
// }

// // import { Component } from '@angular/core';
// // import { FormsModule } from '@angular/forms';
// // import { RouterModule } from '@angular/router';
// // import { Router } from '@angular/router';
// // import { AuthService } from '../../../../core/services/auth.service';
// // @Component({
// //   selector: 'app-signup',
// //   imports: [RouterModule, FormsModule],
// //   templateUrl: './signup.component.html',
// //   styleUrl: './signup.component.css'
// // })
// // export class SignupComponent {
// //   constructor(private auth: AuthService, private router: Router) { }

// //   public signupdetails = {
// //     name: '',
// //     email: '',
// //     password: '',
// //     passwordConfirm: '',
// //     role: '',
// //   };
// //   public errorMessage: string | null = null; // To display error messages

// //   signUp() {
// //     this.errorMessage = null; // Clear any previous error messages
// //     this.auth.signUp(this.signupdetails).subscribe({
// //       next: (response: any) => {
// //         if (response && response.token) {
// //           // Check if token exists in the response
// //           this.router.navigate(['/dashboard']);
// //         } else {
// //           this.errorMessage = 'Invalid credentials. Please try again.';
// //         }
// //       },
// //       error: (error) => {
// //         console.error('Login Error:', error);
// //         this.errorMessage = 'An error occurred during login.'; // Display a generic error message
// //         if (error?.error?.message) {
// //           this.errorMessage = error.error.message;
// //         }
// //       },
// //     });
// //   }

// // }