import { Injectable, inject } from '@angular/core';
import PocketBase, { RecordModel } from 'pocketbase';
import { PricingResult } from '../pricing/pricing.types';
import { PocketBaseService } from './pocketbase.service';

export interface HomeownerProjectDraft {
  location?: { city?: string; state?: string; stateCode?: string; countryCode?: string; formattedAddress?: string; zipCode?: string | null; lat?: number; lng?: number };
  timeline?: string;
  spaces?: string[];
  spaceDetails?: Record<string, unknown>;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class HomeownerProjectService {
  private readonly pb = inject(PocketBaseService).client;

  get isAuthenticated(): boolean {
    return this.pb.authStore.isValid && !!this.pb.authStore.record?.id;
  }

  async saveProject(draft: HomeownerProjectDraft, results: PricingResult[]): Promise<{ request: RecordModel; estimates: RecordModel[] }> {
    const clientId = this.pb.authStore.record?.id;
    if (!clientId) throw new Error('Authentication is required before saving a project.');

    const existingId = typeof draft['remoteRequestId'] === 'string' ? draft['remoteRequestId'] : undefined;
    const requestData = {
      client_id: clientId,
      customer_role: 'homeowner',
      project_use: 'residential',
      status: 'sent',
      source: 'walivio-find-my-installer',
      city: draft.location?.city ?? '',
      state: draft.location?.state ?? '',
      state_code: draft.location?.stateCode ?? '',
      country: draft.location?.countryCode ?? 'US',
      zip_code: draft.location?.zipCode ?? '',
      formatted_address: draft.location?.formattedAddress ?? '',
      lat: draft.location?.lat ?? 0,
      lng: draft.location?.lng ?? 0,
      target_timeframe: draft.timeline ?? '',
      space_type: (draft.spaces ?? []).join(','),
      project_name: this.projectName(draft),
      scope_details: { spaces: draft.spaces ?? [], spaceDetails: draft.spaceDetails ?? {} },
      submission_snapshot: draft
    };

    const request = existingId
      ? await this.pb.collection('requests').update(existingId, requestData)
      : await this.pb.collection('requests').create(requestData);

    const estimates: RecordModel[] = [];
    const existingEstimates = await this.pb.collection('request_estimates').getFullList({ filter: `request = "${request.id}"`, sort: '-estimate_revision' });
    for (const [index, result] of results.entries()) {
      const existing = existingEstimates.find(item => item['pricing_engine_version'] === result.pricing_engine_version && JSON.stringify(item['input_snapshot']) === JSON.stringify(result.original_input));
      if (existing) {
        estimates.push(existing);
        continue;
      }
      const revision = await this.nextRevision(request.id, index);
      estimates.push(await this.pb.collection('request_estimates').create({
        request: request.id,
        estimate_revision: revision,
        pricing_status: result.pricing_status,
        estimate_route: result.estimate_route,
        stage: result.stage,
        known_subtotal_cents: result.known_subtotal_cents,
        line_items: result.line_items,
        pending_items: result.pending_items,
        exclusions: result.exclusions,
        review_reasons: result.review_reasons,
        policy_blocks: result.policy_blocks,
        input_snapshot: result.original_input,
        pricing_engine_version: result.pricing_engine_version,
        pricebook_id: result.pricebook_id,
        pricebook_version: result.pricebook_version
      }));
    }
    const history = await this.pb.collection('request_status_history').getList(1, 1, { filter: `request = "${request.id}" && new_status = "sent"` });
    if (!history.totalItems) await this.pb.collection('request_status_history').create({ request: request.id, new_status: 'sent', note: 'Homeowner project submitted', changed_by: clientId });
    return { request, estimates };
  }

  async uploadPhotos(requestId: string, photos: Array<{ file: File; name: string; id: string }>, space: string): Promise<void> {
    for (const photo of photos) {
      const form = new FormData();
      form.append('request_id', requestId);
      form.append('field', photo.file, photo.name);
      form.append('sort_order', String(photos.indexOf(photo)));
      await this.pb.collection('request_photos').create(form);
    }
  }

  async listMyProjects(): Promise<RecordModel[]> {
    const id = this.pb.authStore.record?.id;
    if (!id) return [];
    return this.pb.collection('requests').getFullList({ filter: `client_id = "${id}"`, sort: '-updated' });
  }

  async getEstimates(requestId: string): Promise<RecordModel[]> {
    return this.pb.collection('request_estimates').getFullList({ filter: `request = "${requestId}"`, sort: 'estimate_revision' });
  }

  async transitionRequest(requestId: string, status: string, note: string, patch: Record<string, unknown> = {}): Promise<RecordModel> {
    const current = await this.pb.collection('requests').getOne(requestId);
    const next = { ...patch, status };
    const updated = current['status'] === status && Object.keys(patch).every(key => current[key] === patch[key])
      ? current
      : await this.pb.collection('requests').update(requestId, next);
    const history = await this.pb.collection('request_status_history').getList(1, 1, {
      filter: this.pb.filter('request = {:request} && new_status = {:status} && note = {:note}', {
        request: requestId,
        status,
        note
      })
    });
    if (!history.totalItems) {
      await this.pb.collection('request_status_history').create({
        request: requestId,
        previous_status: current['status'] ?? '',
        new_status: status,
        note,
        changed_by: this.pb.authStore.record?.id ?? ''
      });
    }
    return updated;
  }

  async subscribeToProject(requestId: string, onUpdate: (record: RecordModel) => void): Promise<() => Promise<void>> {
    return this.pb.collection('requests').subscribe(requestId, event => onUpdate(event.record));
  }

  private async nextRevision(requestId: string, spaceIndex: number): Promise<number> {
    const list = await this.pb.collection('request_estimates').getFullList({ filter: `request = "${requestId}"`, sort: '-estimate_revision' });
    return (list[0]?.['estimate_revision'] ?? 0) + 1 + spaceIndex;
  }

  private projectName(draft: HomeownerProjectDraft): string {
    const spaces = draft.spaces ?? [];
    return spaces.length ? `${spaces.join(' + ')} wallpaper installation` : 'Wallpaper installation project';
  }
}
