import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Start } from './components/start/start';
import { Preferences } from './components/preferences/preferences';
import { Project } from './components/project/project';
import { Results } from './components/results/results';
import { LocalResults } from './components/local-results/local-results';


type FlowStep = 'start' | 'preferences' | 'project' | 'results' | 'local-results';
type StartOption = 'shop-online' | 'local-stores' | 'not-sure' | '';

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

type RecommendationBrand = Brand & {
  matchPriorities: string[];
  matchStyles: string[];
  matchProjects: string[];
  keywords: string[];
};
@Component({
  selector: 'app-wallpaper',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Start,
    Preferences,
    Project,
    Results,
    LocalResults,
  ],
  templateUrl: './wallpaper.html',
  styleUrl: './wallpaper.scss',
})
export class Wallpaper {
  currentStep: FlowStep = 'start';
  selectedStartOption: StartOption = '';

  selectedPriorities: string[] = [];
  selectedStyle = '';
  selectedProject = '';
  projectDescription = '';

  showAllStyles = false;
  hasResults = false;
  projectOrigin: 'start' | 'preferences' | 'local-results' = 'preferences';
  priorities: Priority[] = [
    { key: 'best-design', label: 'Best Design Selection', icon: 'ph-star' },
    { key: 'easy-installation', label: 'Easy Installation', icon: 'ph-wrench' },
    { key: 'commercial', label: 'Commercial Performance', icon: 'ph-buildings' },
    { key: 'budget', label: 'Budget Friendly', icon: 'ph-currency-dollar' },
    { key: 'eco', label: 'Eco-Friendly', icon: 'ph-leaf' },
    { key: 'fast', label: 'Fast Delivery', icon: 'ph-truck' },
  ];

  styles: StyleOption[] = [
    { key: 'modern', label: 'Modern', image: 'assets/img/modern.png' },
    { key: 'luxury', label: 'Luxury', image: 'assets/img/luxury.png' },
    { key: 'floral', label: 'Floral', image: 'assets/img/floral.png' },
    { key: 'tropical', label: 'Tropical', image: 'assets/img/tropical.png' },
    { key: 'farmhouse', label: 'Farmhouse', image: 'assets/img/farmhouse.png' },
    { key: 'abstract', label: 'Abstract', image: 'assets/img/abstract.png' },
    /* { key: 'minimalist', label: 'Minimalist', image: 'assets/img/minimalist.png' }, */
    { key: 'nursery', label: 'Nursery', image: 'assets/img/nursery.png' },
    { key: 'mural', label: 'Mural', image: 'assets/img/mural.png' },
    { key: 'commercial', label: 'Commercial', image: 'assets/img/commercial.png' },

  ];

  projects: ProjectExample[] = [
    { key: 'nursery', label: '“I’m decorating a nursery for a baby girl.”', icon: 'ph-baby' },
    { key: 'powder', label: '“I’m remodeling a luxury powder room.”', icon: 'ph-bathtub' },
    { key: 'restaurant', label: '“I need commercial wallpaper for a restaurant.”', icon: 'ph-fork-knife' },
    { key: 'living', label: '“I’m updating a modern living room.”', icon: 'ph-armchair' },
    { key: 'coastal', label: '“I’m creating a coastal bedroom.”', icon: 'ph-waves' },
  ];

