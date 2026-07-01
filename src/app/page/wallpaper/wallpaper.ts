import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Start } from './components/start/start';
import { Preferences } from './components/preferences/preferences';
import { Project } from './components/project/project';
import { Results } from './components/results/results';
import { LocalResults } from './components/local-results/local-results';


type FlowStep = 'start' | 'preferences' | 'project' | 'results'  | 'local-results';
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
type RecommendationRule = {
  styles?: string[];
  priorities?: string[];
  projects?: string[];
  keywords?: string[];
  brands: string[];
};
@Component({
  selector: 'app-wallpaper',
  standalone: true,
  imports: [CommonModule, FormsModule, Start,
  Preferences,
  Project,
  Results, LocalResults],
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
recommendationRules: RecommendationRule[] = [
  {
    styles: ['modern'],
    brands: ['GRAHAM & BROWN', 'WALLISM', 'WALLSHOPPE', 'CHASING PAPER', 'MILTON & KING'],
  },
  {
    styles: ['luxury'],
    brands: ['PHILLIP JEFFRIES', 'SCHUMACHER', 'SERENA & LILY', 'KRAVET', 'MILTON & KING'],
  },
  {
    styles: ['floral'],
    brands: ['YORK WALLCOVERINGS', 'GRAHAM & BROWN', 'SCHUMACHER', 'HYGGE & WEST', 'ANEWALL'],
  },
  {
    styles: ['tropical'],
    brands: ['WALLISM', 'WALLSHOPPE', 'REBEL WALLS', 'PHOTOWALL', 'GRAHAM & BROWN'],
  },
  {
    styles: ['farmhouse'],
    brands: ['YORK WALLCOVERINGS', 'GRAHAM & BROWN', 'HYGGE & WEST', 'SERENA & LILY', 'ANEWALL'],
  },
  {
    styles: ['abstract'],
    brands: ['WALLISM', 'WALLSHOPPE', 'MILTON & KING', 'REBEL WALLS', 'ANEWALL'],
  },
  {
    styles: ['nursery'],
    brands: ['HYGGE & WEST', 'ANEWALL', 'CHASING PAPER', 'WALLSHOPPE', 'WALLISM'],
  },
  {
    styles: ['mural'],
    brands: ['WALLISM', 'REBEL WALLS', 'PHOTOWALL', 'MURALS YOUR WAY', 'ANEWALL'],
  },
  {
    priorities: ['commercial'],
    brands: ['KOROSEAL', 'WOLF-GORDON', 'YORK CONTRACT', 'ASTEK', 'SCHUMACHER'],
  },
  {
    priorities: ['budget'],
    brands: ['GRAHAM & BROWN', 'YORK WALLCOVERINGS', 'US WALL DECOR', 'TEMPAPER', 'CHASING PAPER'],
  },
  {
    priorities: ['easy-installation'],
    brands: ['YORK WALLCOVERINGS', 'GRAHAM & BROWN', 'CHASING PAPER', 'TEMPAPER', 'WALLSHOPPE'],
  },
  {
    priorities: ['eco'],
    brands: ['WALLISM', 'WALLSHOPPE', 'HYGGE & WEST', 'CHASING PAPER', 'WOLF-GORDON'],
  },
  {
    priorities: ['fast'],
    brands: ['PHILLIP JEFFRIES', 'PHOTOWALL', 'MURALS YOUR WAY', 'GRAHAM & BROWN', 'US WALL DECOR'],
  },

  // Reglas especiales del documento
  {
    styles: ['mural'],
    priorities: ['eco'],
    keywords: ['nature', 'natural', 'jungle', 'landscape'],
    brands: ['WALLISM', 'REBEL WALLS', 'PHOTOWALL', 'ANEWALL'],
  },
  {
    styles: ['luxury'],
    projects: ['powder'],
    brands: ['PHILLIP JEFFRIES', 'SCHUMACHER', 'SERENA & LILY', 'MILTON & KING'],
  },
  {
    priorities: ['commercial'],
    projects: ['restaurant'],
    brands: ['KOROSEAL', 'WOLF-GORDON', 'YORK CONTRACT', 'ASTEK'],
  },
  {
    styles: ['nursery'],
    priorities: ['easy-installation'],
    brands: ['HYGGE & WEST', 'CHASING PAPER', 'ANEWALL', 'WALLSHOPPE'],
  },
];
  brands: Brand[] = [];

  get visibleStyles(): StyleOption[] {
    return this.showAllStyles ? this.styles : this.styles.slice(0, 4);
  }
  setProjectDescription(value: string): void {
  this.projectDescription = value;
  this.refreshRecommendations(false);
}

  selectStartOption(option: StartOption): void {
    this.selectedStartOption = option;
  }

 /*  goToPreferences(): void {
    if (!this.selectedStartOption) return;
    this.currentStep = 'preferences';
    this.scrollToTop();
  } */
  goToPreferences(): void {
  if (!this.selectedStartOption) return;

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
    this.currentStep = 'project';
    this.scrollToTop();
    return;
  }
}

  goToProject(): void {
    if (!this.selectedPriorities.length || !this.selectedStyle) return;
    this.currentStep = 'project';
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
      this.selectedPriorities = this.selectedPriorities.filter(item => item !== key);
      this.refreshRecommendations(false);
      return;
    }

    if (this.selectedPriorities.length >= 2) return;

    this.selectedPriorities = [...this.selectedPriorities, key];
    this.refreshRecommendations(false);
  }

  selectStyle(key: string): void {
    this.selectedStyle = key;
    this.refreshRecommendations(false);
  }

  selectProject(key: string): void {
    this.selectedProject = key;
    this.refreshRecommendations(false);
  }

  toggleStyles(): void {
    this.showAllStyles = !this.showAllStyles;
  }

  getResults(): void {
    if (!this.selectedProject && !this.projectDescription.trim()) return;

    this.hasResults = true;
    this.currentStep = 'results';
    this.refreshRecommendations(true);
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

  refreshRecommendations(forceShow = false): void {
  if (!forceShow && !this.hasResults) return;

  const text = this.projectDescription.toLowerCase().trim();

  const matchedRules = this.recommendationRules
    .map(rule => {
      let score = 0;

      if (rule.styles?.includes(this.selectedStyle)) {
        score += 10;
      }

      this.selectedPriorities.forEach(priority => {
        if (rule.priorities?.includes(priority)) {
          score += 10;
        }
      });

      if (rule.projects?.includes(this.selectedProject)) {
        score += 10;
      }

      rule.keywords?.forEach(keyword => {
        if (text.includes(keyword)) {
          score += 5;
        }
      });

      const hasRuleCondition =
        !!rule.styles?.length ||
        !!rule.priorities?.length ||
        !!rule.projects?.length ||
        !!rule.keywords?.length;

      return {
        rule,
        score: hasRuleCondition ? score : 0,
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const selectedRule = matchedRules[0];

  if (!selectedRule) {
    this.brands = this.allBrands.slice(0, 3);
    return;
  }

  this.brands = selectedRule.rule.brands
    .map(name => this.allBrands.find(brand => brand.name === name))
    .filter((brand): brand is RecommendationBrand => !!brand)
    .slice(0, 5);
}

  onProjectDescriptionChange(): void {
    this.refreshRecommendations(false);
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
}