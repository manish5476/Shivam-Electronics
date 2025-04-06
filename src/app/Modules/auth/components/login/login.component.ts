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

