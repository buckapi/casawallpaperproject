import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject } from 'rxjs';
import { BlogModel } from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class RealtimeBlogService {
  private pb = new PocketBase('https://db.buckapi.site:8055');
  private collectionName = 'blog';

  private blogSubject = new BehaviorSubject<BlogModel[]>([]);
  blog$ = this.blogSubject.asObservable();

  blogList: BlogModel[] = [];

  async loadBlog(): Promise<void> {
    const records = await this.pb.collection(this.collectionName).getFullList({
      sort: '-created'
    });

    this.blogList = records as unknown as BlogModel[];
    this.blogSubject.next(this.blogList);
  }

  async getBlogById(id: string): Promise<BlogModel> {
    const record = await this.pb.collection(this.collectionName).getOne(id);
    return record as unknown as BlogModel;
  }

  async createBlog(data: any): Promise<void> {
    await this.pb.collection(this.collectionName).create(data);
    await this.loadBlog();
  }

  async updateBlog(id: string, data: any): Promise<void> {
    await this.pb.collection(this.collectionName).update(id, data);
    await this.loadBlog();
  }

  async appendGalleryFiles(id: string, files: File[]): Promise<void> {
    if (!files.length) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append('gallery', file);
    }

    await this.pb.collection(this.collectionName).update(id, formData);
  }

  async removeGalleryFiles(id: string, fileNames: string[]): Promise<void> {
    if (!fileNames.length) return;

    await this.pb.collection(this.collectionName).update(id, {
      'gallery-': fileNames
    });
  }

  async clearCover(id: string): Promise<void> {
    await this.pb.collection(this.collectionName).update(id, {
      cover: null
    });
  }

  async deleteBlog(id: string): Promise<void> {
    await this.pb.collection(this.collectionName).delete(id);
    await this.loadBlog();
  }

  getFileUrl(record: any, fileName: string): string {
    return this.pb.files.getURL(record, fileName);
  }

  buildSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}