import { Injectable, inject } from '@angular/core';
import { PocketBaseService } from './pocketbase.service';

export type InstallerProjectType =
  'residential' | 'commercial';

@Injectable({
  providedIn: 'root'
})
export class InstallerAvailabilityService {
  private pb =
    inject(PocketBaseService).client;

  async hasAvailability(
    zipCode: string,
    projectType: InstallerProjectType
  ): Promise<boolean> {
    const normalizedZipCode = zipCode.trim();

    if (!normalizedZipCode) {
      return false;
    }

    const result = await this.pb
      .collection('installer_service_areas')
      .getList(1, 1, {
        filter: this.pb.filter(
          'zip_code = {:zipCode} && project_type = {:projectType} && is_available = true',
          {
            zipCode: normalizedZipCode,
            projectType
          }
        )
      });

    return result.totalItems > 0;
  }
}
