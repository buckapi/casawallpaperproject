import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

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

  constructor(private router: Router) {}

  ngOnInit(): void {
    const isLogged = localStorage.getItem('cw_admin_session') === 'active';

    if (isLogged) {
      this.router.navigate(['/homeDashboard']);
    }
  }

  login() {
    if (
      this.email === 'admin@casawallpaper.com' &&
      this.password === 'admin123'
    ) {
      localStorage.setItem('cw_admin_session', 'active');
      this.router.navigate(['/homeDashboard']);
      return;
    }

    this.error = 'Invalid email or password.';
  }
}