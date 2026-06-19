import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PortfolioService } from '../../services/portfolio.service';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import Swiper from 'swiper';
import { Pagination } from 'swiper/modules';
declare var WOW: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
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
  constructor(public router: Router, private formBuilder: FormBuilder, @Inject(PLATFORM_ID) private platformId: Object, private http: HttpClient, private portfolioService: PortfolioService, private cdr: ChangeDetectorRef
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
  /* ngAfterViewInit(): void {
    new Swiper('.cw-videos-slider', {
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
  } */
  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
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

  /* playVideo(portfolio: any): void {
    const videoUrl = this.getPortfolioFileUrl(portfolio);
  
    if (!videoUrl) return;
  
    Swal.fire({
      title: portfolio.name,
      html: `
        <video 
          src="${videoUrl}" 
          controls 
          autoplay 
          style="width:100%; max-height:70vh; border-radius:14px;">
        </video>
      `,
      width: '850px',
      showConfirmButton: false,
      showCloseButton: true,
    });
  } */
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
}
