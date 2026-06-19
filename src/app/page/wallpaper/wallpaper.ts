import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Priority = {
  key: string;
  label: string;
  icon: string;
};

type StyleOption = {
  key: string;
  label: string;
  image: string;
};

type ProjectExample = {
  key: string;
  label: string;
  icon: string;
};

type Brand = {
  name: string;
  subtitle: string;
  image: string;
  description: string;
  benefits: string[];
  button: string;
  url?: string;
};

@Component({
  selector: 'app-wallpaper',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wallpaper.html',
  styleUrl: './wallpaper.scss',
})
export class Wallpaper {
  selectedPriorities: string[] = [];
  selectedStyle = '';
  selectedProject = '';
  projectDescription = '';
  showWizard = true;
  showAllStyles = false;
  hasResults = false;

  priorities: Priority[] = [
    { key: 'best-design', label: 'Best Design Selection', icon: 'ph-star' },
    { key: 'easy-installation', label: 'Easy Installation', icon: 'ph-wrench' },
    { key: 'commercial', label: 'Commercial Performance', icon: 'ph-buildings' },
    { key: 'budget', label: 'Budget Friendly', icon: 'ph-currency-dollar' },
    { key: 'eco', label: 'Eco-Friendly', icon: 'ph-leaf' },
    { key: 'fast', label: 'Fast Delivery', icon: 'ph-truck' },
  ];

  styles: StyleOption[] = [
    { key: 'modern', label: 'Modern', image: 'assets/img/wallpaper/modern.jpg' },
    { key: 'luxury', label: 'Luxury', image: 'assets/img/wallpaper/luxury.jpg' },
    { key: 'farmhouse', label: 'Farmhouse', image: 'assets/img/wallpaper/farmhouse.jpg' },
    { key: 'tropical', label: 'Tropical', image: 'assets/img/wallpaper/tropical.jpg' },
    { key: 'minimalist', label: 'Minimalist', image: 'assets/img/wallpaper/minimalist.jpg' },
    { key: 'floral', label: 'Floral', image: 'assets/img/wallpaper/floral.jpg' },
  ];

  projects: ProjectExample[] = [
    { key: 'nursery', label: '“I’m decorating a nursery for a baby girl.”', icon: 'ph-baby' },
    { key: 'powder', label: '“I’m remodeling a luxury powder room.”', icon: 'ph-bathtub' },
    { key: 'restaurant', label: '“I need commercial wallpaper for a restaurant.”', icon: 'ph-fork-knife' },
    { key: 'living', label: '“I’m updating a modern living room.”', icon: 'ph-armchair' },
    { key: 'coastal', label: '“I’m creating a coastal bedroom.”', icon: 'ph-waves' },
  ];

