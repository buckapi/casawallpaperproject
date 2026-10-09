import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthPocketbaseService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class DashboardLogin implements OnInit {
  email = '';
  password = '';
  error = '';
  isSubmitting = false;

  constructor(private router: Router, private auth: AuthPocketbaseService) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn && this.auth.user?.['type'] === 'admin') {
      this.router.navigate(['/homeDashboard']);
    }
  }

  async login(): Promise<void> {
    if (this.isSubmitting) return;
    this.error = '';
    this.isSubmitting = true;
    try {
      const authData = await this.auth.login(this.email.trim(), this.password);
      if (authData.record['type'] !== 'admin') {
        this.auth.logout();
        this.error = 'This account does not have administrator access.';
        return;
      }
      await this.router.navigate(['/homeDashboard']);
    } catch {
      this.auth.logout();
      this.error = 'Invalid email or password.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
