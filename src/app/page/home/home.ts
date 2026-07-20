import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PortfolioService } from '../../services/portfolio.service';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
import { ElementRef, ViewChild, NgZone } from '@angular/core';
import PocketBase from 'pocketbase';
import { InstallerAvailabilityService } from '../../services/installer-availability.service';
declare const google: any;
declare var WOW: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('locationInput') locationInput!: ElementRef<HTMLInputElement>;
  private pb = new PocketBase('https://db.buckapi.site:8055');

  isSavingSearch = false;
  formError = '';

  projectType: 'residential' | 'commercial' = 'residential';
  locationQuery = '';
  timeline = '';
  hasMeasurements: 'yes' | 'no' | '' = '';

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

  locationError = '';
  autocompleteInitialized = false;
  activeVideoId: string | null = null;
  videoPortfolios: any[] = [];
  videoSwiper: any;
  ngFormRequest: FormGroup;
  submitted = false;
  public isError = false;
  phoneNumber: string = '9198855401';
  menuOpen: boolean = false;
  isBrowser: boolean = false;
  heroSwiper: any;
  projectSwiper: any;
  testimonialSwiper: any;
  portfolios: any[] = [];
  filteredPortfolios: any[] = [];
  activeReviewIndex = 0;
  reviews = [];
  form = {
    name: '',
    email: '',
    phone: '',
    zipcode: '',
    service: '',
    projectType: '',
    message: ''
  };
  constructor(public router: Router, private formBuilder: FormBuilder, @Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private portfolioService: PortfolioService, private cdr: ChangeDetectorRef, private ngZone: NgZone, private installerAvailability:
    InstallerAvailabilityService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    {
      this.ngFormRequest = this.formBuilder.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern('^\\d{10}$')]],
        zipcode: ['', Validators.required],
        servicesType: ['', Validators.required],
        projectType: ['', Validators.required],
        area: ['', Validators.required],
        message: ['', Validators.required],
      });
    }
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;
    window.scrollTo(0, 0);
    this.loadPortfolios();
    this.ngFormRequest = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^\\d{10}$')]],
      zipcode: ['', Validators.required],
      servicesType: ['', Validators.required],
      projectType: ['', Validators.required],
      area: ['', Validators.required],
      message: ['', Validators.required],
    });
  }
  initScripts() {
    window.addEventListener('scroll', () => {
      console.log(window.scrollY);
    });
    this.projectSwiper = new Swiper('.project-slider', {
      loop: true,
      autoplay: { delay: 5000 },
      slidesPerView: 3,
      spaceBetween: 30,
      preventClicks: false,
      preventClicksPropagation: false,
      breakpoints: {
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1200: { slidesPerView: 3 }
      }
    });
  }
  goTo(event: Event, route: string) {
    event.preventDefault();
    event.stopPropagation();

    this.router.navigateByUrl(route).then((ok) => {
      console.log('navigate ->', route, ok);
      if (ok) {
        setTimeout(() => window.scrollTo(0, 0), 50);
      }
    });
  }
  get f(): { [key: string]: AbstractControl } {
    return this.ngFormRequest.controls;
  }

  toggleMenu(event: MouseEvent) {
    this.menuOpen = !this.menuOpen;
    event.stopPropagation();
  }

  sendSMS() {
    window.open(`sms:${this.phoneNumber}`, '_self');
  }

  makeCall() {
    window.open(`tel:${this.phoneNumber}`, '_self');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.menuOpen) {
      const clickedInside = (event.target as HTMLElement).closest('.fab');
      if (!clickedInside) {
        this.menuOpen = false;
      }
    }
  }
  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    setTimeout(() => {
      this.initGoogleAutocomplete();
    }, 300);
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

        this.selectingGoogleLocation = true;
        this.locationQuery = this.selectedLocation.formattedAddress;

        this.locationError = '';
        this.formError = '';

        this.cdr.detectChanges();
      });
    });
  }
  ngOnDestroy(): void {
    this.heroSwiper?.destroy(true, true);
    this.projectSwiper?.destroy(true, true);
    this.testimonialSwiper?.destroy(true, true);
    this.videoSwiper?.destroy(true, true);
  }

  initSwipers() {
    if (this.heroSwiper) this.heroSwiper.destroy(true, true);
    if (this.projectSwiper) this.projectSwiper.destroy(true, true);
    if (this.testimonialSwiper) this.testimonialSwiper.destroy(true, true);

    this.heroSwiper = new Swiper('.hero-slider', {
      loop: true,
      autoplay: { delay: 5000 },
      effect: 'fade'
    });

    this.projectSwiper = new Swiper('.project-slider', {
      loop: true,
      autoplay: { delay: 5000 },
      slidesPerView: 3,
      spaceBetween: 30,
      breakpoints: {
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1200: { slidesPerView: 3 }
      }
    });

    this.testimonialSwiper = new Swiper('.testimonial-slider', {
      loop: true,
      navigation: {
        nextEl: '.array-next',
        prevEl: '.array-prev'
      }
    });
  }

  async loadPortfolios() {
    try {
      this.portfolios = await this.portfolioService.getPortfolios();

      this.filteredPortfolios = this.portfolios;

      this.videoPortfolios = this.portfolios.filter(portfolio =>
        portfolio.type === 'video' &&
        (
          portfolio.images?.length > 0 ||
          portfolio.instagramUrl
        )
      ); this.cdr.detectChanges();

      setTimeout(() => {
        this.initVideoSwiper();
      }, 100);

    } catch (error) {
      console.error('Error loading portfolios:', error);
    }
  }
  initVideoSwiper() {
    if (!this.isBrowser) return;

    if (this.videoSwiper) {
      this.videoSwiper.destroy(true, true);
    }

    this.videoSwiper = new Swiper('.cw-videos-slider', {
      modules: [Pagination],
      slidesPerView: 3,
      spaceBetween: 24,
      pagination: {
        el: '.cw-videos-pagination',
        clickable: true,
      },
      breakpoints: {
        0: {
          slidesPerView: 1.1,
          spaceBetween: 16,
        },
        768: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 24,
        },
      },
    });
  }

  getPortfolioFileUrl(portfolio: any): string {
    if (!portfolio.images || portfolio.images.length === 0) return '';
    return this.portfolioService.fileUrl(portfolio, portfolio.images[0]) || '';
  }
  playVideo(portfolio: any) {

    if (
      portfolio.sourceType === 'instagram' &&
      portfolio.instagramUrl
    ) {

      window.open(
        portfolio.instagramUrl,
        '_blank'
      );

      return;
    }

    const videoUrl =
      this.getPortfolioFileUrl(portfolio);

    Swal.fire({
      html: `
      <video
        controls
        autoplay
        style="width:100%">
        <source src="${videoUrl}">
      </video>
    `,
      width: '900px',
      showCloseButton: true,
      showConfirmButton: false
    });
  }

  getImageUrl(portfolio: any): string {
    if (portfolio.images && portfolio.images.length > 0) {
      return this.portfolioService.fileUrl(portfolio, portfolio.images[0]) || '';
    }
    return '';
  }

  filterPortfolios(type: string): void {
    if (type === 'all') {
      this.filteredPortfolios = this.portfolios;
    } else {
      this.filteredPortfolios = this.portfolios.filter(portfolio => portfolio.tag === type);
    }
  }

  viewImage(portfolio: any, index: number = 0): void {
    const images = portfolio.images || [];
    if (images.length === 0) return;

    const imageUrl = this.portfolioService.fileUrl(portfolio, images[index]);
    const title = images.length > 1 ? `${portfolio.name} (${index + 1}/${images.length})` : portfolio.name;

    const config: any = {
      title: title,
      imageUrl: imageUrl,
      imageAlt: portfolio.name,
      showCloseButton: true,
      showConfirmButton: false,
      width: '80%',
    };

    if (images.length > 1) {
      config.showConfirmButton = index < images.length - 1;
      config.confirmButtonText = 'Next';
      config.showDenyButton = index > 0;
      config.denyButtonText = 'Previous';
    }

    Swal.fire(config).then((result) => {
      if (result.isConfirmed && index < images.length - 1) {
        this.viewImage(portfolio, index + 1);
      } else if (result.isDenied && index > 0) {
        this.viewImage(portfolio, index - 1);
      }
    });
  }

  onIsError(): void {
    this.isError = true;
  }

  sendContact() {
    this.http.post(
      'https://casawallpaper.com/api/send-contact.php',
      this.form
    ).subscribe({
      next: () => {
        alert('Message sent successfully');
        this.form = {
          name: '',
          email: '',
          phone: '',
          zipcode: '',
          service: '',
          projectType: '',
          message: ''
        };
      },
      error: (err) => {
        console.error(err);
        alert('Error sending message');
      }
    });
  }

  setActiveReview(index: number): void {
    this.activeReviewIndex = index;
  }

  scrollReviews(direction: 'prev' | 'next'): void {
    const total = this.reviews.length;

    if (direction === 'next') {
      this.activeReviewIndex = (this.activeReviewIndex + 1) % total;
    } else {
      this.activeReviewIndex = this.activeReviewIndex === 0
        ? total - 1
        : this.activeReviewIndex - 1;
    }

    const carousel = document.querySelector('.cw-reviews-carousel') as HTMLElement;
    const card = carousel?.querySelector('.cw-review-card') as HTMLElement;

    if (carousel && card) {
      carousel.scrollTo({
        left: card.offsetWidth * this.activeReviewIndex,
        behavior: 'smooth'
      });
    }
  }
  toggleInlineVideo(portfolio: any): void {
    if (portfolio.sourceType === 'instagram' && portfolio.instagramUrl) {
      window.open(portfolio.instagramUrl, '_blank');
      return;
    }

    this.activeVideoId = this.activeVideoId === portfolio.id ? null : portfolio.id;
  }

  isVideoActive(portfolio: any): boolean {
    return this.activeVideoId === portfolio.id;
  }
 /*  async findInstaller() {
    console.log('1. Entró a findInstaller');

    this.formError = '';

    console.log({
      projectType: this.projectType,
      locationQuery: this.locationQuery,
      selectedLocation: this.selectedLocation,
      timeline: this.timeline,
      hasMeasurements: this.hasMeasurements,
    });

    if (!this.projectType) {
      console.warn('Falla projectType');
      this.formError = 'Please select a project type.';
      return;
    }

    if (!this.locationQuery.trim()) {
      console.warn('Falla locationQuery');
      this.formError = 'Please enter your ZIP code or location.';
      return;
    }

    if (!this.selectedLocation) {
      console.warn('Falla selectedLocation');
      this.formError = 'Please select a valid location from the suggestions.';
      return;
    }

    if (!this.timeline) {
      console.warn('Falla timeline');
      this.formError = 'Please select when you want to start.';
      return;
    }

    if (!this.hasMeasurements) {
      console.warn('Falla hasMeasurements');
      this.formError = 'Please select if you already have measurements.';
      return;
    }

    console.log('2. Validaciones OK');

    if (this.isSavingSearch) return;

    try {
      this.isSavingSearch = true;

      const requestData = {
        status: 'sent',

        project_type: this.projectType,
        source: 'website',

        city: this.selectedLocation.city || '',
        zip_code: this.selectedLocation.zipCode || '',
        state: this.selectedLocation.state || '',
        state_code: this.selectedLocation.stateCode || '',
        country: this.selectedLocation.countryCode || 'US',
        formatted_address: this.selectedLocation.formattedAddress || this.locationQuery,

        lat: this.selectedLocation.lat || 0,
        lng: this.selectedLocation.lng || 0,

        desired_date: this.mapTimelineToDate(this.timeline),
        intention_level: this.mapTimelineToIntentionLevel(this.timeline),

        space_type: this.hasMeasurements === 'yes'
          ? 'has_measurements'
          : 'needs_measurements',

        max_leads: 3,
        sold_leads: 0,
        is_available: true,
      };
      console.log('2. Validaciones OK');
      const record = await this.pb.collection('requests').create(requestData);
      console.log('3. Registro creado', record);
      sessionStorage.setItem('currentRequestId', record.id);
      console.log('4. Navegando...');
      const navigationResult = await this.router.navigate([
        '/installer-results',
        record.id,
      ]);

      console.log('5. Resultado navegación:', navigationResult);

    } catch (error) {
      console.error('Error creating pending request:', error);
      this.formError = 'We could not start your search. Please try again.';
    } finally {
      this.isSavingSearch = false;
    }
  } */
 async findInstaller(): Promise<void> {
  this.formError = '';
  this.locationError = '';

  if (!this.projectType) {
    this.formError =
      'Please select a project type.';
    return;
  }

  if (!this.locationQuery.trim()) {
    this.formError =
      'Please enter your ZIP code or location.';
    return;
  }

  if (!this.selectedLocation) {
    this.formError =
      'Please select a valid location from the suggestions.';
    return;
  }

  if (!this.selectedLocation.zipCode) {
    this.formError =
      'The selected location does not include a valid ZIP Code.';
    return;
  }

  if (!this.timeline) {
    this.formError =
      'Please select when you want to start.';
    return;
  }

  if (!this.hasMeasurements) {
    this.formError =
      'Please select if you already have measurements.';
    return;
  }

  if (this.isSavingSearch) {
    return;
  }

  try {
    this.isSavingSearch = true;

    const installerDraft = {
      source: 'home',

      projectType: this.projectType,
      timeline: this.timeline,
      hasMeasurements: this.hasMeasurements,

      location: {
        query: this.locationQuery,
        formattedAddress:
          this.selectedLocation.formattedAddress,
        city:
          this.selectedLocation.city,
        state:
          this.selectedLocation.state,
        stateCode:
          this.selectedLocation.stateCode,
        country:
          this.selectedLocation.country,
        countryCode:
          this.selectedLocation.countryCode,
        zipCode:
          this.selectedLocation.zipCode,
        lat:
          this.selectedLocation.lat,
        lng:
          this.selectedLocation.lng,
        placeId:
          this.selectedLocation.placeId,
      },

      createdAt: new Date().toISOString(),
    };

    sessionStorage.setItem(
      'installerRequestDraft',
      JSON.stringify(installerDraft)
    );

    const hasAvailability =
      await this.installerAvailability.hasAvailability(
        this.selectedLocation.zipCode,
        this.projectType
      );

    if (!hasAvailability) {
      await this.router.navigate(
        ['/installer-unavailable'],
        {
          queryParams: {
            zipCode:
              this.selectedLocation.zipCode,
            city:
              this.selectedLocation.city,
            state:
              this.selectedLocation.state,
            stateCode:
              this.selectedLocation.stateCode,
            projectType:
              this.projectType
          }
        }
      );

      return;
    }

    if (this.projectType === 'commercial') {
      await this.router.navigate([
        '/installer/commercial'
      ]);

      return;
    }

    await this.router.navigate([
      '/installer/residential'
    ]);

  } catch (error) {
    console.error(
      'Error checking installer availability:',
      error
    );

    this.formError =
      'We could not verify installer availability. Please try again.';
  } finally {
    this.isSavingSearch = false;
    this.cdr.detectChanges();
  }
}
  mapTimelineToDate(timeline: string): string {
    const date = new Date();

    switch (timeline) {
      case 'ASAP':
      case 'As soon as possible':
        date.setDate(date.getDate() + 3);
        break;

      case 'Within 1 - 2 Weeks':
      case 'In 1-2 weeks':
        date.setDate(date.getDate() + 14);
        break;

      case 'Within 1 Month':
      case 'In 1 month':
        date.setMonth(date.getMonth() + 1);
        break;

      default:
        date.setMonth(date.getMonth() + 2);
        break;
    }

    return date.toISOString();
  }

  mapTimelineToIntentionLevel(timeline: string): 'low' | 'medium' | 'high' {
    switch (timeline) {
      case 'ASAP':
      case 'As soon as possible':
        return 'high';

      case 'Within 1 - 2 Weeks':
      case 'In 1-2 weeks':
      case 'Within 1 Month':
      case 'In 1 month':
        return 'medium';

      default:
        return 'low';
    }
  }

  private selectingGoogleLocation = false;

  onLocationQueryChange(value: string): void {
    this.locationQuery = value;

    if (this.selectingGoogleLocation) {
      this.selectingGoogleLocation = false;
      return;
    }

    this.selectedLocation = null;
    this.locationError = '';
    this.formError = '';
  }
}

