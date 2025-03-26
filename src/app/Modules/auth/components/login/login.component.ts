// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-login',
//   imports: [],
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.css'
// })
// export class LoginComponent {

// }

import { Component, OnInit } from '@angular/core'; // Import OnInit
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import ReactiveFormsModule, FormBuilder, FormGroup, Validators
import { AppMessageService } from '../../../../core/services/message.service';
// import { take } from 'rxjs';
import { FocusTrapModule } from 'primeng/focustrap';
@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FocusTrapModule, RouterModule, FormsModule, ReactiveFormsModule], // Add ReactiveFormsModule to imports
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit { // Implement OnInit
    public loginForm: FormGroup; // Define loginForm as FormGroup
    public errorMessage: string | null = null;

    constructor(
        private auth: AuthService,
        private router: Router,
        private messageService: AppMessageService,
        private fb: FormBuilder // Inject FormBuilder
    ) {
        this.loginForm = this.fb.group({ // Initialize loginForm using FormBuilder
            email: ['', [Validators.required, Validators.email]], // Define email control with validators
            password: ['', [Validators.required, Validators.minLength(6)]], // Define password control with validators
        });
    }

    ngOnInit(): void {

    }

    onLogin() {
        if (this.loginForm.valid) {
            this.errorMessage = null;
            const loginDetails = this.loginForm.value;
            this.auth.login(loginDetails).subscribe({
                next: (response: any) => {
                    if (response && response.data && response.token) {
                        this.messageService.handleResponse(response.status, 'Login Successful', 'Welcome to Dashboard');
                        this.router.navigate(['/dashboard']);
                    } else {
                        this.errorMessage = 'Invalid credentials. Please try again.';
                    }
                },
                error: (error) => {
                    console.error('Login Error:', error);
                    this.messageService.handleError(error, 'Login Failed');
                },
            });
        } else {
            console.log("Form is invalid");
        }
    }

}



// onLogin(): void {
//     const loginDetails = this.loginForm.value;
//     this.auth
//         .login(loginDetails)
//         .pipe(take(1))
//         .subscribe({
//             next: () => {
//                 const returnUrl = this.auth.getItem('returnUrl');
//                 this.auth.removeItem('returnUrl');
//                 this.router.navigate([returnUrl || '/dashboard']);
//             },
//             error: (error) => {
//                 this.messageService.handleError(error);
//             }
//         });
// }


// import { Component } from '@angular/core';
// import { RouterModule, Router } from '@angular/router'; // Import Router correctly
// import { AuthService } from '../../../../core/services/auth.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { AppMessageService } from '../../../../core/services/message.service';
// @Component({
//     selector: 'app-login',
//     standalone: true, // If you're using standalone components
//     imports: [CommonModule, RouterModule, FormsModule],
//     templateUrl: './login.component.html',
//     styleUrls: ['./login.component.css']
// })
// export class LoginComponent {
//     public logindetails = {
//         email: '',
//         password: '',
//     };
//     public errorMessage: string | null = null;

//     constructor(private auth: AuthService, private router: Router, private messageService: AppMessageService) { }

//     onLogin() {
//         this.errorMessage = null;
//         this.auth.login(this.logindetails).subscribe({
//             next: (response: any) => {
//                 if (response && response.data && response.token) {
//                     // Correct check
//                     this.messageService.handleResponse(response.status, 'Request Successful', 'maish');
//                     this.router.navigate(['/dashboard']);
//                 } else {
//                     this.errorMessage = 'Invalid credentials. Please try again.';
//                 }
//             },
//             error: (error) => {
//                 console.error('Login Error:', error);
//                 this.errorMessage = 'An error occurred during login.';
//                 if (error?.error?.message) {
//                     this.errorMessage = error.error.message;
//                 }
//             },
//         });
//     }
// }





// // import { Component } from '@angular/core';
// // import { RouterModule } from '@angular/router';
// // import { Router } from '@angular/router';
// // import { AuthService } from '../../../../core/services/auth.service';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';
// // @Component({
// //     selector: 'app-login',
// //     imports: [CommonModule, RouterModule, FormsModule],
// //     templateUrl: './login.component.html',
// //     styleUrls: ['./login.component.css']
// // })
// // export class LoginComponent {
// //   public logindetails = {
// //     email: '',
// //     password: '',
// //   };
// //   public errorMessage: string | null = null; // To display error messages

// //   constructor(private auth: AuthService, private router: Router) {}

// //   onLogin() {
// //     this.errorMessage = null; // Clear any previous error messages
// //     this.auth.login(this.logindetails).subscribe({
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
