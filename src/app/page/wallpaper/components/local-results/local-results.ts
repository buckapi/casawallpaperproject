import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  NgZone,
  Output,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
type StoreItem = {
  name: string;
  description: string;
  distance: string;
  phone?: string;
  mapUrl?: string;
};
declare const google: any;
@Component({
  selector: 'app-local-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './local-results.html',
  styleUrl: './local-results.scss',
})
export class LocalResults implements AfterViewInit  {
  @Output() shopOnline = new EventEmitter<void>();
  @Output() findInstaller = new EventEmitter<void>();
  @Output() startOver = new EventEmitter<void>();

  zipCode = '27560';

/*   stores: StoreItem[] = [
    {
      name: 'Sherwin-Williams Paint Store',
      description: 'May carry wallpaper books or special order options.',
      distance: '2.4 miles away',
      phone: '+1 000 000 0000',
      mapUrl: 'https://www.google.com/maps',
    },
    {
      name: 'Interior Design Showroom',
      description: 'Designer wallcoverings and premium sample books.',
      distance: '5.1 miles away',
      phone: '+1 000 000 0000',
      mapUrl: 'https://www.google.com/maps',
    },
    {
      name: 'Benjamin Moore Retailer',
      description: 'Paint and décor store with possible wallpaper access.',
      distance: '6.3 miles away',
      phone: '+1 000 000 0000',
      mapUrl: 'https://www.google.com/maps',
    },
  ]; */
@ViewChild('locationInput')
  locationInput!: ElementRef<HTMLInputElement>;

  locationQuery = '';
  locationError = '';
  autocompleteInitialized = false;

  private selectingGoogleLocation = false;

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

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}
  updateZip(): void {
  if (!this.locationQuery.trim()) {
    this.locationError = 'Please enter a ZIP code or location.';
    return;
  }

  if (!this.selectedLocation) {
    this.locationError =
      'Please select a valid location from the suggestions.';
    return;
  }

  const zipCode = this.selectedLocation.zipCode;

  if (!zipCode) {
    this.locationError =
      'We could not identify a ZIP code for this location.';
    return;
  }

  console.log('Selected location:', this.selectedLocation);

  this.locationError = '';

  // Aquí debes consultar las tiendas usando:
  // this.selectedLocation.zipCode
  // this.selectedLocation.city
  // this.selectedLocation.stateCode
  // this.selectedLocation.lat
  // this.selectedLocation.lng

  this.loadStoresByLocation();
}
private loadStoresByLocation(): void {
  if (!this.selectedLocation) return;

  const {
    zipCode,
    city,
    stateCode,
    lat,
    lng
  } = this.selectedLocation;

  console.log({
    zipCode,
    city,
    stateCode,
    lat,
    lng
  });

  // Sustituye esto por la consulta real a tu API o PocketBase.
}

  callStore(store: StoreItem): void {
    if (!store.phone) return;
    window.location.href = `tel:${store.phone}`;
  }

  openDirections(store: StoreItem): void {
    if (!store.mapUrl) return;
    window.open(store.mapUrl, '_blank', 'noopener,noreferrer');
  }
  ngAfterViewInit(): void {
  setTimeout(() => {
    this.initGoogleAutocomplete();
  }, 300);
}
private initGoogleAutocomplete(): void {
  if (this.autocompleteInitialized) return;
  if (!this.locationInput?.nativeElement) return;

  if (typeof google === 'undefined' || !google.maps?.places) {
    console.error('Google Places API is not loaded.');
    this.locationError = 'Location search is currently unavailable.';
    return;
  }

  this.autocompleteInitialized = true;

  const autocomplete = new google.maps.places.Autocomplete(
    this.locationInput.nativeElement,
    {
      types: ['geocode'],
      componentRestrictions: {
        country: 'us'
      },
      fields: [
        'place_id',
        'formatted_address',
        'geometry',
        'address_components'
      ]
    }
  );

  autocomplete.addListener('place_changed', () => {
    this.ngZone.run(() => {
      const place = autocomplete.getPlace();

      if (!place.geometry?.location) {
        this.selectedLocation = null;
        this.locationError =
          'Please select a valid location from the suggestions.';
        return;
      }

      const components = place.address_components || [];

      const getComponent = (
        type: string,
        short = false
      ): string => {
        const component = components.find((item: any) =>
          item.types.includes(type)
        );

        return short
          ? component?.short_name || ''
          : component?.long_name || '';
      };

      const city =
        getComponent('locality') ||
        getComponent('postal_town') ||
        getComponent('administrative_area_level_2');

      const state = getComponent('administrative_area_level_1');
      const stateCode =
        getComponent('administrative_area_level_1', true);

      const country = getComponent('country');
      const countryCode = getComponent('country', true);
      const zipCode = getComponent('postal_code') || null;

      this.selectedLocation = {
        formattedAddress:
          place.formatted_address || this.locationQuery,
        city,
        state,
        stateCode,
        country,
        countryCode,
        zipCode,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        placeId: place.place_id || ''
      };

      this.selectingGoogleLocation = true;

      // Mantiene solamente el ZIP dentro del input.
      this.locationQuery =
        this.selectedLocation.zipCode ||
        this.selectedLocation.formattedAddress;

      this.locationError = '';

      this.cdr.detectChanges();
    });
  });
}
onLocationQueryChange(value: string): void {
  this.locationQuery = value;

  if (this.selectingGoogleLocation) {
    this.selectingGoogleLocation = false;
    return;
  }

  this.selectedLocation = null;
  this.locationError = '';
}
}