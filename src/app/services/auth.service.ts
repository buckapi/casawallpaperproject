import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import PocketBase, { RecordModel } from 'pocketbase';
import { PocketBaseService } from './pocketbase.service';
export type UserType = 'client' | 'professional' | 'admin';
export interface RegisterMinimalPayload {
  username: string;
  email: string;
  phone: string;
  type: UserType;
  dni?: string;
  avatar?: string | Blob;
  password?: string; // 👈 nuevo campo opcional
}

@Injectable({ providedIn: 'root' })
export class AuthPocketbaseService {
  public pb: PocketBase;
  // Solo un constructor y router inyectado correctamente
  public randomPassword(len = 18): string {
    const bytes = new Uint8Array(len);
    crypto.getRandomValues(bytes);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_-+=';
    return Array.from(bytes, b => chars[b % chars.length]).join('');
  }
  async login(email: string, password: string) {
    return this.pb.collection('users').authWithPassword(email, password);
}

  constructor(private router: Router, pocketBase: PocketBaseService) {
    this.pb = pocketBase.client;
  }

  logout() {
  this.pb.authStore.clear();

  localStorage.removeItem('token');
  localStorage.removeItem('companyId');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
}
logoutAdmin() {
  this.logout();
  this.router.navigate(['/dashboard/login']);
}

  get companyId() {
    return this.user?.['companyId'] ?? null;
  }

 /*  get role() {
    return localStorage.getItem('role');
  } */
get role(): string | null {
  return this.user?.['type'] ?? null;
}

  get isSuperAdmin() {
    return this.role === 'root';
  }

get user(): any | null {
  return this.pb.authStore.record;
}


 async getUsers() {
    try {
      const records = await this.pb.collection('users').getFullList({
        sort: '-created',
      });
      return records;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
  get isLoggedIn(): boolean {
    // Verifica que el token exista y sea válido
    const token = this.pb.authStore.token;
    const isValid = this.pb.authStore.isValid;
      if (!this.pb.authStore.isValid) {
    this.logout();
    return false;
  }
  return true;
  }
hasRole(roles: string[]): boolean {
  return !!this.user && roles.includes(this.user['type']);
}

  fileUrl(record: RecordModel | null | undefined, fileName?: string, thumb?: string): string | null {
    if (!record || !fileName) return null;
    return this.pb.files.getUrl(record, fileName, thumb ? { thumb } : undefined);
  }

  async registerMinimal(payload: RegisterMinimalPayload): Promise<RecordModel> {
    const password = payload.password ?? this.randomPassword();

    const data: Record<string, any> = {
      email: payload.email,
      emailVisibility: true,
      password,
      passwordConfirm: password,
      name: payload.username,
      phone: payload.phone,
      type: payload.type,
    };

    if (payload.avatar instanceof Blob) {
      data['avatar'] = payload.avatar;
    }

    const record = await this.pb.collection('users').create(data);
    return record;
  }

  async requestPasswordReset(email: string) {
    await this.pb.collection('users').requestPasswordReset(email);
  }


  getCurrentUserId(): string | null {
    return this.pb.authStore.model?.id ?? null;
  }
  async updateMyFields(patch: Partial<RecordModel>): Promise<RecordModel> {
    const id = this.getCurrentUserId();
    if (!id) throw new Error('No hay usuario autenticado.');
    const rec = await this.pb.collection('users').update(id, patch);
    this.pb.authStore.save(this.pb.authStore.token, rec as any);
    return rec;
  }
  async getUserById(id: string): Promise<any> {
    return await this.pb.collection('users').getOne(id);
  }

  async updateUser(id: string, data: any): Promise<any> {
    return await this.pb.collection('users').update(id, data);
  }
  async updateMyLocation(lat: number, long: number): Promise<RecordModel> {
    return this.updateMyFields({ lat, long });
  }
  
}
