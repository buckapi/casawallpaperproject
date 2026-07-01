import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BlogModel } from '../../models/blog.model';
import { RealtimeBlogService } from '../../services/realtime-blog.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.scss',
})
export class BlogDetail implements OnInit {
  post: BlogModel | null = null;
  blogList: BlogModel[] = [];
  popularPosts: BlogModel[] = [];
  categories: { name: string; count: number }[] = [];

  loading = true;
  searchTerm = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public realtimeBlogService: RealtimeBlogService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadPost();
  }

  async loadPost(): Promise<void> {
    try {
      this.loading = true;

      const slug = this.route.snapshot.paramMap.get('slug');

      await this.realtimeBlogService.loadBlog();

      this.realtimeBlogService.blog$.subscribe(posts => {
        const published = posts
          .filter(item => item.status === 'publicado')
          .sort((a, b) => {
            const orderA = Number(a.orderIndex ?? 0);
            const orderB = Number(b.orderIndex ?? 0);

            if (orderA !== orderB) return orderA - orderB;

            return new Date(b.publishedAt || b.created || '').getTime()
              - new Date(a.publishedAt || a.created || '').getTime();
          });

        this.blogList = published;
        this.post = published.find(item => item.slug === slug) || null;

        this.popularPosts = published
          .filter(item => item.id !== this.post?.id)
          .slice(0, 3);

        this.categories = this.buildCategories(published);

        this.loading = false;
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error('Error cargando detalle del blog:', error);
      this.loading = false;
    }
  }

  getCoverUrl(item: BlogModel | null): string {
    if (!item?.cover) return 'assets/img/news/post-4.jpg';
    return this.realtimeBlogService.getFileUrl(item, item.cover);
  }

  getGalleryUrls(item: BlogModel | null): string[] {
    if (!item?.gallery?.length) return [];

    return item.gallery.map(fileName =>
      this.realtimeBlogService.getFileUrl(item, fileName)
    );
  }

  formatDate(item: BlogModel | null): string {
    const date = item?.publishedAt || item?.created;
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

  onSearchSubmit(event: Event): void {
    event.preventDefault();

    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return;

    const found = this.blogList.find(post =>
      [
        post.title,
        post.excerpt,
        post.category,
        post.content
      ]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(term))
    );

    if (found?.slug) {
      this.router.navigate(['/blog', found.slug]);
    }
  }

  goToPost(slug?: string): void {
    if (!slug) return;

    this.router.navigate(['/blog', slug]).then(() => {
      this.loadPost();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}