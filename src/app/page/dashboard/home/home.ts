import { Component } from '@angular/core';
import { RouterModule, Router, RouterLink } from '@angular/router';
import { AuthPocketbaseService } from '../../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  constructor(private authService: AuthPocketbaseService, private router: Router) {}

  logout() {
  localStorage.removeItem('cw_admin_session');
  this.router.navigate(['/dashboard/login']);
}
}
