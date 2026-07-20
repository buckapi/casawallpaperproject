import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import PocketBase, { RecordModel } from 'pocketbase';

interface Lead extends RecordModel {
  status: string;
  project_type: 'residential' | 'commercial' | string;
  client_name: string;
  client_email: string;
  client_phone: string;
  city: string;
  state_code: string;
  zip_code: string;
  created: string;
}

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './leads.html',
  styleUrl: './leads.scss',
})
export class Leads implements OnInit {
  private pb = new PocketBase('https://db.buckapi.site:8055');

  leads: Lead[] = [];
  filteredLeads: Lead[] = [];

  isLoading = true;
  loadError = '';

  searchQuery = '';
  selectedStatus = 'all';
  selectedProjectType = 'all';

  currentPage = 1;
  perPage = 20;
  totalItems = 0;
  totalPages = 1;

  readonly statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'new', label: 'New' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'sent_to_installer', label: 'Sent to Installer' },
    { value: 'installer_responded', label: 'Installer Responded' },
    { value: 'customer_contacted', label: 'Customer Contacted' },
    { value: 'closed', label: 'Closed' },
    { value: 'no_installer_available', label: 'No Installer Available' },
  ];

  readonly projectTypeOptions = [
    { value: 'all', label: 'All project types' },
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
  ];
  constructor(
  private cdr: ChangeDetectorRef
) {}
  async ngOnInit(): Promise<void> {
    await this.loadLeads();
  }

  async loadLeads(page = 1): Promise<void> {
  try {
    this.isLoading = true;
    this.loadError = '';
    this.currentPage = page;

    const result = await this.pb
      .collection('requests')
      .getList<Lead>(this.currentPage, this.perPage, {
        sort: '-created',
      });

    this.leads = result.items;
    this.totalItems = result.totalItems;
    this.totalPages = result.totalPages;

    this.applyFilters();

  } catch (error) {
    console.error('Error loading installer leads:', error);

    this.loadError =
      'The installer leads could not be loaded. Please try again.';
  } finally {
    this.isLoading = false;
    this.cdr.detectChanges();
  }
}

  applyFilters(): void {
    const query = this.searchQuery.trim().toLowerCase();

    this.filteredLeads = this.leads.filter((lead) => {
      const matchesSearch =
        !query ||
        lead.id.toLowerCase().includes(query) ||
        (lead.client_name || '').toLowerCase().includes(query) ||
        (lead.client_email || '').toLowerCase().includes(query) ||
        (lead.client_phone || '').toLowerCase().includes(query) ||
        (lead.city || '').toLowerCase().includes(query) ||
        (lead.state_code || '').toLowerCase().includes(query) ||
        (lead.zip_code || '').toLowerCase().includes(query);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        lead.status === this.selectedStatus;

      const matchesProjectType =
        this.selectedProjectType === 'all' ||
        lead.project_type === this.selectedProjectType;

      return matchesSearch && matchesStatus && matchesProjectType;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = 'all';
    this.selectedProjectType = 'all';

    this.applyFilters();
  }

  async previousPage(): Promise<void> {
    if (this.currentPage <= 1) return;

    await this.loadLeads(this.currentPage - 1);
  }

  async nextPage(): Promise<void> {
    if (this.currentPage >= this.totalPages) return;

    await this.loadLeads(this.currentPage + 1);
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(
      item => item.value === status
    );

    return option?.label || this.formatValue(status);
  }

  getStatusClass(status: string): string {
    return `status-${status || 'unknown'}`;
  }

  getProjectTypeLabel(projectType: string): string {
    return this.formatValue(projectType);
  }

  getLocation(lead: Lead): string {
    const cityState = [
      lead.city,
      lead.state_code
    ]
      .filter(Boolean)
      .join(', ');

    if (cityState && lead.zip_code) {
      return `${cityState} ${lead.zip_code}`;
    }

    return cityState || lead.zip_code || 'Not provided';
  }

  formatDate(date: string): string {
    if (!date) return 'Not available';

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(date));
  }

  private formatValue(value: string): string {
    if (!value) return 'Not provided';

    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, character => character.toUpperCase());
  }
  getCountByStatus(status: string): number {
  return this.leads.filter(
    lead => lead.status === status
  ).length;
}

getCountByProjectType(projectType: string): number {
  return this.leads.filter(
    lead => lead.project_type === projectType
  ).length;
}

}