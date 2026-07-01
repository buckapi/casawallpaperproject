import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { QuillModule } from 'ngx-quill';
import { BlogModel } from '../../../models/blog.model';
import { RealtimeBlogService } from '../../../services/realtime-blog.service';
export interface BlogPost {
  id?: string;

  title: string;
  slug: string;

  excerpt: string;
  content: string;

  category?: string;

  cover?: string;
  gallery?: string[];

  featured?: boolean;

  status: 'borrador' | 'publicado' | 'archivado';

  publishedAt?: string;

  metaTitle?: string;
  metaDescription?: string;

  views?: number;

  orderIndex?: number;

  created?: string;
  updated?: string;
}
@Component({
  selector: 'app-blog-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, QuillModule],
  templateUrl: './blog.html',
  styleUrl: './blog.scss'
})
export class Blog implements OnInit {
  form!: FormGroup;

  blogList: BlogModel[] = [];
  loading = false;
  saving = false;
  editingId: string | null = null;
  showForm = false;

  selectedGalleryFiles: File[] = [];
  selectedCoverFile: File | null = null;

  existingGalleryFiles: string[] = [];
  removedGalleryFiles: string[] = [];

  existingCoverFile: string | null = null;
  removeExistingCover = false;

  editingRecord: BlogModel | null = null;

  statusOptions: Array<'borrador' | 'publicado'> = ['borrador', 'publicado'];

  quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ]
  };

  constructor(
    private fb: FormBuilder,
    public realtimeBlogService: RealtimeBlogService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.buildForm();
    await this.loadData();
    this.changeDetectorRef.detectChanges();
  }

  buildForm(): void {
    this.form = this.fb.group({
      title: ['', Validators.required],
      excerpt: ['', Validators.required],
      content: ['', Validators.required],
      category: [''],
      featured: [false],
      status: ['borrador', Validators.required],
      publishedAt: [''],
      orderIndex: [0]
    });
  }

  async loadData(): Promise<void> {
    try {
      this.loading = true;
      await this.realtimeBlogService.loadBlog();
      this.realtimeBlogService.blog$.subscribe(data => {
        this.blogList = data;
      });
    } catch (error) {
      console.error('Error cargando blog:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las publicaciones.'
      });
    } finally {
      this.loading = false;
    }
  }

  openCreateForm(): void {
    this.resetForm();
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  onGalleryChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const newFiles = Array.from(input.files);
    this.selectedGalleryFiles = [...this.selectedGalleryFiles, ...newFiles];
    input.value = '';
  }

  onCoverChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedCoverFile = input.files[0];
    this.removeExistingCover = false;
    input.value = '';
  }

  removeSelectedGalleryFile(index: number): void {
    this.selectedGalleryFiles.splice(index, 1);
    this.selectedGalleryFiles = [...this.selectedGalleryFiles];
  }

  removeExistingGalleryFile(fileName: string): void {
    this.removedGalleryFiles.push(fileName);
    this.existingGalleryFiles = this.existingGalleryFiles.filter(file => file !== fileName);
  }

  removeCoverSelection(): void {
    this.selectedCoverFile = null;
  }

  removeCurrentCover(): void {
    this.selectedCoverFile = null;
    this.existingCoverFile = null;
    this.removeExistingCover = true;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      await Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Completa los campos obligatorios.'
      });
      return;
    }

    try {
      this.saving = true;

      const value = this.form.value;

     const payload: any = {
  title: value.title,
  slug: this.realtimeBlogService.buildSlug(value.title),
  excerpt: value.excerpt,
  content: value.content,
  category: value.category || '',
  featured: !!value.featured,
  status: value.status,
  metaTitle: value.title,
  metaDescription: value.excerpt,
  views: 0
};



if (value.orderIndex !== null && value.orderIndex !== undefined && value.orderIndex !== '') {
  payload.orderIndex = Number(value.orderIndex);
}

if (value.publishedAt) {
  payload.publishedAt = new Date(value.publishedAt).toISOString();
}

      if (this.editingId) {
        if (this.removedGalleryFiles.length) {
          await this.realtimeBlogService.removeGalleryFiles(this.editingId, this.removedGalleryFiles);
        }

        if (this.removeExistingCover) {
          await this.realtimeBlogService.clearCover(this.editingId);
        }

        if (this.selectedCoverFile) {
          payload.cover = this.selectedCoverFile;
        }

        await this.realtimeBlogService.updateBlog(this.editingId, payload);

        if (this.selectedGalleryFiles.length) {
          await this.realtimeBlogService.appendGalleryFiles(this.editingId, this.selectedGalleryFiles);
        }

        await Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'La publicación fue actualizada correctamente.',
          timer: 1800,
          showConfirmButton: false
        });
      } else {
        if (this.selectedCoverFile) {
          payload.cover = this.selectedCoverFile;
        }

        if (this.selectedGalleryFiles.length) {
          payload.gallery = this.selectedGalleryFiles;
        }

        await this.realtimeBlogService.createBlog(payload);

        await Swal.fire({
          icon: 'success',
          title: 'Creado',
          text: 'La publicación fue creada correctamente.',
          timer: 1800,
          showConfirmButton: false
        });
      }

      await this.realtimeBlogService.loadBlog();
      this.closeForm();
    } catch (error: any) {
  console.error('Error completo:', error);
  console.error('PocketBase data:', error?.data);

  await Swal.fire({
    icon: 'error',
    title: 'Error',
    text: JSON.stringify(error?.data || error)
  });

    } finally {
      this.saving = false;
    }
  }

  editItem(item: BlogModel): void {
    this.editingId = item.id || null;
    this.editingRecord = item;
    this.showForm = true;

    this.form.patchValue({
      title: item.title || '',
      excerpt: item.excerpt || '',
      content: item.content || '',
      category: item.category || '',
      featured: !!item.featured,
      status: item.status || 'borrador',
      publishedAt: item.publishedAt || '',
      orderIndex: item.orderIndex ?? 0
    });

    this.selectedGalleryFiles = [];
    this.selectedCoverFile = null;

    this.existingGalleryFiles = [...(item.gallery || [])];
    this.removedGalleryFiles = [];

    this.existingCoverFile = item.cover || null;
    this.removeExistingCover = false;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async deleteItem(id?: string): Promise<void> {
    if (!id) return;

    const result = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar publicación?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626'
    });

    if (!result.isConfirmed) return;

    try {
      await this.realtimeBlogService.deleteBlog(id);

      if (this.editingId === id) {
        this.closeForm();
      }

      await Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        text: 'La publicación fue eliminada correctamente.',
        timer: 1800,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error eliminando publicación:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No fue posible eliminar la publicación.'
      });
    }
  }

  resetForm(): void {
    this.editingId = null;
    this.editingRecord = null;

    this.selectedGalleryFiles = [];
    this.selectedCoverFile = null;

    this.existingGalleryFiles = [];
    this.removedGalleryFiles = [];

    this.existingCoverFile = null;
    this.removeExistingCover = false;

    this.form.reset({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      featured: false,
      status: 'borrador',
      publishedAt: '',
      orderIndex: 0
    });
  }

  getCoverUrl(item: any): string | null {
    if (!item?.cover) return null;
    return this.realtimeBlogService.getFileUrl(item, item.cover);
  }

  getExistingCoverUrl(): string | null {
    if (!this.editingRecord || !this.existingCoverFile) return null;
    return this.realtimeBlogService.getFileUrl(this.editingRecord, this.existingCoverFile);
  }

  getExistingGalleryUrls(): { name: string; url: string }[] {
    if (!this.editingRecord || !this.existingGalleryFiles.length) return [];

    return this.existingGalleryFiles.map(fileName => ({
      name: fileName,
      url: this.realtimeBlogService.getFileUrl(this.editingRecord, fileName)
    }));
  }
}