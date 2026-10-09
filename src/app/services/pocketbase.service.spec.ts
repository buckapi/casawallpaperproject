import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { PocketBaseService } from './pocketbase.service';

describe('PocketBaseService', () => {
  it('provides one client configured for canonical wall-pb', () => {
    const first = TestBed.inject(PocketBaseService);
    const second = TestBed.inject(PocketBaseService);

    expect(first).toBe(second);
    expect(first.client.baseURL).toBe(environment.pocketBaseUrl);
    expect(environment.pocketBaseUrl).toBe('http://127.0.0.1:8055');
  });
});
