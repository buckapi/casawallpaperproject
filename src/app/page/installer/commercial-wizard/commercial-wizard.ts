import { CommonModule } from '@angular/common';
import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import PocketBase from 'pocketbase';

declare const google: any;

@Component({
  selector: 'app-commercial-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './commercial-wizard.html',
  styleUrl: './commercial-wizard.scss',
})
export class CommercialWizard {
  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;

  private pb = new PocketBase('https://db.buckapi.site:8055');

  currentStep = 1;
  totalSteps = 8;

  isSubmitting = false;
  submitError = '';
  requestSent = false;

  locationQuery = '';
  locationError = '';
  autocompleteInitialized = false;

  selectedLocation: {
    formattedAddress: string;
    city: string;
    state: string;
    stateCode: string;
    country: string;
    countryCode: string;
    zipCode: string | null;
    lat: number;
    lng: number;
    placeId: string;
  } | null = null;

  selectedSpaceTypes: string[] = [];
  selectedTimeline = '';
  selectedDocuments: string[] = [];
  additionalInfo = '';

  uploadedFiles: File[] = [];
  filePreviews: {
    name: string;
    type: string;
    size: number;
    url?: string;
  }[] = [];
  fileError = '';

  fullName = '';
  email = '';
  phone = '';

  constructor(private ngZone: NgZone) {}

