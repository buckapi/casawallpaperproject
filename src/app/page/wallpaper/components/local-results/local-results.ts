import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

type StoreItem = {
  name: string;
  description: string;
  distance: string;
  phone?: string;
  mapUrl?: string;
};

@Component({
  selector: 'app-local-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './local-results.html',
  styleUrl: './local-results.scss',
})
export class LocalResults {
  @Output() shopOnline = new EventEmitter<void>();
  @Output() findInstaller = new EventEmitter<void>();
  @Output() startOver = new EventEmitter<void>();

  zipCode = '27560';

  stores: StoreItem[] = [
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
  ];

  updateZip(): void {
    console.log('ZIP updated:', this.zipCode);
  }

  callStore(store: StoreItem): void {
    if (!store.phone) return;
    window.location.href = `tel:${store.phone}`;
  }

  openDirections(store: StoreItem): void {
    if (!store.mapUrl) return;
    window.open(store.mapUrl, '_blank', 'noopener,noreferrer');
  }
}