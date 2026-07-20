import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import PocketBase from 'pocketbase';

interface LeadStatusOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-lead-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './lead-details.html',
  styleUrl: './lead-details.scss',
})
export class LeadDetails implements OnInit {
  private pb = new PocketBase('https://db.buckapi.site:8055');

  requestId = '';
  lead: any = null;
  statusHistory: any[] = [];

  isLoading = true;
  loadError = '';

  selectedStatus = '';
  statusNote = '';
  isUpdatingStatus = false;
  statusError = '';
  statusSuccess = '';

  readonly statusOptions: LeadStatusOption[] = [
    { value: 'new', label: 'New' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'sent_to_installer', label: 'Sent to Installer' },
    { value: 'installer_responded', label: 'Installer Responded' },
    { value: 'customer_contacted', label: 'Customer Contacted' },
    { value: 'closed', label: 'Closed' },
    {
      value: 'no_installer_available',
      label: 'No Installer Available'
    },
  ];

  constructor(private route: ActivatedRoute,   private cdr: ChangeDetectorRef) {}

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

    const [leadRecord, historyRecords] = await Promise.all([
      this.pb
        .collection('requests')
        .getOne(this.requestId, {
          expand: 'photos'
        }),

      this.pb
        .collection('request_status_history')
        .getFullList({
          filter: `request = "${this.requestId}"`,
          sort: '-created',
          expand: 'changed_by'
        })
    ]);

    this.lead = leadRecord;
    this.statusHistory = historyRecords;
    this.selectedStatus = this.lead.status || 'new';

  } catch (error) {
    console.error('Error loading lead:', error);
    this.loadError = 'The lead could not be loaded.';
  } finally {
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}

  async updateLeadStatus(): Promise<void> {
    if (!this.lead || this.isUpdatingStatus) return;

    this.statusError = '';
    this.statusSuccess = '';

    const previousStatus = this.lead.status || 'new';
    const newStatus = this.selectedStatus;

    if (!newStatus) {
      this.statusError = 'Please select a valid status.';
      return;
    }

    if (previousStatus === newStatus) {
      this.statusError =
        'Please select a different status before saving.';
      return;
    }

    try {
      this.isUpdatingStatus = true;

      await this.pb.collection('requests').update(
        this.lead.id,
        {
          status: newStatus
        }
      );

      await this.pb
        .collection('request_status_history')
        .create({
          request: this.lead.id,
          previous_status: previousStatus,
          new_status: newStatus,
          note:
            this.statusNote.trim() ||
            `Lead status changed from ${this.getStatusLabel(previousStatus)} to ${this.getStatusLabel(newStatus)}`
        });

      this.lead.status = newStatus;
      this.statusNote = '';
      this.statusSuccess = 'Lead status updated successfully.';

      await this.loadStatusHistory();

    } catch (error) {
      console.error('Error updating lead status:', error);

      this.statusError =
        'The lead status could not be updated. Please try again.';
    } finally {
      this.isUpdatingStatus = false;
        this.cdr.detectChanges();
    }
  }

  async loadStatusHistory(): Promise<void> {
  try {
    this.statusHistory = await this.pb
      .collection('request_status_history')
      .getFullList({
        filter: `request = "${this.requestId}"`,
        sort: '-created',
        expand: 'changed_by'
      });

    this.cdr.detectChanges();

  } catch (error) {
    console.error('Error loading status history:', error);
  }
}

  getStatusLabel(status: string): string {
    return this.statusOptions.find(
      option => option.value === status
    )?.label || this.formatValue(status);
  }

  getStatusClass(status: string): string {
    return `status-${status || 'unknown'}`;
  }

  getProjectTypeLabel(): string {
    return this.formatValue(
      this.lead?.project_type || ''
    );
  }

  getLocation(): string {
    if (!this.lead) return 'Not provided';

    const cityState = [
      this.lead.city,
      this.lead.state_code
    ]
      .filter(Boolean)
      .join(', ');

    if (cityState && this.lead.zip_code) {
      return `${cityState} ${this.lead.zip_code}`;
    }

    return cityState ||
      this.lead.zip_code ||
      this.lead.formatted_address ||
      'Not provided';
  }

  getProjectCategories(): string[] {
    const value =
      this.lead?.project_category_label ||
      this.lead?.space_type ||
      '';

    return value
      .split(',')
      .map((item: string) => item.trim())
      .filter(Boolean);
  }

  getLeadFiles(): any[] {
    const expandedPhotos =
      this.lead?.expand?.photos;

    if (Array.isArray(expandedPhotos)) {
      return expandedPhotos;
    }

    return [];
  }

  getFileUrl(fileRecord: any): string {
    if (!fileRecord) return '';

    const filename =
      fileRecord.file ||
      fileRecord.image;

    if (!filename) return '';

    return this.pb.files.getURL(
      fileRecord,
      filename
    );
  }

  isImageFile(fileRecord: any): boolean {
    const filename =
      fileRecord?.file ||
      fileRecord?.image ||
      '';

    return /\.(jpg|jpeg|png|webp|gif)$/i.test(filename);
  }

  formatDate(date: string): string {
    if (!date) return 'Not available';

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(date));
  }

  formatDateOnly(date: string): string {
    if (!date) return 'Not available';

    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  formatValue(value: string): string {
    if (!value) return 'Not provided';

    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, character =>
        character.toUpperCase()
      );
  }
}