  allBrands: (Brand & {
    matchPriorities: string[];
    matchStyles: string[];
    matchProjects: string[];
    keywords: string[];
  })[] = [
    {
      name: 'YORK',
      subtitle: 'WALLCOVERINGS',
      image: 'assets/img/wallpaper/york.jpg',
      description: 'Large design selection with high quality and installer-friendly options. A strong choice for residential spaces that need style and reliable installation.',
      benefits: ['Extensive Collections', 'Excellent Quality', 'Installer Friendly'],
      button: 'View York Collections',
      url: 'https://www.yorkwallcoverings.com/',
      matchPriorities: ['best-design', 'easy-installation', 'fast'],
      matchStyles: ['modern', 'luxury', 'floral', 'farmhouse'],
      matchProjects: ['nursery', 'powder', 'living'],
      keywords: ['nursery', 'baby', 'powder', 'living', 'floral', 'elegant'],
    },
    {
      name: 'GRAHAM & BROWN',
      subtitle: 'EST. 1946',
      image: 'assets/img/wallpaper/graham.jpg',
      description: 'Contemporary designer wallpapers with bold patterns, refined palettes, and strong visual personality.',
      benefits: ['Designer Styles', 'Modern & Trendy', 'Great Color Palettes'],
      button: 'View Graham & Brown Collections',
      url: 'https://www.grahambrown.com/row/',
      matchPriorities: ['best-design', 'eco'],
      matchStyles: ['modern', 'luxury', 'floral', 'tropical'],
      matchProjects: ['powder', 'living', 'coastal'],
      keywords: ['modern', 'designer', 'bold', 'powder', 'statement', 'color'],
    },
    {
      name: 'SERENA & LILY',
      subtitle: 'PREMIUM COASTAL STYLE',
      image: 'assets/img/wallpaper/serena.jpg',
      description: 'Premium, timeless designs inspired by classic coastal interiors and elevated residential spaces.',
      benefits: ['Luxury Designs', 'Premium Quality', 'Timeless Style'],
      button: 'View Serena & Lily Collections',
      url: 'https://www.serenaandlily.com/category/decor-pillow-walls-fabric-all-wallcovering',
      matchPriorities: ['best-design'],
      matchStyles: ['luxury', 'coastal', 'minimalist'],
      matchProjects: ['coastal', 'powder', 'living'],
      keywords: ['coastal', 'bedroom', 'premium', 'timeless', 'soft', 'elegant'],
    },
    {
      name: 'PHILLIP JEFFRIES',
      subtitle: 'LUXURY WALLCOVERINGS',
      image: 'assets/img/wallpaper/phillip.jpg',
      description: 'High-end wallcoverings for luxury residential and commercial spaces that need a premium finish.',
      benefits: ['Luxury Materials', 'Commercial Grade Options', 'High-End Finish'],
      button: 'View Phillip Jeffries',
      url: 'https://phillipjeffries.com/',
      matchPriorities: ['commercial', 'best-design'],
      matchStyles: ['luxury', 'modern', 'minimalist'],
      matchProjects: ['restaurant', 'powder', 'living'],
      keywords: ['commercial', 'restaurant', 'luxury', 'premium', 'hotel', 'business'],
    },
    {
      name: 'SPOONFLOWER',
      subtitle: 'CUSTOM & CREATIVE',
      image: 'assets/img/wallpaper/spoonflower.jpg',
      description: 'Creative, customizable wallpaper options for unique spaces, nurseries, playful rooms, and bold concepts.',
      benefits: ['Custom Designs', 'Creative Patterns', 'Budget Options'],
      button: 'View Spoonflower',
      url: 'https://www.spoonflower.com/',
      matchPriorities: ['budget', 'eco', 'best-design'],
      matchStyles: ['floral', 'tropical', 'farmhouse', 'modern'],
      matchProjects: ['nursery', 'living', 'coastal'],
      keywords: ['custom', 'kids', 'nursery', 'creative', 'budget', 'playful'],
    },
    {
      name: 'BREWSTER',
      subtitle: 'WALLCOVERINGS',
      image: 'assets/img/wallpaper/brewster.jpg',
      description: 'Practical wallpaper collections with a wide range of styles and accessible options for everyday projects.',
      benefits: ['Budget Friendly', 'Wide Selection', 'Residential Ready'],
      button: 'View Brewster Collections',
      url: 'https://www.brewsterwallcovering.com/wallpaper-properties',
      matchPriorities: ['budget', 'fast', 'easy-installation'],
      matchStyles: ['farmhouse', 'modern', 'floral'],
      matchProjects: ['living', 'nursery'],
      keywords: ['budget', 'affordable', 'simple', 'farmhouse', 'residential'],
    },
  ];

  brands: Brand[] = [];

  get visibleStyles(): StyleOption[] {
    return this.showAllStyles ? this.styles : this.styles.slice(0, 4);
  }
  
  togglePriority(key: string) {
    if (this.selectedPriorities.includes(key)) {
      this.selectedPriorities = this.selectedPriorities.filter(item => item !== key);
    } else if (this.selectedPriorities.length < 2) {
      this.selectedPriorities = [...this.selectedPriorities, key];
    }

    this.refreshRecommendations(false);
  }

  selectStyle(key: string) {
    this.selectedStyle = key;
    this.refreshRecommendations(false);
  }

  selectProject(key: string) {
    this.selectedProject = key;
    this.refreshRecommendations(false);
  }

  toggleStyles() {
    this.showAllStyles = !this.showAllStyles;
  }

  getResults() {
  this.hasResults = true;
  this.showWizard = false;
  this.refreshRecommendations(true);

  setTimeout(() => {
    document.querySelector('.recommendations')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, 50);
}
backToWizard() {
  this.showWizard = true;

  setTimeout(() => {
    document.querySelector('.wizard-card')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, 50);
}
resetWizard() {
  this.selectedPriorities = [];
  this.selectedStyle = '';
  this.selectedProject = '';
  this.projectDescription = '';

  this.hasResults = false;
  this.showWizard = true;

  this.brands = [];

  setTimeout(() => {
    document.querySelector('.wizard-card')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }, 50);
}
  refreshRecommendations(forceShow = false) {
    if (!forceShow && !this.hasResults) return;

    const text = this.projectDescription.toLowerCase();

    const scored = this.allBrands
      .map(brand => {
        let score = 0;

        this.selectedPriorities.forEach(priority => {
          if (brand.matchPriorities.includes(priority)) score += 3;
        });

        if (this.selectedStyle && brand.matchStyles.includes(this.selectedStyle)) {
          score += 3;
        }

        if (this.selectedProject && brand.matchProjects.includes(this.selectedProject)) {
          score += 3;
        }

        brand.keywords.forEach(keyword => {
          if (text.includes(keyword)) score += 2;
        });

        return { brand, score };
      })
      .sort((a, b) => b.score - a.score);

    this.brands = scored.slice(0, 3).map(item => item.brand);
  }

  onProjectDescriptionChange() {
    this.refreshRecommendations(false);
  }

  openBrand(brand: any) {
  if (brand.url) {
    window.open(brand.url, '_blank');
  }
}
}