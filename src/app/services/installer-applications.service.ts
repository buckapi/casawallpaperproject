import { Injectable } from '@angular/core';
import PocketBase, {
  ClientResponseError,
  RecordModel,
} from 'pocketbase';

export const POCKETBASE_URL =
  'https://db.buckapi.site:8055';

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

  projectType:
    | 'Residential'
    | 'Commercial'
    | 'Both';

  wallpaperTypesInstalled: string[];

  insurance:
    | 'Yes'
    | 'No'
    | 'In Progress';

  website?: string;
  instagram: string;
  notes: string;
  portfolioPhotos: File[];
}

export interface InstallerApplicationRecord
  extends RecordModel {
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  service_area: string;
  years_of_experience: number;

  project_type:
    | 'Residential'
    | 'Commercial'
    | 'Both';

  wallpaper_types_installed: string[];

  insurance:
    | 'Yes'
    | 'No'
    | 'In Progress';

  portfolio_photos: string[];
  website?: string;
  instagram: string;
  notes: string;

  status:
    | 'Pending'
    | 'Reviewing'
    | 'Approved'
    | 'Rejected';
}

@Injectable({
  providedIn: 'root',
})
export class InstallerApplicationsService {
  private readonly pocketBase =
    new PocketBase(POCKETBASE_URL);

  async submitApplication(
    payload: InstallerApplicationPayload
  ): Promise<InstallerApplicationRecord> {
    const formData = new FormData();

    formData.append(
      'full_name',
      payload.fullName.trim()
    );

    formData.append(
      'company_name',
      payload.companyName.trim()
    );

    formData.append(
      'email',
      payload.email.trim().toLowerCase()
    );

    formData.append(
      'phone',
      payload.phone.trim()
    );

    formData.append(
      'city',
      payload.city.trim()
    );

    formData.append(
      'state',
      payload.state.trim()
    );

    formData.append(
      'service_area',
      payload.serviceArea.trim()
    );

    formData.append(
      'years_of_experience',
      String(payload.yearsOfExperience)
    );

    formData.append(
      'project_type',
      payload.projectType
    );

    /*
     * IMPORTANTE:
     * repetir el campo por cada valor.
     * No usar JSON.stringify().
     */
    for (
      const wallpaperType of
      payload.wallpaperTypesInstalled
    ) {
      formData.append(
        'wallpaper_types_installed',
        wallpaperType
      );
    }

    formData.append(
      'insurance',
      payload.insurance
    );

    formData.append(
      'status',
      'Pending'
    );

    const website =
      payload.website?.trim() ?? '';

    if (website) {
      formData.append(
        'website',
        website
      );
    }

    const instagram =
      payload.instagram.trim();

    if (instagram) {
      formData.append(
        'instagram',
        instagram
      );
    }

    const notes =
      payload.notes.trim();

    if (notes) {
      formData.append(
        'notes',
        notes
      );
    }

    for (
      const file of
      payload.portfolioPhotos
    ) {
      formData.append(
        'portfolio_photos',
        file
      );
    }

    console.log(
      'Wallpaper types sent:',
      formData.getAll(
        'wallpaper_types_installed'
      )
    );

    try {
      return await this.pocketBase
        .collection(
          INSTALLER_APPLICATIONS_COLLECTION
        )
        .create<InstallerApplicationRecord>(
          formData
        );
    } catch (error: unknown) {
      if (
        error instanceof
        ClientResponseError
      ) {
        console.error(
          'PocketBase error:',
          {
            status: error.status,
            response: error.response,
            data:
              error.response?.['data'],
          }
        );
      }

      throw this.normalizePocketBaseError(
        error
      );
    }
  }

  private normalizePocketBaseError(
    error: unknown
  ): Error {
    if (
      !(
        error instanceof
        ClientResponseError
      )
    ) {
      return new Error(
        'The installer application could not be submitted.'
      );
    }

    if (error.status === 0) {
      return new Error(
        'Could not connect to the application server.'
      );
    }

    const errors =
      error.response?.['data'] ?? {};

    const validationMessages =
      Object.entries(errors)
        .map(
          ([field, fieldError]: [
            string,
            any,
          ]) => {
            const message =
              fieldError?.message;

            return message
              ? `${field}: ${message}`
              : null;
          }
        )
        .filter(
          (
            message
          ): message is string =>
            Boolean(message)
        );

    if (
      validationMessages.length > 0
    ) {
      return new Error(
        validationMessages.join(' ')
      );
    }

    return new Error(
      error.response?.['message'] ||
        'The installer application could not be submitted.'
    );
  }
}