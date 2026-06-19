import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";

interface SpaceRecommendation {
  id: string;
  title: string;
  bestInstallations: string[];
  bestInstallationsWhy: string;
  bestMaterials: string[];
  bestMaterialsWhy: string;
  caution: string[];
  cautionWhy: string;
  notRecommended: string[];
  notRecommendedWhy: string;
}

@Component({
  selector: 'app-residential',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './residential.html',
  styleUrl: './residential.scss',
})
export class Residential {
  // Espacio seleccionado por defecto
selectedSpaceId: string | null = null;

  // Definición de los espacios para iterar en el HTML
  spaces = [
    {
      id: 'high-humidity',
      lines: ['Bathroom,', 'Laundry, Kitchen'],
      icon: 'ph ph-bathtub',        // 👈 Ambas clases aquí
      subtitle: 'High Humidity',
      badgeClass: 'danger'
    },
    {
      id: 'low-humidity',
      lines: ['Living Room,', 'Bedroom, Hallways,', 'Small Bathrooms,', 'Stair Wells'],
      icon: 'ph ph-armchair',       // 👈 Ambas clases aquí
      subtitle: 'Low to No Humidity',
      badgeClass: 'success'
    },
    {
      id: 'ceilings',
      lines: ['Ceilings'],
      icon: 'ph ph-lamp-pendant',   // 👈 Ambas clases aquí
      subtitle: 'Gravity',
      badgeClass: 'info'
    },
    {
      id: 'other',
      lines: ['Other / Not Sure'],
      icon: 'ph ph-question',       // 👈 Ambas clases aquí
      subtitle: '',
      badgeClass: ''
    }
  ];

  // Base de datos de recomendaciones por espacio
  recommendations: Record<string, SpaceRecommendation> = {
    'high-humidity': {
      id: 'high-humidity',
      title: 'Bathroom, Laundry, Kitchen',
      bestInstallations: ['Traditional / Unpasted', 'Pre-Pasted'],
      bestInstallationsWhy: 'Better adhesion and moisture resistance for high-humidity areas.',
      bestMaterials: ['Vinyl / Non-Woven', 'Vinyl'],
      bestMaterialsWhy: 'Washable, durable and made to withstand moisture and steam.',
      caution: ['Pre-Pasted', 'Peel & Stick'],
      cautionWhy: 'Adhesive may weaken over time in humid conditions.',
      notRecommended: ['Grasscloth', 'Paper'],
      notRecommendedWhy: 'Natural fibers and some papers can be affected by moisture.'
    },
    'low-humidity': {
      id: 'low-humidity',
      title: 'Living Room, Bedroom, Hallways, etc.',
      bestInstallations: ['Peel & Stick', 'Pre-Pasted', 'Traditional'],
      bestInstallationsWhy: 'All installation types work well in standard, dry environments.',
      bestMaterials: ['Paper', 'Grasscloth', 'Textile / Fabric', 'Vinyl'],
      bestMaterialsWhy: 'Wide variety of textures and finishes can be safely used without moisture concerns.',
      caution: [],
      cautionWhy: '',
      notRecommended: [],
      notRecommendedWhy: ''
    },
    'ceilings': {
      id: 'ceilings',
      title: 'Ceilings',
      bestInstallations: ['Pre-Pasted', 'Peel & Stick (Lightweight)'],
      bestInstallationsWhy: 'Easier to handle overhead and less prone to sagging.',
      bestMaterials: ['Lightweight Vinyl', 'Paper'],
      bestMaterialsWhy: 'Lighter materials reduce the risk of peeling due to gravity.',
      caution: ['Traditional / Unpasted (Heavy)'],
      cautionWhy: 'Heavy pastes and materials can sag or fall before drying.',
      notRecommended: ['Heavy Grasscloth', 'Thick Textiles'],
      notRecommendedWhy: 'Too heavy for ceiling adhesion over time.'
    },
    'other': {
      id: 'other',
      title: 'Other / Not Sure',
      bestInstallations: ['Depends on the space'],
      bestInstallationsWhy: 'Different spaces have unique requirements.',
      bestMaterials: ['Varies'],
      bestMaterialsWhy: 'We need more details to give accurate advice.',
      caution: ['Guessing'],
      cautionWhy: 'Choosing the wrong material can lead to premature failure.',
      notRecommended: ['Any without consultation'],
      notRecommendedWhy: 'Professional guidance ensures the best result.'
    }
  };
  expandedCard: number | null = null;
  materialExpandedCard: number | null = null;
    faqExpanded: number | null = null;

  constructor(
    public router: Router
  ){}

  // Getter para obtener la recomendación actual de forma limpia
  get currentRecommendation(): SpaceRecommendation | null {
  if (!this.selectedSpaceId) {
    return null;
  }

  return this.recommendations[this.selectedSpaceId] ?? null;
}

  // Método para cambiar el espacio seleccionado
  selectSpace(spaceId: string): void {
    this.selectedSpaceId = spaceId;
  }

  toggleCard(index: number): void {
    this.expandedCard = this.expandedCard === index ? null : index;
  }

  toggleMaterialCard(index: number): void {
    this.materialExpandedCard =
      this.materialExpandedCard === index ? null : index;
  }

toggleFaq(index: number): void {
  this.faqExpanded =
    this.faqExpanded === index ? null : index;
}
}