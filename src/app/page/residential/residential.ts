import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface PreparationSection {
  id: string;
  title: string;
  icon: string;
  summary: string;
  checks: string[];
  warning?: string;
}

@Component({
  selector: 'app-residential',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './residential.html',
  styleUrl: './residential.scss',
})
export class Residential {
  activeSectionIndex = 0;

  sections: PreparationSection[] = [
    {
      id: 'wall-condition',
      title: 'Wall Condition',
      icon: 'ph ph-wall',
      summary: 'Start with walls that are clean, dry, stable, and free of damage.',
      checks: [
        'Repair cracks and loose drywall.',
        'Remove dust, grease, and residue.',
        'Check for moisture or water damage.',
      ],
      warning: 'Wallpaper should not be installed over damp or unstable walls.',
    },
    {
      id: 'primer',
      title: 'Primer',
      icon: 'ph ph-paint-roller',
      summary: 'Primer improves adhesion and helps protect the wall surface.',
      checks: [
        'Use wallpaper-specific primer when possible.',
        'Allow the primer to dry completely.',
        'Avoid installing directly over bare drywall.',
      ],
      warning: 'Paint alone may not provide the correct wallpaper surface.',
    },
    {
      id: 'wallpaper-removal',
      title: 'Wallpaper Removal',
      icon: 'ph ph-arrow-line-down',
      summary: 'Old wallpaper should usually be removed before installing new material.',
      checks: [
        'Test whether the existing paper strips easily.',
        'Remove adhesive residue.',
        'Repair wall damage after removal.',
      ],
      warning: 'Installing over loose wallpaper can cause bubbling and failure.',
    },
    {
      id: 'texture',
      title: 'Texture',
      icon: 'ph ph-circles-three-plus',
      summary: 'Wallpaper performs best on a smooth, even surface.',
      checks: [
        'Identify orange peel, knockdown, or heavy texture.',
        'Light texture may require sanding.',
        'Heavy texture may require skim coating.',
      ],
      warning: 'Texture may show through thin or glossy wallpaper.',
    },
    {
      id: 'skim-coat',
      title: 'Skim Coat',
      icon: 'ph ph-stack',
      summary: 'A skim coat creates a smooth surface over damaged or textured walls.',
      checks: [
        'Apply a thin, even compound layer.',
        'Sand after drying.',
        'Prime before wallpaper installation.',
      ],
      warning: 'Poorly finished skim coats can remain visible under wallpaper.',
    },
    {
      id: 'liner',
      title: 'Liner',
      icon: 'ph ph-scroll',
      summary: 'Wallpaper liner can help create a more uniform installation surface.',
      checks: [
        'Useful for uneven or previously repaired walls.',
        'Can reduce minor surface imperfections.',
        'Must be installed and dried before the finish wallpaper.',
      ],
      warning: 'Liner does not replace major wall repairs.',
    },
    {
      id: 'common-problems',
      title: 'Common Problems',
      icon: 'ph ph-warning-circle',
      summary: 'Identify issues that may affect appearance or adhesion.',
      checks: [
        'Moisture, mold, or active leaks.',
        'Flaking paint or loose drywall paper.',
        'Uneven repairs, holes, or adhesive residue.',
      ],
      warning: 'Resolve active wall problems before scheduling installation.',
    },
  ];

  get activeSection(): PreparationSection {
    return this.sections[this.activeSectionIndex];
  }

  selectSection(index: number): void {
    this.activeSectionIndex = index;
    this.scrollToGuide();
  }

  previousSection(): void {
    if (this.activeSectionIndex > 0) {
      this.activeSectionIndex--;
      this.scrollToGuide();
    }
  }

  nextSection(): void {
    if (this.activeSectionIndex < this.sections.length - 1) {
      this.activeSectionIndex++;
      this.scrollToGuide();
    }
  }

  private scrollToGuide(): void {
  requestAnimationFrame(() => {
    const section = document.getElementById('active-preparation-section');

    if (!section) {
      return;
    }

    const headerOffset = 90;
    const elementTop =
      section.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: elementTop - headerOffset,
      behavior: 'smooth',
    });
  });
}
}