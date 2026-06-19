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
  currentStep = 1;
  totalSteps = 10;

  selectedAudience: ProjectAudience | null = null;

  constructor(private router: Router) {}

  selectAudience(type: ProjectAudience) {
    this.selectedAudience = type;
  }

  nextStep() {
    if (!this.selectedAudience) return;

    this.router.navigate(['/installer', this.selectedAudience]);
  }

  goToWizard(type: ProjectAudience) {
    this.router.navigate(['/installer', type]);
  }

  getProgressSteps(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }
}