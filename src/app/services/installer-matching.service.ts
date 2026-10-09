import { Injectable, inject } from '@angular/core';
import { RecordModel } from 'pocketbase';
import { PocketBaseService } from './pocketbase.service';

export interface InstallerMatchInput {
  requestId: string;
  zipCode: string;
  projectType: 'residential' | 'commercial';
}

@Injectable({ providedIn: 'root' })
export class InstallerMatchingService {
  private readonly pb = inject(PocketBaseService).client;

  async findEligibleInstallers(input: InstallerMatchInput): Promise<RecordModel[]> {
    const area = await this.pb.collection('installer_service_areas').getList(1, 1, {
      filter: this.pb.filter('zip_code = {:zip} && project_type = {:type} && is_available = true', {
        zip: input.zipCode,
        type: input.projectType
      })
    });
    if (!area.totalItems) return [];

    // Eligibility only. There is intentionally no score or invented ranking.
    return this.pb.collection('professional_profiles').getFullList({
      filter: this.pb.filter('is_profile_complete = true && is_verified = true && service_zips.code = {:zip}', { zip: input.zipCode }),
      sort: 'created',
      requestKey: null
    }).then(records => records.slice(0, 3));
  }

  async selectInstallers(requestId: string, installerIds: string[]): Promise<RecordModel> {
    const userId = this.pb.authStore.record?.id;
    if (!userId) throw new Error('Authentication is required.');
    const request = await this.pb.collection('requests').getOne(requestId);
    if (request['client_id'] !== userId) throw new Error('Request ownership could not be verified.');

    const normalized = [...new Set(installerIds)].slice(0, 3);
    const previous = Array.isArray(request['interested_professionals']) ? request['interested_professionals'] : [];
    if (request['status'] === 'sent_to_installer' && JSON.stringify(previous) === JSON.stringify(normalized)) return request;

    const updated = await this.pb.collection('requests').update(requestId, {
      interested_professionals: normalized,
      max_leads: normalized.length,
      status: 'sent_to_installer'
    });
    await this.pb.collection('request_status_history').create({
      request: requestId,
      previous_status: request['status'] || '',
      new_status: 'sent_to_installer',
      note: 'Homeowner selected eligible installers',
      changed_by: userId
    });
    return updated;
  }
}
