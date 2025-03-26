// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-signup',
//   imports: [],
//   templateUrl: './signup.component.html',
//   styleUrl: './signup.component.css'
// })
// export class SignupComponent {

// }
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AppMessageService } from '../../../../core/services/message.service';

@Component({
  selector: 'app-signup',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signupForm: FormGroup; // Declare signupForm

  constructor(
    private messageService: AppMessageService,
    private auth: AuthService,
    private router: Router,
    private fb: FormBuilder // Inject FormBuilder
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required], // Full Name control
      email: ['', [Validators.required, Validators.email]], // Email control with email validator
      password: ['', Validators.required], // Password control
      passwordConfirm: ['', Validators.required], // Confirm Password control
      role: ['', Validators.required] // Role control
    });
  }

  public errorMessage: string | null = null; // To display error messages


  signUp() {
    if (this.signupForm.valid) {
      this.errorMessage = null;
      this.auth.signUp(this.signupForm.value).subscribe({
        next: (response: any) => {
          if (response && response.token) {
            this.messageService.handleResponse(response, 'Signup Successful', 'You are now registered.'); // Using handleResponse for success
            this.router.navigate(['/dashboard']);
          } else {
            this.messageService.handleError(response.status, 'Signup Failed'); // Using handleError for specific error case
          }
        },
        error: (error) => {
          console.error('Signup Error:', error);
          this.messageService.handleError(error, "Signup Failed"); // Using handleError for general error
        },
      });
    } else {
      // You can optionally mark controls as touched to show validation errors immediately
      Object.values(this.signupForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
  // signUp() {
  //   if (this.signupForm.valid) {
  //     this.errorMessage = null;
  //     this.auth.signUp(this.signupForm.value).subscribe({
  //       next: (response: any) => {
  //         if (response && response.token) {
  //           this.messageService.showSuccessMessage('success', response.status)
  //           this.router.navigate(['/dashboard']);
  //         } else {
  //           this.errorMessage = 'Invalid credentials. Please try again.';
  //           this.messageService.handleError(response.status, this.errorMessage)
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Signup Error:', error);
  //         this.messageService.handleError(error, "check the credencials")
  //         this.errorMessage = 'An error occurred during signup.'; // Display a generic error message
  //         if (error?.error?.message) {
  //           this.errorMessage = error.error.message;
  //         }
  //       },
  //     });
  //   } else {
  //     // You can optionally mark controls as touched to show validation errors immediately
  //     Object.values(this.signupForm.controls).forEach(control => {
  //       if (control.invalid) {
  //         control.markAsTouched();
  //         control.updateValueAndValidity({ onlySelf: true });
  //       }
  //     });
  //   }
  // }
}

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