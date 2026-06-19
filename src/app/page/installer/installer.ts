import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

type ProjectAudience = 'residential' | 'commercial';

@Component({
  selector: 'app-installer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './installer.html',
  styleUrl: './installer.scss',
})
export class Installer {
  selectedAudience: ProjectAudience | null = null;

  constructor(private router: Router) {}

  selectAudience(type: ProjectAudience) {
    this.selectedAudience = type;
  }

  nextStep() {
    if (!this.selectedAudience) return;
    this.router.navigate(['/installer', this.selectedAudience]);
  }
}