  spaceTypes = [
    { label: 'Office', value: 'office', icon: 'ph-buildings' },
    { label: 'Retail Store', value: 'retail_store', icon: 'ph-storefront' },
    { label: 'Restaurant', value: 'restaurant', icon: 'ph-fork-knife' },
    { label: 'Hotel / Hospitality', value: 'hotel_hospitality', icon: 'ph-bed' },
    { label: 'Medical / Dental', value: 'medical_dental', icon: 'ph-first-aid-kit' },
    { label: 'Education', value: 'education', icon: 'ph-graduation-cap' },
    { label: 'Multi-Family', value: 'multi_family', icon: 'ph-buildings' },
    { label: 'Other', value: 'other', icon: 'ph-wrench' },
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
    if (this.currentStep === 1 && !this.isSpaceTypeValid()) return;
    if (this.currentStep === 2 && !this.isLocationValid()) return;
    if (this.currentStep === 3 && !this.isTimelineValid()) return;

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;

      if (this.currentStep === 2) {
        setTimeout(() => {
          this.initGoogleAutocomplete();
        }, 300);
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    this.currentStep = step;

    if (step === 2) {
      setTimeout(() => {
        this.initGoogleAutocomplete();
      }, 300);
    }
  }

  getProgressSteps(): number[] {
    return Array.from({ length: this.totalSteps }, (_, i) => i + 1);
  }

  toggleSpaceType(value: string) {
    this.toggleItem(this.selectedSpaceTypes, value);
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

  getSelectedSpaceTypeLabels(): string {
    return this.selectedSpaceTypes
      .map(value => this.spaceTypes.find(item => item.value === value)?.label)
      .filter(Boolean)
      .join(', ');
  }

  initGoogleAutocomplete() {
    if (this.autocompleteInitialized) return;
    if (!this.locationInput?.nativeElement) return;

    if (typeof google === 'undefined' || !google.maps?.places) {
      console.error('Google Places API is not loaded.');
      return;
    }

    this.autocompleteInitialized = true;

    const autocomplete = new google.maps.places.Autocomplete(
      this.locationInput.nativeElement,
      {
        types: ['geocode'],
        componentRestrictions: {
          country: 'us',
        },
        fields: [
          'place_id',
          'formatted_address',
          'geometry',
          'address_components',
        ],
      }
    );

    autocomplete.addListener('place_changed', () => {
      this.ngZone.run(() => {
        const place = autocomplete.getPlace();

        if (!place.geometry?.location) {
          this.locationError = 'Please select a valid location from the list.';
          return;
        }

        const components = place.address_components || [];

        const getComponent = (type: string, short = false) => {
          const component = components.find((c: any) => c.types.includes(type));
          return short ? component?.short_name || '' : component?.long_name || '';
        };

        const city =
          getComponent('locality') ||
          getComponent('sublocality') ||
          getComponent('neighborhood') ||
          getComponent('administrative_area_level_3') ||
          getComponent('administrative_area_level_2') ||
          '';

        const state = getComponent('administrative_area_level_1');
        const stateCode = getComponent('administrative_area_level_1', true);
        const country = getComponent('country');
        const countryCode = getComponent('country', true);
        const zipCode = getComponent('postal_code') || null;

        this.selectedLocation = {
          formattedAddress: place.formatted_address || this.locationQuery,
          city,
          state,
          stateCode,
          country,
          countryCode,
          zipCode,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          placeId: place.place_id || '',
        };

        this.locationQuery = this.selectedLocation.formattedAddress;
        this.locationError = '';
      });
    });
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    this.handleFiles(Array.from(input.files));

    input.value = '';
  }

  handleFiles(files: File[]) {
    this.fileError = '';

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    const maxSize = 20 * 1024 * 1024;
    const maxFiles = 8;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        this.fileError = 'Only JPG, PNG, WEBP or PDF files are allowed.';
        continue;
      }

      if (file.size > maxSize) {
        this.fileError = 'Each file must be 20MB or less.';
        continue;
      }

      if (this.uploadedFiles.length >= maxFiles) {
        this.fileError = `You can upload up to ${maxFiles} files.`;
        break;
      }

      this.uploadedFiles.push(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.onload = () => {
          this.filePreviews.push({
            name: file.name,
            type: file.type,
            size: file.size,
            url: reader.result as string,
          });
        };

        reader.readAsDataURL(file);
      } else {
        this.filePreviews.push({
          name: file.name,
          type: file.type,
          size: file.size,
        });
      }
    }
  }

  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
    this.filePreviews.splice(index, 1);
  }

  isSpaceTypeValid(): boolean {
    return this.selectedSpaceTypes.length > 0;
  }

  isLocationValid(): boolean {
    if (this.selectedLocation) {
      return true;
    }

    this.locationError = 'Please select a valid location from the suggestions.';
    return false;
  }

  isTimelineValid(): boolean {
    return !!this.selectedTimeline;
  }

  mapTimelineToDate(): string {
    const date = new Date();

    switch (this.selectedTimeline) {
      case 'ASAP':
        date.setDate(date.getDate() + 3);
        break;
      case 'Within 1 - 2 Weeks':
        date.setDate(date.getDate() + 14);
        break;
      case 'Within 1 Month':
        date.setMonth(date.getMonth() + 1);
        break;
      case '2 - 3 Months':
        date.setMonth(date.getMonth() + 3);
        break;
      default:
        date.setMonth(date.getMonth() + 6);
        break;
    }

    return date.toISOString();
  }

  mapTimelineToIntentionLevel(): string {
    switch (this.selectedTimeline) {
      case 'ASAP':
        return 'high';
      case 'Within 1 - 2 Weeks':
        return 'medium';
      case 'Within 1 Month':
        return 'medium';
      default:
        return 'low';
    }
  }

  async submitRequest() {
    if (this.isSubmitting) return;

    if (!this.fullName.trim() || !this.phone.trim() || !this.email.trim()) {
      this.submitError = 'Please enter your name, email and phone number.';
      return;
    }

    try {
      this.isSubmitting = true;
      this.submitError = '';

      const requestData = {
        status: 'sent',

        project_type: 'commercial',
        source: 'website',

        city: this.selectedLocation?.city || '',
        zip_code: this.selectedLocation?.zipCode || '',
        state: this.selectedLocation?.state || '',
        state_code: this.selectedLocation?.stateCode || '',
        country: this.selectedLocation?.countryCode || 'US',
        formatted_address: this.selectedLocation?.formattedAddress || '',

        lat: this.selectedLocation?.lat || 0,
        lng: this.selectedLocation?.lng || 0,

        space_type: this.selectedSpaceTypes.join(','),
        project_category_label: this.getSelectedSpaceTypeLabels(),

        wallpaper_type: this.selectedDocuments.join(', '),
        budget_range: this.additionalInfo || '',
        desired_date: this.mapTimelineToDate(),
        intention_level: this.mapTimelineToIntentionLevel(),

        max_leads: 3,
        sold_leads: 0,
        is_available: true,

        client_name: this.fullName.trim(),
        client_email: this.email.trim(),
        client_phone: this.phone.trim(),
      };

      const requestRecord = await this.pb.collection('requests').create(requestData);

      const photoIds: string[] = [];

      for (const [index, file] of this.uploadedFiles.entries()) {
        const fileData = new FormData();

        fileData.append('request_id', requestRecord.id);
        fileData.append('request', requestRecord.id);
        fileData.append('file', file);
        fileData.append('image', file);
        fileData.append('sort_order', String(index + 1));

        const fileRecord = await this.pb
          .collection('request_photos')
          .create(fileData);

        photoIds.push(fileRecord.id);
      }

      if (photoIds.length > 0) {
        await this.pb.collection('requests').update(requestRecord.id, {
          photos: photoIds,
        });
      }

      this.ngZone.run(() => {
        this.isSubmitting = false;
        this.requestSent = true;
      });

    } catch (error: any) {
      console.error('Error creating commercial request:', error);
      console.error('PocketBase error data:', error?.data);

      this.ngZone.run(() => {
        this.submitError = 'We could not send your request. Please try again.';
        this.isSubmitting = false;
      });
    }
  }
}