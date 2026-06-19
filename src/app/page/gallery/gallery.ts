import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { PortfolioService } from '../../services/portfolio.service';
import Swal from 'sweetalert2';

interface GalleryItem {
  portfolio: any;
  fileName?: string;
  url: string;
  type: 'image' | 'video' | 'instagram';
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class Gallery implements OnInit {
  portfolios: any[] = [];
  galleryItems: GalleryItem[] = [];
  filteredItems: GalleryItem[] = [];
  visibleItems: GalleryItem[] = [];

  activeFilter = 'all';
  itemsPerPage = 12;
  currentLimit = 12;

  constructor(
    private portfolioService: PortfolioService,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPortfolios();
  }

  async loadPortfolios() {
    try {
      this.portfolios = await this.portfolioService.getPortfolios();
      this.galleryItems = this.buildGalleryItems(this.portfolios);
      this.applyFilter('all');
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading portfolios:', error);
    }
  }

  buildGalleryItems(portfolios: any[]): GalleryItem[] {
    const items: GalleryItem[] = [];

    portfolios.forEach(portfolio => {
      if (portfolio.sourceType === 'instagram' && portfolio.instagramUrl) {
        items.push({
          portfolio,
          url: portfolio.instagramUrl,
          type: 'instagram',
        });

        return;
      }

      const files = portfolio.images || [];

      files.forEach((fileName: string) => {
        const url = this.portfolioService.fileUrl(portfolio, fileName) || '';

        if (!url) return;

        const type = portfolio.type === 'video' ? 'video' : 'image';

        items.push({
          portfolio,
          fileName,
          url,
          type,
        });
      });
    });

    return items;
  }

  filterPortfolios(type: string): void {
    this.applyFilter(type);
  }

  applyFilter(type: string): void {
    this.activeFilter = type;
    this.currentLimit = this.itemsPerPage;

    if (type === 'all') {
      this.filteredItems = this.galleryItems;
    } else {
      this.filteredItems = this.galleryItems.filter(
        item => item.portfolio.tag === type
      );
    }

    this.updateVisibleItems();
  }

  updateVisibleItems(): void {
    this.visibleItems = this.filteredItems.slice(0, this.currentLimit);
  }

  loadMore(): void {
    this.currentLimit += this.itemsPerPage;
    this.updateVisibleItems();
  }

  hasMoreItems(): boolean {
    return this.visibleItems.length < this.filteredItems.length;
  }

  openItem(item: GalleryItem): void {
    if (item.type === 'instagram') {
      window.open(item.url, '_blank');
      return;
    }

    if (item.type === 'video') {
      Swal.fire({
        title: item.portfolio.name,
        html: `
          <video
            src="${item.url}"
            controls
            autoplay
            style="width:100%; max-height:75vh; border-radius:14px;">
          </video>
        `,
        width: '900px',
        showConfirmButton: false,
        showCloseButton: true,
      });

      return;
    }

    Swal.fire({
      title: item.portfolio.name,
      imageUrl: item.url,
      imageAlt: item.portfolio.name,
      showCloseButton: true,
      showConfirmButton: false,
      width: '80%',
    });
  }
}