import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service'; // Adjust the path if necessary
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppMessageService } from '../../../../core/services/message.service'; // Adjust the path if necessary
// import { take } from 'rxjs'; // Keep if used elsewhere, otherwise remove

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule], // Removed FocusTrapModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public loginForm: FormGroup;
  public errorMessage: string | null = null; // Keep this for displaying login errors
  isSubmitting: boolean = false;

  constructor(
    private auth: AuthService, // Keep your AuthService
    private router: Router, // Keep your Router
    private messageService: AppMessageService, // Keep your MessageService
    private fb: FormBuilder // Keep FormBuilder for Reactive Forms
  ) {
    this.loginForm = this.fb.group({
      // Keep your existing form controls and validators
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // Add a form control for the 'Remember me' checkbox if you want to track it
      // rememberMe: [false] // Default value is false
    });
  }

  ngOnInit(): void {
    // Your existing ngOnInit logic (if any) can remain here
  }

  onLogin() {
    // Keep your existing login logic using the Reactive Form value
    if (this.loginForm.valid) {
      this.errorMessage = null; // Clear previous errors
      const loginDetails = this.loginForm.value;
      console.log('Attempting login with:', loginDetails); // Log form value

      this.auth.login(loginDetails).subscribe({
        next: (response: any) => {
          if (response && response.data && response.token) {
            this.messageService.handleResponse(response.status, 'Login Successful', 'Welcome to Dashboard');
            this.router.navigate(['/dashboard']); // Navigate on success
          } else {
            this.errorMessage = 'Invalid credentials. Please try again.'; // Display generic error
            this.messageService.showError("Login Failed", this.errorMessage); // Show error via message service
          }
        },
        error: (error) => {
          console.error('Login Error:', error);
          // Handle different error types if needed, e.g., based on error.status or error.error
          this.errorMessage = error.message || 'An error occurred during login.'; // Use error message or a default
          this.messageService.handleError(error, 'Login Failed'); // Use message service for error
        },
      });
    } else {
      // Mark fields as touched to display validation errors if the form is submitted when invalid
      this.loginForm.markAllAsTouched();
      this.messageService.showError("Validation Error", "Please fill out the form correctly.");
    }
  }
}
// import { Component, OnInit } from '@angular/core'; // Import OnInit
// import { RouterModule, Router } from '@angular/router';
// import { AuthService } from '../../../../core/services/auth.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import ReactiveFormsModule, FormBuilder, FormGroup, Validators
// import { AppMessageService } from '../../../../core/services/message.service';
// // import { take } from 'rxjs';
// import { FocusTrapModule } from 'primeng/focustrap';
// @Component({
//     selector: 'app-login',
//     standalone: true,
//     imports: [CommonModule, FocusTrapModule, RouterModule, FormsModule, ReactiveFormsModule], // Add ReactiveFormsModule to imports
//     templateUrl: './login.component.html',
//     styleUrls: ['./login.component.css']
// })
// export class LoginComponent implements OnInit { // Implement OnInit
//     public loginForm: FormGroup; // Define loginForm as FormGroup
//     public errorMessage: string | null = null;

//     constructor(
//         private auth: AuthService,
//         private router: Router,
//         private messageService: AppMessageService,
//         private fb: FormBuilder // Inject FormBuilder
//     ) {
//         this.loginForm = this.fb.group({ // Initialize loginForm using FormBuilder
//             email: ['', [Validators.required, Validators.email]], // Define email control with validators
//             password: ['', [Validators.required, Validators.minLength(6)]], // Define password control with validators
//         });
//     }

//     ngOnInit(): void {

//     }

//     onLogin() {
//         if (this.loginForm.valid) {
//             this.errorMessage = null;
//             const loginDetails = this.loginForm.value;
//             this.auth.login(loginDetails).subscribe({
//                 next: (response: any) => {
//                     if (response && response.data && response.token) {
//                         this.messageService.handleResponse(response.status, 'Login Successful', 'Welcome to Dashboard');
//                         this.router.navigate(['/dashboard']);
//                     } else {
//                         this.errorMessage = 'Invalid credentials. Please try again.';
//                     }
//                 },
//                 error: (error) => {
//                     console.error('Login Error:', error);
//                     this.messageService.handleError(error, 'Login Failed');
//                 },
//             });
//         } else {
//             this.messageService.showError("err",'form is invalid!')
//         }
//     }

// }

