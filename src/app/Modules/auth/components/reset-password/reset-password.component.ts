import { Component, OnInit } from '@angular/core'; // Import OnInit
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import ReactiveFormsModule, FormBuilder, FormGroup, Validators
import { AppMessageService } from '../../../../core/services/message.service';
@Component({
  selector: 'app-reset-password',
  imports: [],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
    public errorMessage: string | null = null;

    constructor(
        private auth: AuthService,
        private router: Router,
        private messageService: AppMessageService,
        private fb: FormBuilder // Inject FormBuilder
    ) {
    }

}
