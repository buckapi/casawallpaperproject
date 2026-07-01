import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogModel } from '../../models/blog.model';
import { RealtimeBlogService } from '../../services/realtime-blog.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './blog-post.html',
  styleUrl: './blog-post.scss',
})
export class BlogPost implements OnInit {
  blogList: BlogModel[] = [];
  popularPosts: BlogModel[] = [];
  categories: { name: string; count: number }[] = [];

  loading = true;
  searchTerm = '';

  constructor(
    public realtimeBlogService: RealtimeBlogService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadPosts();
  }

  async loadPosts(): Promise<void> {
    try {
      this.loading = true;

      await this.realtimeBlogService.loadBlog();

      this.realtimeBlogService.blog$.subscribe(posts => {
        const published = posts
          .filter(post => post.status === 'publicado')
          .sort((a, b) => {
            const orderA = Number(a.orderIndex ?? 0);
            const orderB = Number(b.orderIndex ?? 0);

            if (orderA !== orderB) return orderA - orderB;

            return new Date(b.publishedAt || b.created || '').getTime()
              - new Date(a.publishedAt || a.created || '').getTime();
          });

        this.blogList = published;
        this.popularPosts = published.filter(post => post.featured).slice(0, 3);

        if (!this.popularPosts.length) {
          this.popularPosts = published.slice(0, 3);
        }

        this.categories = this.buildCategories(published);
        this.loading = false;
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error('Error cargando publicaciones públicas:', error);
      this.loading = false;
    }
  }

  getCoverUrl(item: BlogModel): string {
    if (!item?.cover) return 'assets/img/news/post-1.jpg';
    return this.realtimeBlogService.getFileUrl(item, item.cover);
  }

  getPostDay(item: BlogModel): string {
    const date = item.publishedAt || item.created;
    if (!date) return '--';

    return new Date(date).getDate().toString().padStart(2, '0');
  }

  getPostMonth(item: BlogModel): string {
    const date = item.publishedAt || item.created;
    if (!date) return '';

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short'
    });
  }

  formatDate(item: BlogModel): string {
    const date = item.publishedAt || item.created;
    if (!date) return 'Sin fecha';

    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  buildCategories(posts: BlogModel[]): { name: string; count: number }[] {
    const map = new Map<string, number>();

    posts.forEach(post => {
      const category = post.category?.trim();
      if (!category) return;

      map.set(category, (map.get(category) || 0) + 1);
    });

    return Array.from(map.entries()).map(([name, count]) => ({
      name,
      count
    }));
  }
  get filteredPosts(): BlogModel[] {
  const term = this.searchTerm.trim().toLowerCase();

  if (!term) return this.blogList;

  return this.blogList.filter(post =>
    [
      post.title,
      post.excerpt,
      post.category,
      post.content
    ]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(term))
  );
}

onSearchSubmit(event: Event): void {
  event.preventDefault();
}

clearSearch(): void {
  this.searchTerm = '';
}
}