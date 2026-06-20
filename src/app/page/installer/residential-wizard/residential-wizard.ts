import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import PocketBase from 'pocketbase';
declare const google: any;

@Component({
  selector: 'app-residential-wizard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './residential-wizard.html',
  styleUrl: './residential-wizard.scss',
})
export class ResidentialWizard {
  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;
  private pb = new PocketBase('https://db.buckapi.site:8055');
  isSubmitting = false;
  submitError = '';
  locationQuery = '';
  requestSent = false;
  selectedResidentialProjectType = '';
  residentialProjectTypes = [
    { label: 'Accent Wall / Mural', value: 'accent_wall_mural' },
    { label: 'Single Room', value: 'single_room' },
    { label: 'Multiple Rooms', value: 'multiple_rooms' },
    { label: 'Bathroom', value: 'bathroom' },
    { label: 'Bedroom', value: 'bedroom' },
    { label: 'Living Room', value: 'living_room' },
    { label: 'Dining Room', value: 'dining_room' },
    { label: 'Hallway / Stairwell', value: 'hallway_stairwell' },
    { label: 'Ceiling', value: 'ceiling' },
    { label: 'Other', value: 'other' },
  ];
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
  currentStep = 1;
  totalSteps = 9;

  selectedRoom = '';
  selectedCeilingHeight = '';
  selectedTimeline = '';
  selectedWallpaper = '';
  locationError = '';
  country = 'US';
  state = '';
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
  autocompleteInitialized = false;
  uploadedPhotos: File[] = [];
  photoPreviews: string[] = [];
  photoError = '';
  constructor(private ngZone: NgZone) { }

  nextStep() {
    if (this.currentStep === 2 && !this.isLocationValid()) {
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;

      if (this.currentStep === 2) {
        setTimeout(() => {
          this.initGoogleAutocomplete();
        }, 300);
      }
    }
  }
  getSelectedProjectTypeLabel(): string {
    return this.residentialProjectTypes.find(
      item => item.value === this.selectedResidentialProjectType
    )?.label || '';
  }
  onPhotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    this.handlePhotos(Array.from(input.files));

    input.value = '';
  }

  handlePhotos(files: File[]) {
    this.photoError = '';

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024;
    const maxFiles = 6;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        this.photoError = 'Only JPG, PNG or WEBP images are allowed.';
        continue;
      }

      if (file.size > maxSize) {
        this.photoError = 'Each image must be 10MB or less.';
        continue;
      }

      if (this.uploadedPhotos.length >= maxFiles) {
        this.photoError = `You can upload up to ${maxFiles} photos.`;
        break;
      }

      this.uploadedPhotos.push(file);

      const reader = new FileReader();

      reader.onload = () => {
        this.photoPreviews.push(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  }

  removePhoto(index: number) {
    this.uploadedPhotos.splice(index, 1);
    this.photoPreviews.splice(index, 1);
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
          getComponent('postal_town') ||
          getComponent('administrative_area_level_2');

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
        this.city = `${city}, ${stateCode}`;
        this.state = stateCode;
        this.zipCode = zipCode || '';
        this.locationError = '';
      });
    });
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
/* // Solo el cliente puede subir fotos
@request.auth.id != "" && 
request_id.client_id = @request.auth.id permiso para subir fotos
 */

  /* submitRequest() {
    const payload = {
  projectType: 'Residential',
  location: this.selectedLocation,
  projectCategory: this.selectedResidentialProjectType,
  projectCategoryLabel: this.getSelectedProjectTypeLabel(),
  ceilingHeight: this.selectedCeilingHeight,
  timeline: this.selectedTimeline,
  wallpaper: this.selectedWallpaper,
  photos: this.uploadedPhotos,
  fullName: this.fullName,
  email: this.email,
  phone: this.phone,
};

    console.log('Residential request:', payload);
  } */
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

      project_type: 'residential',
      source: 'website',

      city: this.selectedLocation?.city || this.city || '',
      zip_code: this.selectedLocation?.zipCode || this.zipCode || '',
      state: this.selectedLocation?.state || '',
      state_code: this.selectedLocation?.stateCode || this.state || '',
      country: this.selectedLocation?.countryCode || 'US',
      formatted_address: this.selectedLocation?.formattedAddress || '',

      lat: this.selectedLocation?.lat || 0,
      lng: this.selectedLocation?.lng || 0,

      space_type: this.selectedResidentialProjectType,
      project_category_label: this.getSelectedProjectTypeLabel(),

      wallpaper_type: this.selectedWallpaper,
      height_m: this.mapCeilingHeightToMeters(),
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

    for (const [index, photo] of this.uploadedPhotos.entries()) {
  const photoData = new FormData();

  photoData.append('request_id', requestRecord.id);
  photoData.append('file', photo);
  photoData.append('sort_order', String(index + 1));

  const photoRecord = await this.pb
    .collection('request_photos')
    .create(photoData);

  photoIds.push(photoRecord.id);
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

    console.log('Request created:', {
      request: requestRecord,
      photos: photoIds,
    });

  }  catch (error: any) {
  console.error('Error creating request:', error);
  console.error('PocketBase error data:', error?.data);

  this.ngZone.run(() => {
    this.submitError =
      error?.data?.data
        ? JSON.stringify(error.data.data)
        : 'We could not send your request. Please try again.';

    this.isSubmitting = false;
  });
}

}
  mapCeilingHeightToMeters(): number {
  switch (this.selectedCeilingHeight) {
    case '8 ft or less':
      return 2.44;
    case '9 - 10 ft':
      return 3.05;
    case 'Over 10 ft':
      return 3.35;
    default:
      return 0;
  }
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
    default:
      date.setMonth(date.getMonth() + 2);
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
  onZipInput() {
    this.zipCode = this.zipCode.replace(/\D/g, '').slice(0, 5);

    if (this.zipCode) {
      this.city = '';
    }

    this.locationError = '';
  }

  onCityInput() {
    if (this.city.trim()) {
      this.zipCode = '';
    }

    this.locationError = '';
  }

  isLocationValid(): boolean {
    if (this.selectedLocation) {
      return true;
    }

    this.locationError = 'Please select a valid location from the suggestions.';
    return false;
  }
}