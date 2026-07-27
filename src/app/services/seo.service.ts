import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
} from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly siteUrl = 'https://casawallpaper.com';

  private readonly defaultTitle =
    'Casa Wallpaper | Find Wallpaper Installers and Project Resources';

  private readonly defaultDescription =
    'Find wallpaper installers, calculate project quantities and explore resources for residential and commercial wallpaper projects.';

  init(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd =>
            event instanceof NavigationEnd
        ),
        map(() => {
          let route = this.activatedRoute;

          while (route.firstChild) {
            route = route.firstChild;
          }

          return route;
        }),
        mergeMap(route => route.data)
      )
      .subscribe(data => {
        const title = data['title'] || this.defaultTitle;
        const description =
          data['description'] || this.defaultDescription;
        const canonical =
          data['canonical'] || this.cleanRouterUrl(this.router.url);
        const robots = data['robots'] || 'index, follow';
        const image =
          data['image'] || '/assets/img/og-image.jpg';

        this.updateTags({
          title,
          description,
          canonical,
          robots,
          image,
        });
      });
  }

  private updateTags(config: {
    title: string;
    description: string;
    canonical: string;
    robots: string;
    image: string;
  }): void {
    const canonicalUrl = this.buildUrl(config.canonical);
    const imageUrl = this.buildUrl(config.image);

    this.titleService.setTitle(config.title);

    this.meta.updateTag({
      name: 'description',
      content: config.description,
    });

    this.meta.updateTag({
      name: 'robots',
      content: config.robots,
    });

    this.meta.updateTag({
      property: 'og:title',
      content: config.title,
    });

    this.meta.updateTag({
      property: 'og:description',
      content: config.description,
    });

    this.meta.updateTag({
      property: 'og:type',
      content: 'website',
    });

    this.meta.updateTag({
      property: 'og:url',
      content: canonicalUrl,
    });

    this.meta.updateTag({
      property: 'og:image',
      content: imageUrl,
    });

    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });

    this.meta.updateTag({
      name: 'twitter:title',
      content: config.title,
    });

    this.meta.updateTag({
      name: 'twitter:description',
      content: config.description,
    });

    this.meta.updateTag({
      name: 'twitter:image',
      content: imageUrl,
    });

    this.setCanonical(canonicalUrl);
  }

  private cleanRouterUrl(url: string): string {
    const path = url.split('?')[0].split('#')[0];

    return path || '/';
  }

  private buildUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const normalizedPath = path.startsWith('/')
      ? path
      : `/${path}`;

    return `${this.siteUrl}${normalizedPath}`;
  }

  private setCanonical(url: string): void {
    let link =
      document.querySelector<HTMLLinkElement>(
        "link[rel='canonical']"
      );

    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }
}