  allBrands: RecommendationBrand[] =
    [
      {
        name: 'GRAHAM & BROWN',
        subtitle: 'MODERN WALLPAPER',
        image: 'assets/img/wallpaper/graham.jpg',
        description: 'Good option for modern, contemporary, floral, tropical and easy-to-shop residential wallpaper.',
        benefits: ['Modern Styles', 'Easy Online Shopping', 'Wide Selection'],
        button: 'View Graham & Brown',
        url: 'https://www.grahambrown.com/us/wallpaper/',
        matchPriorities: ['best-design', 'budget', 'easy-installation', 'eco', 'fast'],
        matchStyles: ['modern', 'luxury', 'floral', 'tropical', 'farmhouse', 'mural'],
        matchProjects: ['powder', 'living', 'coastal'],
        keywords: ['modern', 'designer', 'floral', 'tropical', 'mural', 'powder', 'living'],
      },
      {
        name: 'WALLISM',
        subtitle: 'MODERN WALL MURALS',
        image: 'assets/img/wallpaper/wallism.jpg',
        description: 'Strong option for modern murals, nature-inspired designs, abstract walls and custom accent walls.',
        benefits: ['Custom Murals', 'Nature Inspired', 'Modern Designs'],
        button: 'View Wallism',
        url: 'https://wallism.com/',
        matchPriorities: ['best-design', 'eco'],
        matchStyles: ['modern', 'tropical', 'abstract', 'nursery', 'mural'],
        matchProjects: ['nursery', 'living', 'coastal'],
        keywords: ['mural', 'nature', 'jungle', 'landscape', 'abstract', 'accent wall', 'nursery'],
      },
      {
        name: 'WALLSHOPPE',
        subtitle: 'COLORFUL & REMOVABLE',
        image: 'assets/img/wallpaper/wallshoppe.jpg',
        description: 'Good option for modern, colorful, sustainable, peel and stick or removable wallpaper projects.',
        benefits: ['Peel & Stick', 'Colorful Designs', 'Sustainable Options'],
        button: 'View Wallshoppe',
        url: 'https://www.wallshoppe.com/collections/wallpaper',
        matchPriorities: ['best-design', 'easy-installation', 'eco'],
        matchStyles: ['modern', 'tropical', 'abstract', 'nursery'],
        matchProjects: ['nursery', 'living', 'coastal'],
        keywords: ['modern', 'colorful', 'kids', 'nursery', 'removable', 'peel', 'tropical'],
      },
      {
        name: 'CHASING PAPER',
        subtitle: 'REMOVABLE WALLPAPER',
        image: 'assets/img/wallpaper/chasing-paper.jpg',
        description: 'Good option for modern removable wallpaper, temporary projects, nurseries and easy installation.',
        benefits: ['Removable', 'Easy Installation', 'Temporary Friendly'],
        button: 'View Chasing Paper',
        url: 'https://chasingpaper.com/',
        matchPriorities: ['budget', 'easy-installation', 'eco'],
        matchStyles: ['modern', 'nursery', 'floral'],
        matchProjects: ['nursery', 'living'],
        keywords: ['removable', 'temporary', 'nursery', 'kids', 'easy', 'peel'],
      },
      {
        name: 'MILTON & KING',
        subtitle: 'PREMIUM DESIGNER LOOK',
        image: 'assets/img/wallpaper/milton-king.jpg',
        description: 'Premium wallpaper with modern, creative, artistic and designer-inspired styles.',
        benefits: ['Premium Look', 'Creative Patterns', 'Designer Style'],
        button: 'View Milton & King',
        url: 'https://www.miltonandking.com/',
        matchPriorities: ['best-design'],
        matchStyles: ['modern', 'luxury', 'abstract'],
        matchProjects: ['powder', 'living'],
        keywords: ['premium', 'modern', 'abstract', 'designer', 'creative', 'artistic'],
      },
      {
        name: 'PHILLIP JEFFRIES',
        subtitle: 'LUXURY WALLCOVERINGS',
        image: 'assets/img/wallpaper/phillip.jpg',
        description: 'High-end wallcoverings for luxury residential and commercial spaces that need a premium finish.',
        benefits: ['Luxury Materials', 'Commercial Options', 'High-End Finish'],
        button: 'View Phillip Jeffries',
        url: 'https://phillipjeffries.com/',
        matchPriorities: ['commercial', 'best-design', 'fast'],
        matchStyles: ['luxury', 'modern', 'minimalist'],
        matchProjects: ['restaurant', 'powder', 'living'],
        keywords: ['luxury', 'premium', 'commercial', 'restaurant', 'hotel', 'powder'],
      },
      {
        name: 'SCHUMACHER',
        subtitle: 'DESIGNER WALLPAPER',
        image: 'assets/img/wallpaper/schumacher.jpg',
        description: 'Designer wallpaper with premium patterns for elegant, classic and refined projects.',
        benefits: ['Designer Patterns', 'Premium Quality', 'Elegant Interiors'],
        button: 'View Schumacher',
        url: 'https://schumacher.com/catalog/1',
        matchPriorities: ['best-design', 'commercial'],
        matchStyles: ['luxury', 'floral', 'modern'],
        matchProjects: ['powder', 'living', 'restaurant'],
        keywords: ['luxury', 'designer', 'floral', 'classic', 'elegant', 'powder'],
      },
      {
        name: 'SERENA & LILY',
        subtitle: 'PREMIUM COASTAL STYLE',
        image: 'assets/img/wallpaper/serena.jpg',
        description: 'Premium residential wallpaper for coastal, refined, farmhouse and elegant interiors.',
        benefits: ['Coastal Style', 'Premium Quality', 'Timeless Look'],
        button: 'View Serena & Lily',
        url: 'https://www.serenaandlily.com/decor-pillow-walls-fabric-all-wallcovering',
        matchPriorities: ['best-design'],
        matchStyles: ['luxury', 'farmhouse', 'minimalist'],
        matchProjects: ['coastal', 'powder', 'living'],
        keywords: ['coastal', 'premium', 'bedroom', 'soft', 'timeless', 'farmhouse'],
      },
      {
        name: 'KRAVET',
        subtitle: 'DESIGNER WALLCOVERING',
        image: 'assets/img/wallpaper/kravet.jpg',
        description: 'Designer wallcoverings, especially useful for projects involving interior designers.',
        benefits: ['Designer Grade', 'Premium Selection', 'Interior Design Focused'],
        button: 'View Kravet',
        url: 'https://www.kravet.com/wallcovering',
        matchPriorities: ['best-design'],
        matchStyles: ['luxury', 'modern', 'floral'],
        matchProjects: ['powder', 'living'],
        keywords: ['designer', 'interior designer', 'luxury', 'premium', 'elegant'],
      },
      {
        name: 'YORK WALLCOVERINGS',
        subtitle: 'RESIDENTIAL WALLPAPER',
        image: 'assets/img/wallpaper/york.jpg',
        description: 'Reliable residential wallpaper brand with strong options for floral, farmhouse, traditional and easy installation projects.',
        benefits: ['Wide Selection', 'Reliable Quality', 'Installer Friendly'],
        button: 'View York',
        url: 'https://www.yorkwallcoverings.com/',
        matchPriorities: ['best-design', 'budget', 'easy-installation'],
        matchStyles: ['floral', 'farmhouse', 'modern', 'luxury'],
        matchProjects: ['nursery', 'living', 'powder'],
        keywords: ['floral', 'farmhouse', 'traditional', 'residential', 'nursery', 'easy'],
      },
      {
        name: 'HYGGE & WEST',
        subtitle: 'SOFT RESIDENTIAL STYLE',
        image: 'assets/img/wallpaper/hygge-west.jpg',
        description: 'Warm, soft and family-friendly wallpaper options for nurseries, floral rooms and cozy residential spaces.',
        benefits: ['Nursery Friendly', 'Soft Florals', 'Warm Residential Style'],
        button: 'View Hygge & West',
        url: 'https://www.hyggeandwest.com/collections/all-wallpaper',
        matchPriorities: ['eco'],
        matchStyles: ['floral', 'farmhouse', 'nursery'],
        matchProjects: ['nursery', 'living'],
        keywords: ['nursery', 'kids', 'soft', 'warm', 'floral', 'family'],
      },
      {
        name: 'ANEWALL',
        subtitle: 'ARTISTIC MURALS',
        image: 'assets/img/wallpaper/anewall.jpg',
        description: 'Artistic wallpapers and murals for floral, nursery, vintage, farmhouse and personalized spaces.',
        benefits: ['Artistic Murals', 'Nursery Options', 'Custom Sizes'],
        button: 'View Anewall',
        url: 'https://anewall.com/collections/products',
        matchPriorities: ['best-design'],
        matchStyles: ['floral', 'farmhouse', 'abstract', 'nursery', 'mural'],
        matchProjects: ['nursery', 'living', 'coastal'],
        keywords: ['mural', 'nursery', 'vintage', 'floral', 'artistic', 'custom'],
      },
      {
        name: 'REBEL WALLS',
        subtitle: 'CUSTOM WALL MURALS',
        image: 'assets/img/wallpaper/rebel-walls.jpg',
        description: 'Custom wall murals for tropical, abstract, large statement walls and made-to-measure projects.',
        benefits: ['Custom Murals', 'Statement Walls', 'Made to Measure'],
        button: 'View Rebel Walls',
        url: 'https://rebelwalls.com/',
        matchPriorities: ['best-design'],
        matchStyles: ['tropical', 'abstract', 'mural'],
        matchProjects: ['living', 'coastal'],
        keywords: ['mural', 'custom', 'statement wall', 'tropical', 'abstract', 'large wall'],
      },
      {
        name: 'PHOTOWALL',
        subtitle: 'CUSTOM WALL MURALS',
        image: 'assets/img/wallpaper/photowall.jpg',
        description: 'Custom murals for tropical, nature, landscapes, children rooms and large walls.',
        benefits: ['Wall Murals', 'Nature Themes', 'Custom Sizes'],
        button: 'View Photowall',
        url: 'https://www.photowall.com/us/wall-murals',
        matchPriorities: ['fast'],
        matchStyles: ['tropical', 'mural', 'nursery'],
        matchProjects: ['nursery', 'living', 'coastal'],
        keywords: ['mural', 'nature', 'landscape', 'children', 'tropical', 'custom'],
      },
      {
        name: 'MURALS YOUR WAY',
        subtitle: 'CUSTOM MURALS',
        image: 'assets/img/wallpaper/murals-your-way.jpg',
        description: 'Residential and commercial custom wall murals for large projects and fast mural needs.',
        benefits: ['Custom Murals', 'Residential & Commercial', 'Large Wall Projects'],
        button: 'View Murals Your Way',
        url: 'https://www.muralsyourway.com/wall-murals',
        matchPriorities: ['fast', 'commercial'],
        matchStyles: ['mural'],
        matchProjects: ['restaurant', 'living'],
        keywords: ['mural', 'custom', 'commercial', 'large wall', 'restaurant'],
      },
      {
        name: 'KOROSEAL',
        subtitle: 'COMMERCIAL WALLCOVERING',
        image: 'assets/img/wallpaper/koroseal.jpg',
        description: 'Commercial wallcovering for Type II, wall protection, high traffic and contract projects.',
        benefits: ['Type II Options', 'High Traffic', 'Wall Protection'],
        button: 'View Koroseal',
        url: 'https://koroseal.com/',
        matchPriorities: ['commercial'],
        matchStyles: ['modern', 'minimalist'],
        matchProjects: ['restaurant'],
        keywords: ['commercial', 'restaurant', 'type ii', 'high traffic', 'hospitality', 'office'],
      },
      {
        name: 'WOLF-GORDON',
        subtitle: 'CONTRACT WALLCOVERINGS',
        image: 'assets/img/wallpaper/wolf-gordon.jpg',
        description: 'Contract wallcoverings, wall protection, acoustic materials and commercial interior solutions.',
        benefits: ['Contract Grade', 'Acoustic Options', 'Wall Protection'],
        button: 'View Wolf-Gordon',
        url: 'https://www.wolfgordon.com/wallcovering',
        matchPriorities: ['commercial', 'eco'],
        matchStyles: ['modern', 'minimalist', 'abstract'],
        matchProjects: ['restaurant'],
        keywords: ['commercial', 'contract', 'acoustic', 'restaurant', 'wall protection'],
      },
      {
        name: 'YORK CONTRACT',
        subtitle: 'TYPE II COMMERCIAL VINYL',
        image: 'assets/img/wallpaper/york-contract.jpg',
        description: 'Type II commercial vinyl and high performance wallcovering for commercial projects.',
        benefits: ['Type II Vinyl', 'High Performance', 'Commercial Ready'],
        button: 'View York Contract',
        url: 'https://www.yorkcontract.com/',
        matchPriorities: ['commercial'],
        matchStyles: ['modern', 'minimalist'],
        matchProjects: ['restaurant'],
        keywords: ['commercial', 'type ii', 'vinyl', 'high performance', 'restaurant'],
      },
      {
        name: 'ASTEK',
        subtitle: 'COMMERCIAL & CUSTOM',
        image: 'assets/img/wallpaper/astek.jpg',
        description: 'Commercial wallcovering and custom design options for specialized interiors.',
        benefits: ['Commercial Grade', 'Custom Design', 'Specialized Interiors'],
        button: 'View Astek',
        url: 'https://www.astek.com/',
        matchPriorities: ['commercial'],
        matchStyles: ['modern', 'abstract'],
        matchProjects: ['restaurant'],
        keywords: ['commercial', 'custom', 'restaurant', 'specialized', 'contract'],
      },
      {
        name: 'US WALL DECOR',
        subtitle: 'ACCESSIBLE WALLPAPER',
        image: 'assets/img/wallpaper/us-wall-decor.jpg',
        description: 'Accessible wallpaper option for budget-friendly and fast online shopping projects.',
        benefits: ['Budget Friendly', 'Online Shopping', 'Wide Access'],
        button: 'View US Wall Decor',
        url: 'https://uswalldecor.com/',
        matchPriorities: ['budget', 'fast'],
        matchStyles: ['modern', 'farmhouse', 'floral'],
        matchProjects: ['living', 'nursery'],
        keywords: ['budget', 'affordable', 'fast', 'online', 'residential'],
      },
      {
        name: 'TEMPAPER',
        subtitle: 'PEEL & STICK',
        image: 'assets/img/wallpaper/tempaper.jpg',
        description: 'Peel and stick wallpaper for easier installation, temporary projects and accessible residential updates.',
        benefits: ['Peel & Stick', 'Easy Install', 'Temporary Friendly'],
        button: 'View Tempaper',
        url: 'https://tempaper.com/',
        matchPriorities: ['budget', 'easy-installation'],
        matchStyles: ['modern', 'floral', 'tropical'],
        matchProjects: ['nursery', 'living'],
        keywords: ['peel', 'stick', 'temporary', 'easy installation', 'budget'],
      },
    ];
  private readonly styleRecommendations: Record<string, string[]> = {
  modern: [
    'GRAHAM & BROWN',
    'WALLISM',
    'MILTON & KING'
  ],

  luxury: [
    'PHILLIP JEFFRIES',
    'SCHUMACHER',
    'SERENA & LILY'
  ],

  floral: [
    'YORK WALLCOVERINGS',
    'SCHUMACHER',
    'HYGGE & WEST'
  ],

  tropical: [
    'WALLISM',
    'REBEL WALLS',
    'GRAHAM & BROWN'
  ],

  farmhouse: [
    'YORK WALLCOVERINGS',
    'HYGGE & WEST',
    'SERENA & LILY'
  ],

  abstract: [
    'WALLISM',
    'MILTON & KING',
    'REBEL WALLS'
  ],

  nursery: [
    'HYGGE & WEST',
    'ANEWALL',
    'CHASING PAPER'
  ],

  mural: [
    'WALLISM',
    'REBEL WALLS',
    'PHOTOWALL'
  ],

  commercial: [
    'KOROSEAL',
    'WOLF-GORDON',
    'YORK CONTRACT'
  ]
};

private readonly priorityRecommendations: Record<string, string[]> = {
  'best-design': [
    'SCHUMACHER',
    'PHILLIP JEFFRIES',
    'MILTON & KING'
  ],

  'easy-installation': [
    'CHASING PAPER',
    'TEMPAPER',
    'WALLSHOPPE'
  ],

  commercial: [
    'KOROSEAL',
    'WOLF-GORDON',
    'YORK CONTRACT'
  ],

  budget: [
    'US WALL DECOR',
    'TEMPAPER',
    'GRAHAM & BROWN'
  ],

  eco: [
    'WALLSHOPPE',
    'HYGGE & WEST',
    'WALLISM'
  ],

  fast: [
    'PHOTOWALL',
    'GRAHAM & BROWN',
    'US WALL DECOR'
  ]
};

private readonly projectRecommendations: Record<string, string[]> = {
  nursery: [
    'HYGGE & WEST',
    'ANEWALL',
    'CHASING PAPER'
  ],

  powder: [
    'PHILLIP JEFFRIES',
    'SCHUMACHER',
    'SERENA & LILY'
  ],

  restaurant: [
    'KOROSEAL',
    'WOLF-GORDON',
    'YORK CONTRACT'
  ],

  living: [
    'GRAHAM & BROWN',
    'MILTON & KING',
    'WALLISM'
  ],

  coastal: [
    'SERENA & LILY',
    'GRAHAM & BROWN',
    'ANEWALL'
  ]
};

private readonly combinationRecommendations: Record<string, string[]> = {
  'luxury|commercial': [
    'PHILLIP JEFFRIES',
    'SCHUMACHER',
    'KRAVET'
  ],

  'mural|commercial': [
    'MURALS YOUR WAY',
    'ASTEK',
    'WOLF-GORDON'
  ],

  'nursery|easy-installation': [
    'CHASING PAPER',
    'WALLSHOPPE',
    'ANEWALL'
  ],

  'commercial|restaurant': [
    'KOROSEAL',
    'WOLF-GORDON',
    'YORK CONTRACT'
  ]
};
  brands: RecommendationBrand[] = [];
  get visibleStyles(): StyleOption[] {
    return this.showAllStyles ? this.styles : this.styles.slice(0, 4);
  }
 
setProjectDescription(value: string): void {
  this.projectDescription = value;
}
  selectStartOption(option: StartOption): void {
    this.selectedStartOption = option;
  }
  goToPreferences(): void {
    if (!this.selectedStartOption) {
      return;
    }

    if (this.selectedStartOption === 'shop-online') {
      this.currentStep = 'preferences';
      this.scrollToTop();
      return;
    }

    if (this.selectedStartOption === 'local-stores') {
      this.currentStep = 'local-results';
      this.scrollToTop();
      return;
    }

    if (this.selectedStartOption === 'not-sure') {
      this.projectOrigin = 'start';
      this.currentStep = 'project';
      this.scrollToTop();
      return;
    }
  }
  goToProject(): void {
    if (!this.selectedPriorities.length || !this.selectedStyle) {
      return;
    }

    this.projectOrigin = 'preferences';
    this.currentStep = 'project';
    this.scrollToTop();
  }
  goBackFromProject(): void {
  this.currentStep = this.projectOrigin;
  this.scrollToTop();
}
  goBackToStart(): void {
    this.currentStep = 'start';
    this.scrollToTop();
  }

