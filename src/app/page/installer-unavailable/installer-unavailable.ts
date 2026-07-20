import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import PocketBase, { RecordModel } from 'pocketbase';

@Component({
  selector: 'app-installer-unavailable',
    standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],  
  templateUrl: './installer-unavailable.html',
  styleUrl: './installer-unavailable.scss',
})
export class InstallerUnavailable implements OnInit {
  private pb =
    new PocketBase('https://db.buckapi.site:8055');

  showForm = false;
  submitted = false;
  isSubmitting = false;

  submitError = '';

  fullName = '';
  email = '';
  phone = '';

  zipCode = '';
  city = '';
  state = '';
  stateCode = '';

  projectType: 'residential' | 'commercial' =
    'residential';

  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  this.route.queryParamMap.subscribe(params => {
    this.zipCode =
      params.get('zipCode') || '';

    this.city =
      params.get('city') || '';

    this.state =
      params.get('state') || '';

    this.stateCode =
      params.get('stateCode') || '';

    const projectType =
      params.get('projectType');

    if (
      projectType === 'residential' ||
      projectType === 'commercial'
    ) {
      this.projectType = projectType;
    }

    this.cdr.detectChanges();
  });
}

  openForm(): void {
    this.showForm = true;
    this.submitError = '';
  }

  async submitWaitlist(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }

    this.submitError = '';

    if (!this.fullName.trim()) {
      this.submitError =
        'Please enter your full name.';
      return;
    }

    if (!this.email.trim()) {
      this.submitError =
        'Please enter your email.';
      return;
    }

    if (!this.phone.trim()) {
      this.submitError =
        'Please enter your phone number.';
      return;
    }

    if (!this.zipCode.trim()) {
      this.submitError =
        'Please enter your ZIP Code.';
      return;
    }

    try {
      this.isSubmitting = true;

      const waitlistRecord =
        await this.pb
          .collection('installer_waitlist')
          .create({
            full_name: this.fullName.trim(),
            email: this.email.trim(),
            phone: this.phone.trim(),
            zip_code: this.zipCode.trim(),
            city: this.city.trim(),
            state: this.state.trim(),
            state_code: this.stateCode.trim(),
            project_type: this.projectType,
            status: 'new',
            source: 'no_installer_page'
          });

      try {
        await this.pb
          .collection('admin_notifications')
          .create({
            type: 'installer_waitlist',
            title: 'New installer waitlist request',
            message:
              `${this.fullName.trim()} joined the installer waitlist for ` +
              `${this.city || 'ZIP'} ${this.zipCode}.`,
            read: false,
            waitlist: waitlistRecord.id
          });
      } catch (notificationError) {
        console.error(
          'Waitlist saved, but notification failed:',
          notificationError
        );
      }

      this.submitted = true;
      this.showForm = false;

    } catch (error) {
      console.error(
        'Error saving installer waitlist:',
        error
      );

      this.submitError =
        'Your information could not be saved. Please try again.';
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }
}
