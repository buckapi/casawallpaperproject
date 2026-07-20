import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import PocketBase from 'pocketbase';
@Component({
  selector: 'app-lead-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lead-details.html',
  styleUrl: './lead-details.scss',
})
export class LeadDetails implements OnInit {
  private pb = new PocketBase('https://db.buckapi.site:8055');

  requestId = '';
  lead: any = null;
  isLoading = true;
  loadError = '';

  constructor(private route: ActivatedRoute) {}

  async ngOnInit(): Promise<void> {
    this.requestId =
      this.route.snapshot.paramMap.get('requestId') || '';

    if (!this.requestId) {
      this.loadError = 'Lead ID was not provided.';
      this.isLoading = false;
      return;
    }

    await this.loadLead();
  }

  async loadLead(): Promise<void> {
    try {
      this.isLoading = true;
      this.loadError = '';

      this.lead = await this.pb
        .collection('requests')
        .getOne(this.requestId, {
          expand: 'photos'
        });

    } catch (error) {
      console.error('Error loading lead:', error);
      this.loadError = 'The lead could not be loaded.';
    } finally {
      this.isLoading = false;
    }
  }

}