  goBackToPreferences(): void {
    this.currentStep = 'preferences';
    this.scrollToTop();
  }

  goBackToProject(): void {
    this.currentStep = 'project';
    this.scrollToTop();
  }

  togglePriority(key: string): void {
  if (this.selectedPriorities.includes(key)) {
    this.selectedPriorities =
      this.selectedPriorities.filter(item => item !== key);

    return;
  }

  if (this.selectedPriorities.length >= 2) {
    return;
  }

  this.selectedPriorities = [
    ...this.selectedPriorities,
    key
  ];
}

  selectStyle(key: string): void {
  this.selectedStyle = key;
}

 selectProject(key: string): void {
  this.selectedProject = key;
}

  toggleStyles(): void {
    this.showAllStyles = !this.showAllStyles;
  }

 getResults(): void {
  if (!this.selectedProject && !this.projectDescription.trim()) {
    return;
  }

  this.brands = this.buildRecommendations();

  this.hasResults = true;
  this.currentStep = 'results';
  this.scrollToTop();
}

  resetWizard(): void {
    this.currentStep = 'start';
    this.selectedStartOption = '';
    this.selectedPriorities = [];
    this.selectedStyle = '';
    this.selectedProject = '';
    this.projectDescription = '';
    this.showAllStyles = false;
    this.hasResults = false;
    this.brands = [];
    this.scrollToTop();
  }

