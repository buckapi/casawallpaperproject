export interface BlogModel {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category?: string;
  author?: string;
  cover?: string;
  gallery?: string[];
  featured?: boolean;
  status: 'borrador' | 'publicado';
  publishedAt?: string;
  orderIndex?: number;
  created?: string;
  updated?: string;
}