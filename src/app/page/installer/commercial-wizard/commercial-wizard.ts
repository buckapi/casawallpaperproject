import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-commercial-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './commercial-wizard.html',
  styleUrl: './commercial-wizard.scss',
})
export class CommercialWizard {
  currentStep = 1;
  totalSteps = 10;

  selectedSpaceTypes: string[] = [];
  zipOrCity = '';
  selectedTimeline = '';
  selectedDocuments: string[] = [];
  additionalInfo = '';

  fullName = '';
  email = '';
  phone = '';

  spaceTypes = [
    { label: 'Office', icon: 'ph-buildings' },
    { label: 'Retail Store', icon: 'ph-storefront' },
    { label: 'Restaurant', icon: 'ph-fork-knife' },
    { label: 'Hotel / Hospitality', icon: 'ph-bed' },
    { label: 'Medical / Dental', icon: 'ph-first-aid-kit' },
    { label: 'Education', icon: 'ph-graduation-cap' },
    { label: 'Multi-Family', icon: 'ph-apartment' },
    { label: 'Other', icon: 'ph-wrench' },
  ];

  timelines = [
    'ASAP',
    'Within 1 - 2 Weeks',
    'Within 1 Month',
    '2 - 3 Months',
    'Just Planning',
  ];

  documents = [
    'W9',
    'General Liability Insurance',
    'Commercial Auto Insurance',
    'Workers’ Compensation Insurance',
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

  toggleSpaceType(type: string) {
    this.toggleItem(this.selectedSpaceTypes, type);
  }

  toggleDocument(document: string) {
    this.toggleItem(this.selectedDocuments, document);
  }

  private toggleItem(list: string[], item: string) {
    const index = list.indexOf(item);

    if (index >= 0) {
      list.splice(index, 1);
      return;
    }

    list.push(item);
  }

  submitRequest() {
    const payload = {
      projectType: 'Commercial',
      spaceTypes: this.selectedSpaceTypes,
      location: this.zipOrCity,
      timeline: this.selectedTimeline,
      documents: this.selectedDocuments,
      additionalInfo: this.additionalInfo,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
    };

    console.log('Commercial request:', payload);
    this.nextStep();
  }
}