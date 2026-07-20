import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InstallerApplicationsService, InstallerApplicationPayload, } from '../../services/installer-applications.service';

/* import {
  InstallerApplicationPayload,
  InstallerApplicationsService,
} from 'services/installer-applications.service'; */

@Component({
  selector: 'app-join-installer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './join-installer.html',
  styleUrl: './join-installer.scss',
})
export class JoinInstaller {
  readonly maxPortfolioFiles = 10;
  readonly maxPortfolioFileSize =
    10 * 1024 * 1024;

  applicationForm: FormGroup;

  isSubmitting = false;
  submittedSuccessfully = false;
  submitError = '';
  selectedPortfolioFiles: File[] = [];

  readonly installerTypes = [
  {
    value: 'Residential',
    label: 'Residential',
  },
  {
    value: 'Commercial',
    label: 'Commercial',
  },
  {
    value: 'Both',
    label: 'Both',
  },
] as const;

  readonly insuranceOptions = [
  {
    value: 'Yes',
    label: 'Yes',
  },
  {
    value: 'No',
    label: 'No',
  },
  {
    value: 'In Progress',
    label: 'In Progress',
  },
] as const;
  readonly wallpaperTypes = [
    'Traditional Paste Wallpaper',
    'Peel & Stick Wallpaper',
    'Commercial Vinyl',
    'Type II Wallcovering',
    'Murals',
    'Grasscloth',
    'Textile Wallcovering',
    'Natural Materials',
    'Custom Wallcovering',
  ];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly installerApplications:
      InstallerApplicationsService
  ) {
    this.applicationForm =
      this.formBuilder.group({
        fullName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(150),
          ],
        ],

        companyName: [
          '',
          Validators.maxLength(150),
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email,
            Validators.maxLength(254),
          ],
        ],

        phone: [
          '',
          [
            Validators.required,
            Validators.minLength(7),
            Validators.maxLength(50),
          ],
        ],

        city: [
          '',
          [
            Validators.required,
            Validators.maxLength(100),
          ],
        ],

        state: [
          '',
          [
            Validators.required,
            Validators.maxLength(100),
          ],
        ],

        serviceArea: [
          '',
          [
            Validators.required,
            Validators.maxLength(1000),
          ],
        ],

        yearsOfExperience: [
          null,
          [
            Validators.required,
            Validators.min(0),
            Validators.max(70),
          ],
        ],

        projectType: [
          '',
          Validators.required,
        ],

        wallpaperTypesInstalled: [
          [],
          Validators.required,
        ],

        insurance: [
          '',
          Validators.required,
        ],

        website: [
          '',
          Validators.maxLength(500),
        ],

        instagram: [
          '',
          Validators.maxLength(200),
        ],

        notes: [
          '',
          Validators.maxLength(5000),
        ],

        termsAccepted: [
          false,
          Validators.requiredTrue,
        ],
      });
  }

  get formControls() {
    return this.applicationForm.controls;
  }

  toggleWallpaperType(type: string): void {
    const control =
      this.applicationForm.get(
        'wallpaperTypesInstalled'
      );

    const currentValues: string[] =
      control?.value ?? [];

    const updatedValues =
      currentValues.includes(type)
        ? currentValues.filter(
            item => item !== type
          )
        : [...currentValues, type];

    control?.setValue(updatedValues);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }

  isWallpaperTypeSelected(
    type: string
  ): boolean {
    const selectedTypes: string[] =
      this.applicationForm.get(
        'wallpaperTypesInstalled'
      )?.value ?? [];

    return selectedTypes.includes(type);
  }

  onPortfolioSelected(
    event: Event
  ): void {
    this.submitError = '';

    const input =
      event.target as HTMLInputElement;

    const incomingFiles =
      Array.from(input.files ?? []);

    const acceptedTypes = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
    ]);

    const invalidType = incomingFiles.some(
      file => !acceptedTypes.has(file.type)
    );

    if (invalidType) {
      this.submitError =
        'Portfolio photos must be JPG, PNG, or WEBP images.';
      input.value = '';
      return;
    }

    const oversizedFile = incomingFiles.some(
      file =>
        file.size >
        this.maxPortfolioFileSize
    );

    if (oversizedFile) {
      this.submitError =
        'Each portfolio photo must be 10 MB or smaller.';
      input.value = '';
      return;
    }

    const mergedFiles = [
      ...this.selectedPortfolioFiles,
      ...incomingFiles,
    ];

    const uniqueFiles = mergedFiles.filter(
      (file, index, files) =>
        files.findIndex(
          candidate =>
            candidate.name === file.name &&
            candidate.size === file.size &&
            candidate.lastModified ===
              file.lastModified
        ) === index
    );

    if (
      uniqueFiles.length >
      this.maxPortfolioFiles
    ) {
      this.submitError =
        'You can upload a maximum of 10 portfolio photos.';
      input.value = '';
      return;
    }

    this.selectedPortfolioFiles =
      uniqueFiles;

    input.value = '';
  }

  removePortfolioFile(
    index: number
  ): void {
    this.selectedPortfolioFiles =
      this.selectedPortfolioFiles.filter(
        (_, fileIndex) =>
          fileIndex !== index
      );
  }

 /*  async submitApplication(): Promise<void> {
    this.submitError = '';
    this.submittedSuccessfully = false;

    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();

      this.submitError =
        'Please complete all required fields before submitting.';

      this.scrollToFirstError();
      return;
    }

    const rawValue =
      this.applicationForm.getRawValue();

    const payload: InstallerApplicationPayload = {
      fullName: rawValue.fullName,
      companyName: rawValue.companyName || '',
      email: rawValue.email,
      phone: rawValue.phone,
      city: rawValue.city,
      state: rawValue.state,
      serviceArea: rawValue.serviceArea,
      yearsOfExperience:
        Number(rawValue.yearsOfExperience),
      projectType: rawValue.projectType,
      wallpaperTypesInstalled:
        rawValue.wallpaperTypesInstalled,
      insurance: rawValue.insurance,
      website: rawValue.website || '',
      instagram: rawValue.instagram || '',
      notes: rawValue.notes || '',
      portfolioPhotos:
        this.selectedPortfolioFiles,
    };

    this.isSubmitting = true;

    try {
      await this.installerApplications
        .submitApplication(payload);

      this.submittedSuccessfully = true;
      this.resetApplicationForm();

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (error: unknown) {
      this.submitError =
        error instanceof Error
          ? error.message
          : 'We could not submit your application. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  } */
  async submitApplication(): Promise<void> {
  this.submitError = '';
  this.submittedSuccessfully = false;

  if (this.applicationForm.invalid) {
    this.applicationForm.markAllAsTouched();

    this.submitError =
      'Please complete all required fields before submitting.';

    this.scrollToFirstError();
    return;
  }

  const rawValue =
    this.applicationForm.getRawValue();

  const selectedWallpaperTypes =
    Array.isArray(
      rawValue.wallpaperTypesInstalled
    )
      ? rawValue.wallpaperTypesInstalled
      : [];

  if (selectedWallpaperTypes.length === 0) {
    this.submitError =
      'Please select at least one wallpaper type.';

    this.applicationForm
      .get('wallpaperTypesInstalled')
      ?.markAsTouched();

    document
      .querySelector('.tag-selector')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

    return;
  }

  const payload: InstallerApplicationPayload = {
    fullName: rawValue.fullName,
    companyName:
      rawValue.companyName || '',
    email: rawValue.email,
    phone: rawValue.phone,
    city: rawValue.city,
    state: rawValue.state,
    serviceArea:
      rawValue.serviceArea,

    yearsOfExperience:
      Number(
        rawValue.yearsOfExperience
      ),

    projectType:
      rawValue.projectType,

    wallpaperTypesInstalled:
      selectedWallpaperTypes,

    insurance:
      rawValue.insurance,

    website:
  typeof rawValue.website === 'string'
    ? rawValue.website.trim()
    : '',

    instagram:
      rawValue.instagram || '',

    notes:
      rawValue.notes || '',

    portfolioPhotos:
      this.selectedPortfolioFiles,
  };

  this.isSubmitting = true;

  try {
    await this.installerApplications
      .submitApplication(payload);

    this.submittedSuccessfully = true;
    this.resetApplicationForm();

    setTimeout(() => {
      document
        .getElementById(
          'application-card'
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
    });
  } catch (error: unknown) {
    this.submitError =
      error instanceof Error
        ? error.message
        : 'We could not submit your application. Please try again.';
  } finally {
    this.isSubmitting = false;
  }
}
  private resetApplicationForm(): void {
    this.applicationForm.reset({
      fullName: '',
      companyName: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      serviceArea: '',
      yearsOfExperience: null,
      projectType: '',
      wallpaperTypesInstalled: [],
      insurance: '',
      website: '',
      instagram: '',
      notes: '',
      termsAccepted: false,
    });

    this.selectedPortfolioFiles = [];
  }

  private scrollToFirstError(): void {
    setTimeout(() => {
      const firstInvalidElement =
        document.querySelector(
          '.installer-form .ng-invalid'
        );

      firstInvalidElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }
  /* startNewApplication(): void {
  this.submittedSuccessfully = false;
  this.submitError = '';

  this.resetApplicationForm();

  setTimeout(() => {
    document
      .getElementById('installer-application')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  });
} */
startNewApplication(): void {
  this.submittedSuccessfully = false;
  this.submitError = '';

  this.resetApplicationForm();

  setTimeout(() => {
    const section = document.getElementById('installer-application');

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, 150);
}
scrollToApplication(): void {
  document
    .getElementById('installer-application')
    ?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
}
}