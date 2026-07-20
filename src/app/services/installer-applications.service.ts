import { Injectable } from '@angular/core';
import PocketBase, {
  ClientResponseError,
  RecordModel,
} from 'pocketbase';

export const POCKETBASE_URL = 'https://db.buckapi.site:8091';
export const INSTALLER_APPLICATIONS_COLLECTION =
  'installer_applications';

export interface InstallerApplicationPayload {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  serviceArea: string;
  yearsOfExperience: number;
  projectType: 'residential' | 'commercial' | 'both';
  wallpaperTypesInstalled: string[];
  insurance: 'yes' | 'no' | 'in-progress';
  website: string;
  instagram: string;
  notes: string;
  portfolioPhotos: File[];
}

export interface InstallerApplicationRecord extends RecordModel {
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  service_area: string;
  years_of_experience: number;
  project_type: 'residential' | 'commercial' | 'both';
  wallpaper_types_installed: string[];
  insurance: 'yes' | 'no' | 'in-progress';
  portfolio_photos: string[];
  website: string;
  instagram: string;
  notes: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
}

@Injectable({
  providedIn: 'root',
})
export class InstallerApplicationsService {
  private readonly pocketBase = new PocketBase(POCKETBASE_URL);

  async submitApplication(
    payload: InstallerApplicationPayload
  ): Promise<InstallerApplicationRecord> {
    const data = {
      full_name: payload.fullName.trim(),
      company_name: payload.companyName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      city: payload.city.trim(),
      state: payload.state.trim(),
      service_area: payload.serviceArea.trim(),
      years_of_experience: payload.yearsOfExperience,
      project_type: payload.projectType,
      wallpaper_types_installed:
        payload.wallpaperTypesInstalled,
      insurance: payload.insurance,
      portfolio_photos: payload.portfolioPhotos,
      website: payload.website.trim(),
      instagram: payload.instagram.trim(),
      notes: payload.notes.trim(),
      status: 'pending',
    };

    try {
      return await this.pocketBase
        .collection(INSTALLER_APPLICATIONS_COLLECTION)
        .create<InstallerApplicationRecord>(data);
    } catch (error: unknown) {
      throw this.normalizePocketBaseError(error);
    }
  }

  private normalizePocketBaseError(error: unknown): Error {
    if (!(error instanceof ClientResponseError)) {
      return new Error(
        'The installer application could not be submitted.'
      );
    }

    if (error.status === 0) {
      return new Error(
        'Could not connect to the application server. Check the connection and try again.'
      );
    }

    const validationMessages = Object.values(
      error.response?.['data'] ?? {}
    )
      .map((fieldError: any) => fieldError?.message)
      .filter(
        (message): message is string =>
          typeof message === 'string' && message.length > 0
      );

    if (validationMessages.length > 0) {
      return new Error(validationMessages.join(' '));
    }

    return new Error(
      error.response?.['message'] ||
        'The installer application could not be submitted.'
    );
  }
}