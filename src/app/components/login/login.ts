import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  login(): void {
    this.authService.login(this.username, this.password).subscribe({
      next: (success) => {
        if (success) {
          this.toastr.success('Successfully logged in!', 'Welcome');
          this.router.navigate(['/']);
        } else {
          this.errorMessage = 'Invalid username or password';
          this.toastr.error(this.errorMessage, 'Login Failed');
        }
      },
      error: () => {
        this.errorMessage = 'Login failed. Please try again.';
        this.toastr.error(this.errorMessage, 'Login Failed');
      }
    });
  }
}