  private getCombinationKeys(): string[] {
  const keys: string[] = [];

  for (const priority of this.selectedPriorities) {
    if (this.selectedStyle) {
      keys.push(`${this.selectedStyle}|${priority}`);
    }

    if (this.selectedProject) {
      keys.push(`${priority}|${this.selectedProject}`);
    }
  }

  if (this.selectedStyle && this.selectedProject) {
    keys.push(`${this.selectedStyle}|${this.selectedProject}`);
  }

  return keys;
}

private getRecommendationNames(): string[] {
  const combinationKeys = this.getCombinationKeys();

  for (const key of combinationKeys) {
    const combination = this.combinationRecommendations[key];

    if (combination) {
      return combination.slice(0, 3);
    }
  }

  const styleMatch = this.styleRecommendations[this.selectedStyle];

  if (styleMatch) {
    return styleMatch.slice(0, 3);
  }

  for (const priority of this.selectedPriorities) {
    const priorityMatch = this.priorityRecommendations[priority];

    if (priorityMatch) {
      return priorityMatch.slice(0, 3);
    }
  }

  const projectMatch =
    this.projectRecommendations[this.selectedProject];

  if (projectMatch) {
    return projectMatch.slice(0, 3);
  }

  return [
    'GRAHAM & BROWN',
    'WALLISM',
    'YORK WALLCOVERINGS'
  ];
}

private buildRecommendations(): RecommendationBrand[] {
  const names = this.getRecommendationNames();

  return names
    .map(name =>
      this.allBrands.find(brand => brand.name === name)
    )
    .filter(
      (brand): brand is RecommendationBrand => Boolean(brand)
    )
    .slice(0, 3);
}

  openBrand(brand: Brand): void {
    if (!brand.url) return;
    window.open(brand.url, '_blank', 'noopener,noreferrer');
  }

  private scrollToTop(): void {
    setTimeout(() => {
      document.querySelector('.wallpaper-page')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }

  goFromLocalResultsToPreferences(): void {
  this.selectedStartOption = 'shop-online';
  this.currentStep = 'preferences';
  this.scrollToTop();
}

goFromLocalResultsToProject(): void {
  this.projectOrigin = 'local-results';
  this.currentStep = 'project';
  this.scrollToTop();
}
}