import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
@Component({
  selector: 'app-commercial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './commercial.html',
  styleUrl: './commercial.scss',
})
export class Commercial implements OnInit {
  form!: FormGroup;
  activeCard: string = 'Trade & Design'; // Valor por defecto

  // Opciones para los desplegables en inglés
  projectTypes = ['Trade & Design', 'Large Commercial'];
  audiences = [
  {
    label: 'Designers',
    icon: 'ph ph-pencil-ruler',
  },
  {
    label: 'General Contractors',
    icon: 'ph ph-hard-hat',
  },
  {
    label: 'Property Managers',
    icon: 'ph ph-buildings',
  },
  {
    label: 'Business Owners',
    icon: 'ph ph-storefront',
  },
  {
    label: 'Architects',
    icon: 'ph ph-compass-tool',
  },
];
  timelineOptions = [
    '0 - 3 months', 
    '3 - 6 months', 
    '6 - 12 months', 
    'More than 12 months', 
    'Not sure yet'
  ];
  
  wallConditions = [
    'New construction (Drywall/Plaster)', 
    'Existing (Good condition)', 
    'Existing (Needs repair)', 
    'Exposed concrete / Brick'
  ];
  
  squareFootageOptions = [
    'Less than 1,000 sq ft', 
    '1,000 - 5,000 sq ft', 
    '5,000 - 10,000 sq ft', 
    '10,000+ sq ft'
  ];
  // Objeto para el resumen
  summaryData: any = {};
  fileTypes = [
  {
    label: 'Photos',
    value: 'photos',
    icon: 'ph ph-images',
  },
  {
    label: 'Blueprints',
    value: 'blueprints',
    icon: 'ph ph-file-text',
  },
  {
    label: 'Floor Plans',
    value: 'floor_plans',
    icon: 'ph ph-map-trifold',
  },
  {
    label: 'Layouts',
    value: 'layouts',
    icon: 'ph ph-grid-four',
  },
  {
    label: 'Elevations',
    value: 'elevations',
    icon: 'ph ph-chart-line-up',
  },
  {
    label: 'Finish Schedules',
    value: 'finish_schedules',
    icon: 'ph ph-list-checks',
  },
];
requiredDocuments = [
  'W-9',
  'COI',
  'General Liability',
  'Workers’ Compensation',
  'Commercial Auto',
  'Other',
];
requestSent = false;
isSubmitting = false;
submitError = '';
fileError = '';

selectedFileTypes: string[] = [];
selectedDocuments: string[] = [];
uploadedFiles: File[] = [];

propertyTypes = [
  'Office',
  'Retail Store',
  'Restaurant',
  'Hotel / Hospitality',
  'Medical / Dental',
  'Education',
  'Multi-Family',
  'Corporate',
  'Government',
  'Other',
];

projectScopeOptions = [
  'Single Accent Wall',
  'Multiple Rooms',
  'Entire Property',
  'New Construction',
  'Renovation',
  'Tenant Improvement',
  'Wallpaper Removal and Installation',
  'Wall Preparation and Installation',
  'Other',
];
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
  this.buildForm();
}

private buildForm(): void {
  this.form = this.fb.group({
    projectType: ['Trade & Design', Validators.required],
    propertyType: ['', Validators.required],
    projectScope: ['', Validators.required],
    timeline: ['', Validators.required],
    wallConditions: ['', Validators.required],
    squareFootage: ['', Validators.required],
    additionalInfo: [''],

    otherRequiredDocument: [''],

    fullName: ['', Validators.required],
    company: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
  });

  this.form.valueChanges.subscribe(value => {
    this.summaryData = { ...value };
  });
}
  // Método para seleccionar la tarjeta y actualizar el formulario
  selectProjectType(type: string) {
    this.activeCard = type;
    this.form.patchValue({ projectType: type });
  }

  // Método para manejar el envío
  onSubmit(): void {
  this.submitError = '';

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.submitError =
      'Please complete the required project and contact fields.';
    return;
  }

  if (
    this.selectedDocuments.includes('Other') &&
    !this.form.value.otherRequiredDocument?.trim()
  ) {
    this.submitError =
      'Please enter the other required document.';
    return;
  }

  this.isSubmitting = true;

  console.log('Commercial project:', {
    ...this.form.getRawValue(),
    fileTypes: this.selectedFileTypes,
    requiredDocuments: this.selectedDocuments,
    files: this.uploadedFiles,
  });

  this.isSubmitting = false;
  this.requestSent = true;

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
  toggleFileType(type: string): void {
  this.selectedFileTypes = this.selectedFileTypes.includes(type)
    ? this.selectedFileTypes.filter(item => item !== type)
    : [...this.selectedFileTypes, type];
}

toggleDocument(document: string): void {
  this.selectedDocuments = this.selectedDocuments.includes(document)
    ? this.selectedDocuments.filter(item => item !== document)
    : [...this.selectedDocuments, document];

  if (!this.selectedDocuments.includes('Other')) {
    this.form.patchValue({
      otherRequiredDocument: '',
    });
  }
}

onFilesSelected(event: Event): void {
  const input = event.target as HTMLInputElement;

  if (!input.files?.length) {
    return;
  }

  this.fileError = '';

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  const maxSize = 20 * 1024 * 1024;
  const maxFiles = 10;

  for (const file of Array.from(input.files)) {
    if (!allowedTypes.includes(file.type)) {
      this.fileError =
        'Only JPG, PNG, WEBP and PDF files are allowed.';
      continue;
    }

    if (file.size > maxSize) {
      this.fileError =
        'Each file must be 20 MB or less.';
      continue;
    }

    if (this.uploadedFiles.length >= maxFiles) {
      this.fileError =
        `You can upload up to ${maxFiles} files.`;
      break;
    }

    this.uploadedFiles = [
      ...this.uploadedFiles,
      file,
    ];
  }

  input.value = '';
}

removeFile(index: number): void {
  this.uploadedFiles = this.uploadedFiles.filter(
    (_, currentIndex) => currentIndex !== index
  );
}

formatFileSize(size: number): string {
  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

getSelectedFileTypeLabels(): string {
  return this.selectedFileTypes
    .map(value => {
      return this.fileTypes.find(
        fileType => fileType.value === value
      )?.label;
    })
    .filter(Boolean)
    .join(', ');
}

startAnotherRequest(): void {
  this.requestSent = false;
  this.activeCard = 'Trade & Design';

  this.selectedFileTypes = [];
  this.selectedDocuments = [];
  this.uploadedFiles = [];

  this.buildForm();

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}
}