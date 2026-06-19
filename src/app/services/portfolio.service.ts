import { Injectable } from '@angular/core';
import { AuthPocketbaseService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PortfolioService {
  constructor(private authService: AuthPocketbaseService) {}

  // 1️⃣ Subir archivos a colección media (o la que tengas)
  async uploadFiles(files: File[]): Promise<string[]> {
    const uploadedIds: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      // ⚠️ Cambia 'media' por tu colección de archivos
      const record = await this.authService.pb.collection('images').create(formData);

      uploadedIds.push(record.id);
    }

    return uploadedIds;
  }

  // 2️⃣ Crear el portfolio

  async createPortfolio(
  name: string,
  tag: string,
  type: 'img' | 'video',
  files: File[],
  instagramUrl?: string
) 

{
  const formData = new FormData();

  formData.append('name', name);
  formData.append('tag', tag);
  formData.append('type', type);
formData.append(
  'sourceType',
  instagramUrl ? 'instagram' : 'upload'
);

formData.append(
  'instagramUrl',
  instagramUrl || ''
);
  files.forEach(file => {
    formData.append('images', file);
  });

  return await this.authService.pb.collection('potfolioCasa').create(formData);
}

  async getPortfolios() {
    return await this.authService.pb.collection('potfolioCasa').getFullList({
      sort: '-created',
    });
  }

  fileUrl(record: any, fileName: string): string | null {
    return this.authService.pb.files.getUrl(record, fileName);
  }
}