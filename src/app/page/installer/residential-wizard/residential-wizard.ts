import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-residential-wizard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './residential-wizard.html',
  styleUrl: './residential-wizard.scss',
})
export class ResidentialWizard {
  currentStep = 1;
  totalSteps = 10;

  selectedProjectType = '';
  selectedRoom = '';
  selectedCeilingHeight = '';
  selectedTimeline = '';
  selectedWallpaper = '';

  zipCode = '';
  city = '';

  fullName = '';
  email = '';
  phone = '';

  rooms = [
    'Accent Wall / Mural',
    'Bathroom',
    'Bedroom',
    'Living Room',
    'Dining Room',
    'Hallway',
    'Stairwell',
    'Foyer',
    'Ceiling',
    'Other',
  ];

  ceilingHeights = ['8 ft or less', '9 - 10 ft', 'Over 10 ft', 'Not Sure'];

  timelines = ['ASAP', 'Within 1 - 2 Weeks', 'Within 1 Month', 'Not Sure Yet'];

  wallpaperOptions = [
    'Yes, I already have wallpaper',
    'No, I need to purchase wallpaper',
    'Help Me Find Wallpaper',
  ];

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    this.currentStep = step;
  }

  getProgressSteps(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }

  submitRequest() {
    const payload = {
      projectType: 'Residential',
      location: this.zipCode || this.city,
      room: this.selectedRoom,
      ceilingHeight: this.selectedCeilingHeight,
      timeline: this.selectedTimeline,
      wallpaper: this.selectedWallpaper,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
    };

    console.log('Residential request:', payload);
  }

}