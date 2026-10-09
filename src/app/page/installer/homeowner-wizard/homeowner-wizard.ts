import {
  CommonModule,
  isPlatformBrowser
} from '@angular/common';

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { PricingEngine } from '../../../pricing/pricing.engine';
import { Answer, PricingInput, PricingResult, Scope } from '../../../pricing/pricing.types';
import { AuthPocketbaseService } from '../../../services/auth.service';
import { HomeownerProjectService } from '../../../services/homeowner-project.service';

import {
  ActivatedRoute,
  Router
} from '@angular/router';


declare const google: any;


/* =========================================================
   STEPS
========================================================= */

type HomeownerStep =
  | 'location'
  | 'spaces'
  | 'bathroom-type'
  | 'walls'
  | 'spaces-progress'
  | 'space-details'
  | 'review'
  | 'estimate'
  | 'base-estimate'
  | 'refine-estimate'
  | 'installation-estimate'
  | 'slanted-walls'
  | 'create-profile'
  | 'sign-in'
  | 'project-home'
  | 'services'
  | 'photos-review'
  | 'additional-info'
  | 'onsite-estimate'
  | 'onsite-request-sent'
  | 'onsite-payment'
  | 'reset-password'
  | 'reset-email-sent'
  | 'profile';

type RefinementAnswer = 'yes' | 'no' | 'not-sure';


/* =========================================================
   TIMELINE
========================================================= */

type StartTime =
  | 'asap'
  | '1-2-weeks'
  | '1-month'
  | 'not-sure';


interface StartOption {
  value: StartTime;
  label: string;
  icon: string;
}


/* =========================================================
   SPACES
========================================================= */

type SpaceType =
  | 'bathroom'
  | 'bedroom'
  | 'dining-room'
  | 'living-room'
  | 'office-study'
  | 'laundry-room'
  | 'mudroom'
  | 'pantry'
  | 'hallway'
  | 'foyer-entrance'
  | 'stairwell'
  | 'other';


interface SpaceOption {
  value: SpaceType;
  label: string;
  icon: string;
}


/* =========================================================
   BATHROOM
========================================================= */

type BathroomType =
  | 'water-closet'
  | 'powder-room'
  | 'full-bathroom'
  | 'primary-bathroom';


interface BathroomOption {
  value: BathroomType;
  title: string;
  description: string;
  icon: string;
}


/* =========================================================
   WALLS
========================================================= */

type WallCoverage =
  | 'one-wall'
  | 'several-walls'
  | 'all-walls';


interface WallOption {
  value: WallCoverage;
  label: string;
  icon: string;
}

/* =========================================================
   H07 · PHOTOS + MEASUREMENTS
========================================================= */

type MeasurementUnit =
  | 'feet-inches'
  | 'inches'
  | 'centimeters'
  | 'meters'
  | 'millimeters';


interface WallMeasurement {
  id: string;

  widthFeet: number | null;
  widthInches: number | null;

  heightFeet: number | null;
  heightInches: number | null;

  /** Raw values for non ft/in entry. Never overwritten by engine normalization. */
  widthValue?: number | null;
  heightValue?: number | null;

  /**
   * The first-class measurement source for pricing and unit switching.
   * Display fields may change when the user changes the selector; these never
   * do, unless the user explicitly edits that dimension again.
   */
  rawInputUnit?: MeasurementUnit;
  rawWidth?: number | null;
  rawHeight?: number | null;
  canonicalWidthFeet?: number | null;
  canonicalHeightFeet?: number | null;
}


interface SpacePhoto {
  id: string;

  name: string;

  previewUrl: string;

  file: File;
}

/* =========================================================
   LOCATION
========================================================= */

interface InstallerLocation {
  formattedAddress: string;

  city: string;

  state: string;
  stateCode: string;

  country: string;
  countryCode: string;

  zipCode: string | null;

  lat: number;
  lng: number;

  placeId: string;
}


/* =========================================================
   SPACE DETAILS
========================================================= */

interface SpaceDetails {
  type: SpaceType;

  bathroomType?: BathroomType;

  wallCoverage?: WallCoverage;

  lowerPaneling?: boolean;

  measurementUnit?: MeasurementUnit;

  walls?: WallMeasurement[];

  hasPhotos?: boolean;

  completed?: boolean;

  pricingAnswers?: Record<'width' | 'height' | 'sloped', RefinementAnswer>;
  slantedWallIds?: string[];
}

/* =========================================================
   HOMEOWNER DRAFT
========================================================= */

interface HomeownerDraft {
  audience: 'homeowner';

  locationQuery?: string;

  location?: InstallerLocation;

  timeline?: StartTime;

  spaces: SpaceType[];

  activeSpace?: SpaceType | null;

  /*
   * Se usa para saber a dónde regresar
   * cuando estamos editando un espacio.
   *
   * Ej:
   *
   * H04 → Bathroom → H05
   *
   * o
   *
   * H72 → Bathroom → H05
   */
  returnStep?: HomeownerStep | null;

  spaceDetails:
    Partial<
      Record<
        SpaceType,
        SpaceDetails
      >
    >;

  updatedAt?: string;
  remoteRequestId?: string;
  requestedServices?: { primer: boolean; ceiling: boolean };
}


/* =========================================================
   COMPONENT
========================================================= */

@Component({
  selector: 'app-homeowner-wizard',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './homeowner-wizard.html',

  styleUrl: './homeowner-wizard.scss'
})
export class HomeownerWizard
  implements OnInit, AfterViewInit, OnDestroy {


  /* =======================================================
     GOOGLE LOCATION INPUT
  ======================================================= */

  @ViewChild('locationInput')
  locationInput?: ElementRef<HTMLInputElement>;


  private autocomplete: any = null;

  private autocompleteListener: any = null;


  autocompleteInitialized = false;

  measurementUnit: MeasurementUnit = 'feet-inches';

  readonly measurementUnits: Array<{ value: MeasurementUnit; label: string; suffix: string }> = [
    { value: 'feet-inches', label: 'Feet & inches', suffix: 'ft / in' },
    { value: 'inches', label: 'Inches', suffix: 'in' },
    { value: 'centimeters', label: 'Centimeters', suffix: 'cm' },
    { value: 'meters', label: 'Meters', suffix: 'm' },
    { value: 'millimeters', label: 'Millimeters', suffix: 'mm' }
  ];

  get selectedMeasurementUnit() { return this.measurementUnits.find(unit => unit.value === this.measurementUnit)!; }

  selectMeasurementUnit(unit: MeasurementUnit): void {
    if (unit === this.measurementUnit) {
      return;
    }

    // Display conversion is always derived from canonical feet, never from
    // the previous display conversion. Raw input remains untouched.
    this.wallMeasurements.forEach(wall => {
      const widthFeet = this.wallValueInFeet(wall, 'width');
      const heightFeet = this.wallValueInFeet(wall, 'height');

      if (unit === 'feet-inches') {
        this.setFeetAndInches(wall, 'width', widthFeet);
        this.setFeetAndInches(wall, 'height', heightFeet);
      } else {
        wall.widthValue = this.feetToUnit(widthFeet, unit);
        wall.heightValue = this.feetToUnit(heightFeet, unit);
      }
    });
    this.measurementUnit = unit;
    this.saveSpaceDetailsState();
  }

  updateRawWallValue(wall: WallMeasurement, dimension: 'widthValue' | 'heightValue', value: string | number): void {
    const parsed = typeof value === 'number' ? value : Number(value);
    wall[dimension] = Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    this.recordWallInput(wall, dimension === 'widthValue' ? 'width' : 'height');
    this.saveSpaceDetailsState();
  }

  private wallValueInFeet(wall: WallMeasurement, dimension: 'width' | 'height'): number | null {
    const canonical = dimension === 'width' ? wall.canonicalWidthFeet : wall.canonicalHeightFeet;
    if (canonical !== null && canonical !== undefined) {
      return canonical > 0 ? canonical : null;
    }
    if (this.measurementUnit === 'feet-inches') {
      const inches = this.toTotalInches(
        dimension === 'width' ? wall.widthFeet : wall.heightFeet,
        dimension === 'width' ? wall.widthInches : wall.heightInches
      );
      return inches > 0 ? inches / 12 : null;
    }

    const value = dimension === 'width' ? wall.widthValue : wall.heightValue;
    if (value === null || value === undefined || value <= 0) {
      return null;
    }
    return this.unitToFeet(value, this.measurementUnit);
  }

  private recordWallInput(wall: WallMeasurement, dimension: 'width' | 'height'): void {
    const feet = this.wallDisplayValueInFeet(wall, dimension, this.measurementUnit);
    const raw = this.measurementUnit === 'feet-inches'
      ? this.toTotalInches(
        dimension === 'width' ? wall.widthFeet : wall.heightFeet,
        dimension === 'width' ? wall.widthInches : wall.heightInches
      )
      : (dimension === 'width' ? wall.widthValue : wall.heightValue) ?? null;

    // Keep the originally entered representation for auditability. Explicit
    // edits update canonical geometry, while unit switching never does.
    wall.rawInputUnit ??= this.measurementUnit;
    if (dimension === 'width') {
      wall.rawWidth ??= raw;
      wall.canonicalWidthFeet = feet;
    } else {
      wall.rawHeight ??= raw;
      wall.canonicalHeightFeet = feet;
    }
  }

  private wallDisplayValueInFeet(wall: WallMeasurement, dimension: 'width' | 'height', unit: MeasurementUnit): number | null {
    if (unit === 'feet-inches') {
      const inches = this.toTotalInches(
        dimension === 'width' ? wall.widthFeet : wall.heightFeet,
        dimension === 'width' ? wall.widthInches : wall.heightInches
      );
      return inches > 0 ? inches / 12 : null;
    }
    const value = dimension === 'width' ? wall.widthValue : wall.heightValue;
    return value === null || value === undefined || value <= 0 ? null : this.unitToFeet(value, unit);
  }

  private unitToFeet(value: number | null | undefined, unit: MeasurementUnit): number {
    if (value === null || value === undefined) return 0;
    return unit === 'inches' ? value / 12
      : unit === 'centimeters' ? value / 30.48
      : unit === 'meters' ? value / 0.3048
      : unit === 'millimeters' ? value / 304.8
      : value;
  }

  private feetToUnit(value: number | null, unit: MeasurementUnit): number | null {
    if (value === null) return null;
    return unit === 'inches' ? value * 12
      : unit === 'centimeters' ? value * 30.48
      : unit === 'meters' ? value * 0.3048
      : unit === 'millimeters' ? value * 304.8
      : value;
  }

  private setFeetAndInches(wall: WallMeasurement, dimension: 'width' | 'height', feet: number | null): void {
    const totalInches = feet === null ? null : feet * 12;
    const wholeFeet = totalInches === null ? null : Math.floor(totalInches / 12);
    const remainingInches = totalInches === null || wholeFeet === null ? null : totalInches - (wholeFeet * 12);
    if (dimension === 'width') {
      wall.widthFeet = wholeFeet;
      wall.widthInches = remainingInches;
    } else {
      wall.heightFeet = wholeFeet;
      wall.heightInches = remainingInches;
    }
  }

  wallMeasurements: WallMeasurement[] = [];

  spacePhotos: SpacePhoto[] = [];

  enlargedPhoto: SpacePhoto | null = null;

  private readonly photosBySpace =
    new Map<SpaceType, SpacePhoto[]>();

  /* =======================================================
     CURRENT STEP
  ======================================================= */

  currentStep: HomeownerStep =
    'location';


  readonly validSteps:
    HomeownerStep[] = [

      'location',

      'spaces',

      'bathroom-type',

      'walls',

      'spaces-progress',

      'space-details',

      'review',

      'estimate',

      'base-estimate',
      'refine-estimate',
      'installation-estimate',
      'slanted-walls',
      'create-profile',
      'sign-in',
      'project-home',
      'services',
      'photos-review',
      'additional-info',
      'onsite-estimate',
      'onsite-request-sent',
      'onsite-payment',
      'reset-password',
      'reset-email-sent',
      'profile'
    ];


  /*
   * IDs correspondientes al mapa/mockup.
   *
   * Nos permitirá mantener relación entre
   * código y documentación de diseño.
   */
  readonly STEP_CODES = {

    location:
      'H03',

    spaces:
      'H04',

    'bathroom-type':
      'H05',

    walls:
      'H06',

    'space-details':
      'H07',

    'spaces-progress':
      'H72',

    review:
      'H73',

    estimate:
      'H74',

    'base-estimate':
      'H11',

    'refine-estimate': 'H12',
    'installation-estimate': 'H13',
    'create-profile': 'H14',
    'sign-in': 'H15',
     'project-home': 'H16',
     services: 'H17',
     'photos-review': 'H26',
     'additional-info': 'H27',
     'onsite-estimate': 'H28',
     'onsite-request-sent': 'H29',
     'onsite-payment': 'H30',
     'reset-password': 'H44',
     'reset-email-sent': 'H45',
     profile: 'H65',
     'slanted-walls': 'H37'

  } as const;

  refinementAnswers: Record<'width' | 'height' | 'sloped', RefinementAnswer> = {
    width: 'not-sure', height: 'not-sure', sloped: 'not-sure'
  };

  selectedSlantedWalls = new Set<string>();
  private readonly pricingEngine = new PricingEngine();


  /* =======================================================
     MAIN DRAFT
  ======================================================= */

  draft: HomeownerDraft = {

    audience:
      'homeowner',

    spaces: [],

    activeSpace:
      null,

    returnStep:
      null,

     spaceDetails: {},
     requestedServices: { primer: false, ceiling: false }
  };


  /* =======================================================
     LOCATION
  ======================================================= */

  locationQuery = '';


  selectedLocation:
    InstallerLocation | null = null;


  locationLoading = false;

  locationConfirmed = false;

  locationError = '';


  /* =======================================================
     TIMELINE
  ======================================================= */

  selectedStartTime:
    StartTime | null = null;


  readonly startOptions:
    StartOption[] = [

      {
        value: 'asap',
        label: 'ASAP',
        icon: 'ph-clock'
      },

      {
        value: '1-2-weeks',
        label: 'Within 1–2 Weeks',
        icon: 'ph-calendar-blank'
      },

      {
        value: '1-month',
        label: 'Within 1 Month',
        icon: 'ph-calendar-blank'
      },

      {
        value: 'not-sure',
        label: 'Not sure yet',
        icon: 'ph-calendar-blank'
      }
    ];


  /* =======================================================
     SPACES
  ======================================================= */

  readonly spaces:
    SpaceOption[] = [

      {
        value: 'bathroom',
        label: 'Bathroom',
        icon: 'ph-toilet'
      },

      {
        value: 'bedroom',
        label: 'Bedroom',
        icon: 'ph-bed'
      },

      {
        value: 'dining-room',
        label: 'Dining Room',
        icon: 'ph-table'
      },

      {
        value: 'living-room',
        label: 'Living Room',
        icon: 'ph-armchair'
      },

      {
        value: 'office-study',
        label: 'Office / Study',
        icon: 'ph-desk'
      },

      {
        value: 'laundry-room',
        label: 'Laundry Room',
        icon: 'ph-washing-machine'
      },

      {
        value: 'mudroom',
        label: 'Mudroom / Drop Zone',
        icon: 'ph-coat-hanger'
      },

      {
        value: 'pantry',
        label: 'Pantry',
        icon: 'ph-cabinet'
      },

      {
        value: 'hallway',
        label: 'Hallway',
        icon: 'ph-path'
      },

      {
        value: 'foyer-entrance',
        label: 'Foyer / Entrance',
        icon: 'ph-door-open'
      },

      {
        value: 'stairwell',
        label: 'Stairwell',
        icon: 'ph-stairs'
      },

      {
        value: 'other',
        label: 'Other Spaces',
        icon: 'ph-squares-four'
      }
    ];


  /* =======================================================
     BATHROOM TYPE
  ======================================================= */

  selectedBathroomType:
    BathroomType | null = null;


  readonly bathroomTypes:
    BathroomOption[] = [

      {
        value:
          'water-closet',

        title:
          'Water Closet',

        description:
          'Separate toilet area',

        icon:
          'ph-toilet'
      },

      {
        value:
          'powder-room',

        title:
          'Powder Room',

        description:
          'Toilet and sink',

        icon:
          'ph-sink'
      },

      {
        value:
          'full-bathroom',

        title:
          'Full Bathroom',

        description:
          'Includes a shower or bathtub',

        icon:
          'ph-shower'
      },

      {
        value:
          'primary-bathroom',

        title:
          'Primary Bathroom',

        description:
          'Bathroom serving the primary bedroom',

        icon:
          'ph-bathtub'
      }
    ];


  /* =======================================================
     WALLS
  ======================================================= */

  selectedWallCoverage:
    WallCoverage | null = null;


  lowerPaneling:
    boolean | null = null;


  readonly wallOptions:
    WallOption[] = [

      {
        value:
          'one-wall',

        label:
          'One wall',

        icon:
          'ph-square'
      },

      {
        value:
          'several-walls',

        label:
          'Several walls',

        icon:
          'ph-wall'
      },

      {
        value:
          'all-walls',

        label:
          'All walls',

        icon:
          'ph-selection-all'
      }
    ];


  /* =======================================================
     CONSTRUCTOR
  ======================================================= */

  constructor(
    private route: ActivatedRoute,

    private router: Router,

    private ngZone: NgZone,

    private cdr: ChangeDetectorRef,

    @Inject(PLATFORM_ID)
    private platformId: Object,
    public auth: AuthPocketbaseService,
    private projectService: HomeownerProjectService
  ) {}

  firstName = '';
  lastName = '';
  accountEmail = '';
  accountPhone = '';
  accountPassword = '';
  accountError = '';
  accountSaving = false;
  resetEmail = '';
  resetMessage = '';
  additionalInfo = '';
  additionalInfoError = '';
  profileName = '';
  profilePhone = '';
  profileMessage = '';
  projectRecords: any[] = [];
  private projectSaved = false;
  private persistedFingerprint = '';
  private stopRequestSubscription?: () => Promise<void>;
  selectedProjectEstimate: any = null;
  readonly serviceOptions = [
    { key: 'primer', label: 'Primer', description: 'Request a primer scope and price from the installer.' },
    { key: 'ceiling', label: 'Ceiling installation', description: 'Request a separate ceiling scope and price.' }
  ] as const;


  /* =======================================================
     INIT
  ======================================================= */

  ngOnInit(): void {

    /*
     * Primero recuperamos cualquier progreso
     * guardado del wizard.
     */
    this.restoreDraft();


    /*
     * Observamos el :step de la URL:
     *
     * /installer/homeowner/location
     * /installer/homeowner/spaces
     * ...
     */
    this.route.paramMap
      .subscribe(params => {

        const step =
          params.get(
            'step'
          ) as HomeownerStep | null;


        /*
         * Si no viene step:
         *
         * /installer/homeowner
         *
         * redirigimos a H03.
         */
        if (!step) {

          void this.router.navigate(
            [
              '/installer',
              'homeowner',
              'location'
            ],
            {
              replaceUrl: true
            }
          );

          return;
        }


        /*
         * Evitamos steps inexistentes.
         */
        if (
          !this.validSteps.includes(
            step
          )
        ) {

          void this.router.navigate(
            [
              '/installer',
              'homeowner',
              'location'
            ],
            {
              replaceUrl: true
            }
          );

          return;
        }


        /*
         * Si salimos de H03 eliminamos
         * la instancia anterior de autocomplete.
         */
        if (
          this.currentStep === 'location' &&
          step !== 'location'
        ) {

          this.destroyAutocomplete();
        }


         this.currentStep =
           step;


        /*
         * Recuperamos estado particular del paso.
         */
         this.restoreStepState();

         if (step === 'project-home' && this.auth.isLoggedIn) {
           void this.loadProjects();
         }


        if (
          isPlatformBrowser(
            this.platformId
          )
        ) {

          window.scrollTo({
            top: 0,
            behavior: 'auto'
          });
        }


        /*
         * Al regresar a H03, el input vuelve
         * a existir en el DOM.
         */
        if (
          step === 'location'
        ) {

          this.autocompleteInitialized =
            false;


          setTimeout(() => {

            this.initializeGoogleWhenReady();

          }, 100);
        }

      });
  }


  /* =======================================================
     AFTER VIEW INIT
  ======================================================= */

  ngAfterViewInit(): void {

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {
      return;
    }


    if (
      this.currentStep ===
      'location'
    ) {

      this.initializeGoogleWhenReady();
    }
  }


  /* =======================================================
     NAVIGATION
  ======================================================= */

  goTo(
    step: HomeownerStep
  ): void {

    this.saveDraft();


    void this.router.navigate([
      '/installer',
      'homeowner',
      step
    ]);
  }


  /* =======================================================
     BACK
  ======================================================= */

  back(): void {

    switch (
      this.currentStep
    ) {


      /* ---------------------------------------------------
         H03
      --------------------------------------------------- */

      case 'location':

        this.saveDraft();

        void this.router.navigate([
          '/installer'
        ]);

        return;


      /* ---------------------------------------------------
         H04
      --------------------------------------------------- */

      case 'spaces':

        this.goTo(
          'location'
        );

        return;


      /* ---------------------------------------------------
         H05
      --------------------------------------------------- */

      case 'bathroom-type':

        this.goTo(
          this.draft.returnStep ??
          'spaces'
        );

        return;


      /* ---------------------------------------------------
         H06
      --------------------------------------------------- */

      case 'walls':

        /*
         * Bathroom siempre tiene H05 antes.
         */
        if (
          this.draft.activeSpace ===
          'bathroom'
        ) {

          this.goTo(
            'bathroom-type'
          );

          return;
        }


        this.goTo(
          this.draft.returnStep ??
          'spaces'
        );

        return;


      /* ---------------------------------------------------
         H07
      --------------------------------------------------- */

      case 'space-details':

        this.goTo(
          'walls'
        );

        return;


      /* ---------------------------------------------------
         H72
      --------------------------------------------------- */

      case 'spaces-progress':

        this.goTo(
          'spaces'
        );

        return;


      /* ---------------------------------------------------
         H73
      --------------------------------------------------- */

      case 'review':

        this.goTo(
          'spaces-progress'
        );

        return;


      /* ---------------------------------------------------
         H74
      --------------------------------------------------- */

      case 'estimate':

        this.goTo(
          'review'
        );

        return;


      /* ---------------------------------------------------
         H11
      --------------------------------------------------- */

      case 'base-estimate':

        this.goTo(
          'space-details'
        );

        return;

      case 'refine-estimate': this.goTo('base-estimate'); return;
      case 'slanted-walls': this.goTo('refine-estimate'); return;
      case 'installation-estimate': this.goTo('refine-estimate'); return;
      case 'create-profile':
      case 'sign-in': this.goTo('installation-estimate'); return;
      case 'project-home': this.goTo('installation-estimate'); return;
      case 'services': this.goTo('project-home'); return;
      case 'photos-review': this.goTo('space-details'); return;
      case 'additional-info': this.goTo('photos-review'); return;
      case 'onsite-estimate': this.goTo('space-details'); return;
      case 'onsite-request-sent': this.goTo('onsite-estimate'); return;
      case 'onsite-payment': this.goTo('onsite-request-sent'); return;
      case 'reset-password': this.goTo('sign-in'); return;
      case 'reset-email-sent': this.goTo('reset-password'); return;
      case 'profile': this.goTo('project-home'); return;
    }
  }


  /* =======================================================
     GOOGLE INITIALIZATION
  ======================================================= */

  private initializeGoogleWhenReady(
    attempt = 0
  ): void {

    const maxAttempts =
      20;


    if (
      typeof google !== 'undefined' &&

      google.maps?.places &&

      this.locationInput
        ?.nativeElement
    ) {

      this.initGoogleAutocomplete();

      return;
    }


    if (
      attempt >= maxAttempts
    ) {

      console.error(
        'Google Maps / Places API is not available.'
      );

      return;
    }


    setTimeout(() => {

      this.initializeGoogleWhenReady(
        attempt + 1
      );

    }, 250);
  }


  /* =======================================================
     GOOGLE AUTOCOMPLETE
  ======================================================= */

  private initGoogleAutocomplete():
    void {

    if (
      this.autocompleteInitialized
    ) {
      return;
    }


    if (
      !this.locationInput
        ?.nativeElement
    ) {
      return;
    }


    if (
      typeof google === 'undefined' ||

      !google.maps?.places
    ) {
      return;
    }


    this.autocompleteInitialized =
      true;


    this.autocomplete =
      new google.maps.places.Autocomplete(
        this.locationInput.nativeElement,
        {

          types: [
            'geocode'
          ],

          componentRestrictions: {
            country: 'us'
          },

          fields: [
            'place_id',
            'formatted_address',
            'geometry',
            'address_components'
          ]
        }
      );


    this.autocompleteListener =
      this.autocomplete.addListener(
        'place_changed',
        () => {

          this.ngZone.run(() => {

            const place =
              this.autocomplete
                .getPlace();


            if (
              !place
                ?.geometry
                ?.location
            ) {

              this.locationError =
                'Please select a valid location.';

              return;
            }


            const location =
              this.parseGoogleLocation(
                place
              );


            if (!location) {

              this.locationError =
                'Please select a location in the United States.';

              return;
            }


            this.selectedLocation =
              location;


            this.locationQuery =
              location.formattedAddress;


            /*
             * Seleccionar la sugerencia no
             * equivale todavía a confirmarla.
             */
            this.locationConfirmed =
              false;


            this.locationError =
              '';


            this.cdr.detectChanges();

          });

        }
      );
  }


  /* =======================================================
     LOCATION INPUT CHANGE
  ======================================================= */

  onLocationQueryChange(
    value: string
  ): void {

    this.locationQuery =
      value;


    /*
     * Si el usuario modifica manualmente
     * el input invalidamos cualquier
     * ubicación anterior.
     */
    this.selectedLocation =
      null;


    this.locationConfirmed =
      false;


    this.locationError =
      '';
  }


  /* =======================================================
     CONFIRM LOCATION
  ======================================================= */

  async confirmLocation():
    Promise<void> {

    this.locationError =
      '';


    const query =
      this.locationQuery
        .trim();


    if (!query) {

      this.locationError =
        'Please enter a ZIP code or location.';

      return;
    }


    /*
     * Si el usuario escogió previamente una
     * sugerencia de Google Places, únicamente
     * tenemos que confirmarla.
     */
    if (
      this.selectedLocation
    ) {

      this.locationConfirmed =
        true;


      this.saveLocationState();


      return;
    }


    if (
      typeof google === 'undefined' ||

      !google.maps?.Geocoder
    ) {

      this.locationError =
        'Location service is not available. Please try again.';

      return;
    }


    if (
      this.locationLoading
    ) {
      return;
    }


    try {

      this.locationLoading =
        true;


      const geocoder =
        new google.maps.Geocoder();


      /*
       * ==================================================
       * INTENTO 1
       *
       * ZIP / ciudad / dirección dentro de USA
       * ==================================================
       */

      let results =
        await this.geocodeSafely(
          geocoder,
          {

            address:
              query,

            componentRestrictions: {
              country: 'US'
            }

          }
        );


      /*
       * ==================================================
       * INTENTO 2
       *
       * Fallback agregando USA al texto.
       * ==================================================
       */

      if (
        !results.length
      ) {

        results =
          await this.geocodeSafely(
            geocoder,
            {

              address:
                `${query}, USA`

            }
          );
      }


      /*
       * ==================================================
       * INTENTO 3
       *
       * Si parece ZIP, hacemos una consulta
       * específicamente por postalCode.
       * ==================================================
       */

      if (
        !results.length &&

        /^\d{5}(?:-\d{4})?$/
          .test(query)
      ) {

        results =
          await this.geocodeSafely(
            geocoder,
            {

              componentRestrictions: {

                country:
                  'US',

                postalCode:
                  query

              }

            }
          );
      }


      if (
        !results.length
      ) {

        this.locationError =
          'We could not find that ZIP code or location.';

        return;
      }


      const result =
        this.chooseBestGoogleResult(
          results,
          query
        );


      if (
        !result
          ?.geometry
          ?.location
      ) {

        this.locationError =
          'We could not verify that location.';

        return;
      }


      const location =
        this.parseGoogleLocation(
          result
        );


      if (!location) {

        this.locationError =
          'Please enter a location in the United States.';

        return;
      }


      this.selectedLocation =
        location;


      this.locationConfirmed =
        true;


      this.locationError =
        '';


      this.saveLocationState();


    } catch (error) {

      console.error(
        'Error resolving location:',
        error
      );


      this.locationError =
        'We could not verify the location. Please try again.';

    } finally {

      this.locationLoading =
        false;


      this.cdr.detectChanges();
    }
  }


  /* =======================================================
     SAFE GEOCODER
  ======================================================= */

  private async geocodeSafely(
    geocoder: any,
    request: any
  ): Promise<any[]> {

    try {

      const response =
        await geocoder.geocode(
          request
        );


      return (
        response?.results ??
        []
      );

    } catch (error: any) {

      /*
       * ZERO_RESULTS simplemente significa
       * que debemos intentar otra estrategia.
       */
      const zeroResults =

        error?.code ===
          'ZERO_RESULTS' ||

        error?.status ===
          'ZERO_RESULTS' ||

        error?.message
          ?.includes(
            'ZERO_RESULTS'
          );


      if (zeroResults) {

        return [];
      }


      throw error;
    }
  }


  /* =======================================================
     SELECT BEST GOOGLE RESULT
  ======================================================= */

  private chooseBestGoogleResult(
    results: any[],
    query: string
  ): any | null {

    if (
      !results.length
    ) {

      return null;
    }


    /*
     * Si el usuario escribió un ZIP,
     * buscamos primero una coincidencia exacta.
     */
    if (
      /^\d{5}(?:-\d{4})?$/
        .test(query)
    ) {

      const exactZip =
        results.find(
          (result: any) =>

            result
              .address_components
              ?.some(
                (component: any) =>

                  component
                    .types
                    ?.includes(
                      'postal_code'
                    ) &&

                  (
                    component
                      .long_name ===
                      query ||

                    component
                      .short_name ===
                      query
                  )
              )
        );


      if (exactZip) {

        return exactZip;
      }


      /*
       * Si no hay exacto, preferimos cualquier
       * resultado clasificado como postal_code.
       */
      const postalResult =
        results.find(
          (result: any) =>
            result
              .types
              ?.includes(
                'postal_code'
              )
        );


      if (postalResult) {

        return postalResult;
      }
    }


    return results[0];
  }


  /* =======================================================
     PARSE GOOGLE LOCATION
  ======================================================= */

  private parseGoogleLocation(
    place: any
  ): InstallerLocation | null {

    if (
      !place
        ?.geometry
        ?.location
    ) {

      return null;
    }


    const components =
      place
        .address_components ??
      [];


    const getComponent = (
      type: string,
      short = false
    ): string => {

      const component =
        components.find(
          (item: any) =>
            item
              .types
              ?.includes(type)
        );


      if (!component) {

        return '';
      }


      return short
        ? component.short_name ?? ''
        : component.long_name ?? '';
    };


    const city =

      getComponent(
        'locality'
      ) ||

      getComponent(
        'postal_town'
      ) ||

      getComponent(
        'sublocality'
      ) ||

      getComponent(
        'administrative_area_level_2'
      );


    const state =
      getComponent(
        'administrative_area_level_1'
      );


    const stateCode =
      getComponent(
        'administrative_area_level_1',
        true
      );


    const country =
      getComponent(
        'country'
      );


    const countryCode =
      getComponent(
        'country',
        true
      );


    const zipCode =
      getComponent(
        'postal_code'
      ) || null;


    /*
     * Walivio:
     * restringimos este flujo a USA.
     */
    if (
      countryCode &&

      countryCode
        .toUpperCase() !==
      'US'
    ) {

      return null;
    }


    return {

      formattedAddress:
        place.formatted_address ||
        this.locationQuery,

      city,

      state,

      stateCode,

      country:
        country ||
        'United States',

      countryCode:
        countryCode ||
        'US',

      zipCode,

      lat:
        place
          .geometry
          .location
          .lat(),

      lng:
        place
          .geometry
          .location
          .lng(),

      placeId:
        place.place_id ||
        ''
    };
  }


  /* =======================================================
     LOCATION LABEL
  ======================================================= */

  get locationLabel():
    string {

    if (
      !this.selectedLocation
    ) {

      return '';
    }


    if (
      this.selectedLocation.city &&
      this.selectedLocation.stateCode
    ) {

      return (
        `${this.selectedLocation.city}, ` +
        this.selectedLocation.stateCode
      );
    }


    return (
      this.selectedLocation
        .formattedAddress
    );
  }


  /* =======================================================
     TIMELINE
  ======================================================= */

  selectStartTime(
    value: StartTime
  ): void {

    this.selectedStartTime =
      value;
  }


  /* =======================================================
     H03 → H04
  ======================================================= */

  continueFromLocation():
    void {

    if (
      !this.locationConfirmed ||

      !this.selectedLocation ||

      !this.selectedStartTime
    ) {

      return;
    }


    this.saveLocationState();


    this.goTo(
      'spaces'
    );
  }


  private saveLocationState():
    void {

    this.draft.locationQuery =
      this.locationQuery;


    if (
      this.selectedLocation
    ) {

      this.draft.location =
        this.selectedLocation;
    }


    if (
      this.selectedStartTime
    ) {

      this.draft.timeline =
        this.selectedStartTime;
    }


    this.saveDraft();
  }


  /* =======================================================
     SPACE SELECTION
  ======================================================= */

  isSelected(
    space: SpaceType
  ): boolean {

    return (
      this.draft.spaces
        .includes(space)
    );
  }


  toggleSpace(
    space: SpaceType
  ): void {

    /*
     * Remove
     */
    if (
      this.isSelected(
        space
      )
    ) {

      this.draft.spaces =
        this.draft.spaces
          .filter(
            item =>
              item !== space
          );


      /*
       * Si quitamos el espacio del proyecto,
       * eliminamos sus respuestas asociadas.
       */
      delete this.draft
        .spaceDetails[
          space
        ];


      this.revokeSpacePhotos(space);


      if (
        this.draft.activeSpace ===
        space
      ) {

        this.draft.activeSpace =
          null;
      }


      this.saveDraft();

      return;
    }


    /*
     * Add
     */
    this.draft.spaces = [
      ...this.draft.spaces,
      space
    ];


    this.saveDraft();
  }


  get selectedCount():
    number {

    return (
      this.draft
        .spaces
        .length
    );
  }


  /* =======================================================
     H04 BRANCHING
  ======================================================= */

  continueFromSpaces():
    void {

    const spaces =
      this.draft.spaces;


    if (
      spaces.length === 0
    ) {

      return;
    }


    /*
     * =====================================================
     * MÁS DE UN ESPACIO
     *
     * H04 → H72
     * =====================================================
     */

    if (
      spaces.length > 1
    ) {

      this.draft.activeSpace =
        null;


      this.draft.returnStep =
        'spaces';


      this.goTo(
        'spaces-progress'
      );

      return;
    }


    /*
     * Único espacio.
     */
    const space =
      spaces[0];


    if (!space) {

      return;
    }


    this.draft.activeSpace =
      space;


    this.draft.returnStep =
      'spaces';


    this.initializeSpace(
      space
    );


    /*
     * =====================================================
     * BATHROOM
     *
     * H04 → H05
     * =====================================================
     */

    if (
      space ===
      'bathroom'
    ) {

      this.goTo(
        'bathroom-type'
      );

      return;
    }


    /*
     * =====================================================
     * CUALQUIER OTRO ESPACIO
     *
     * H04 → H06
     * =====================================================
     */

    this.goTo(
      'walls'
    );
  }


  /* =======================================================
     INITIALIZE SPACE
  ======================================================= */

  private initializeSpace(
    space: SpaceType
  ): void {

    if (
      this.draft
        .spaceDetails[
          space
        ]
    ) {

      return;
    }


    this.draft
      .spaceDetails[
        space
      ] = {

        type:
          space,

        completed:
          false
      };
  }


  /* =======================================================
     BATHROOM
  ======================================================= */

  selectBathroomType(
    type: BathroomType
  ): void {

    this.selectedBathroomType =
      type;
  }


  /* =======================================================
     H05 → H06
  ======================================================= */

  continueFromBathroom():
    void {

    if (
      !this.selectedBathroomType
    ) {

      return;
    }


    this.draft.activeSpace =
      'bathroom';


    const existing =
      this.draft
        .spaceDetails
        .bathroom ?? {

          type:
            'bathroom'

        };


    this.draft
      .spaceDetails
      .bathroom = {

        ...existing,

        bathroomType:
          this.selectedBathroomType,

        completed:
          false
      };


    this.saveDraft();


    this.goTo(
      'walls'
    );
  }


  /* =======================================================
     WALLS
  ======================================================= */

  selectWallCoverage(
    value: WallCoverage
  ): void {

    this.selectedWallCoverage =
      value;
  }


  selectLowerPaneling(
    value: boolean
  ): void {

    this.lowerPaneling =
      value;
  }


  /* =======================================================
     H06 → H07
  ======================================================= */

  continueFromWalls():
    void {

    const activeSpace =
      this.draft.activeSpace;


    if (
      !activeSpace ||

      !this.selectedWallCoverage ||

      this.lowerPaneling ===
        null
    ) {

      return;
    }


    const existing =
      this.draft
        .spaceDetails[
          activeSpace
        ] ?? {

          type:
            activeSpace

        };


    this.draft
      .spaceDetails[
        activeSpace
      ] = {

        ...existing,

        wallCoverage:
          this.selectedWallCoverage,

        lowerPaneling:
          this.lowerPaneling,

        completed:
          false
      };


    this.saveDraft();


    /*
     * H07 será el siguiente paso
     * cuando incorporemos su mockup.
     */
    this.goTo(
      'space-details'
    );
  }


  /* =======================================================
     H72 — MULTIPLE SPACES
  ======================================================= */

  get spacesProgress() {

    return (
      this.draft.spaces
        .map(space => {

          const details =
            this.draft
              .spaceDetails[
                space
              ];


          const option =
            this.spaces
              .find(
                item =>
                  item.value ===
                  space
              );


          return {

            space,

            label:
              space === 'bathroom' && details?.bathroomType
                ? this.bathroomTypes.find(
                    bathroom =>
                      bathroom.value === details.bathroomType
                  )?.title ?? option?.label ?? space
                : option?.label ?? space,

            icon:
              option?.icon ??
              'ph-square',

            completed:
              details?.completed ===
              true,

            details

          };

        })
    );
  }


  get completedSpacesCount():
    number {

    return (
      this.spacesProgress
        .filter(
          item =>
            item.completed
        )
        .length
    );
  }


  /* =======================================================
     EDIT SPACE FROM H72
  ======================================================= */

  editSpace(
    space: SpaceType,
    returnStep: HomeownerStep = 'spaces-progress'
  ): void {

    this.draft.activeSpace =
      space;


    /*
     * Así Back puede regresar a H72.
     */
    this.draft.returnStep =
      returnStep;


    this.initializeSpace(
      space
    );


    this.saveDraft();


    /*
     * Bathroom tiene paso especial H05.
     */
    if (
      space ===
      'bathroom'
    ) {

      this.goTo(
        'bathroom-type'
      );

      return;
    }


    /*
     * Otros espacios van directamente H06.
     */
    this.goTo(
      'walls'
    );
  }


  /** H73: the map allows adding another space without losing this review. */
  addAnotherSpace(): void {
    this.draft.activeSpace = null;
    this.draft.returnStep = 'spaces';
    this.saveDraft();
    this.goTo('spaces');
  }


  /** H73 → H74. Values rendered by H74 remain presentation-only. */
  viewProjectEstimate(): void {
    this.goTo('estimate');
  }


  get activePricingResult(): PricingResult {
    return this.priceSpace(this.draft.activeSpace);
  }

  get baseInstallationEstimate(): { statusLabel: string; laborAmountLabel: string; basisLabel: string; disclaimer: string } {
    const result = this.activePricingResult;
    const base = result.line_items.find(item => item.rule_id === 'base');
    return {
      statusLabel: result.pricing_status === 'AUTO_PRICE' ? 'Preliminary' : result.pricing_status.replaceAll('_', ' '),
      laborAmountLabel: base ? this.formatCents(base.amount_cents) : '—',
      basisLabel: result.pricing_status === 'INSTALLER_REVIEW' ? 'An installer review is needed before an automatic estimate can be shown.' : 'Based on the measurements provided.',
      disclaimer: result.pending_items.length ? 'Some details still need verification before the estimate is final.' : 'Wall conditions and wallpaper details may change this estimate.'
    };
  }

  get refinementPotentialRates(): Record<'width' | 'height' | 'sloped', string | null> {
    const input = this.pricingInputFor(this.draft.activeSpace, { width: 'not-sure', height: 'not-sure', sloped: 'not-sure' });
    const result = this.pricingEngine.quote(input);
    const find = (condition: string) => result.pending_items.find(item => item.condition.includes(condition))?.potential_rate_cents;
    return { width: this.money(find('Wallpaper width')), height: this.money(find('Wall height')), sloped: this.money(find('Slanted')) };
  }

  /** H12 is driven by engine applicability, not by whether a modifier has a rate. */
  hasRefinementQuestion(question: 'width' | 'height' | 'sloped'): boolean {
    const condition = question === 'width' ? 'Wallpaper width' : question === 'height' ? 'Wall height' : 'Slanted';
    return this.activePricingResult.pending_items.some(item => item.condition.includes(condition));
  }


  refineBaseEstimate(): void {
    this.goTo('refine-estimate');
  }

  selectRefinement(question: 'width' | 'height' | 'sloped', answer: RefinementAnswer): void {
    this.refinementAnswers[question] = answer;
    this.saveSpaceDetailsState();
    if (question === 'sloped' && answer === 'yes' && this.hasRefinementQuestion('sloped')) {
      this.goTo('slanted-walls');
    }
  }

  continueFromRefinement(): void { this.goTo('installation-estimate'); }

  toggleSlantedWall(wall: string): void {
    this.selectedSlantedWalls.has(wall)
      ? this.selectedSlantedWalls.delete(wall)
      : this.selectedSlantedWalls.add(wall);
    this.saveSpaceDetailsState();
  }

  continueFromSlantedWalls(): void { this.goTo('installation-estimate'); }

  async saveEstimateAndContinue(): Promise<void> {
    this.accountError = '';
    if (this.auth.isLoggedIn) {
      await this.persistProject();
      this.goTo('project-home');
      return;
    }
    this.goTo('create-profile');
  }
  showSignIn(): void { this.goTo('sign-in'); }
  showCreateProfile(): void { this.goTo('create-profile'); }
  async createProfileAndContinue(): Promise<void> {
    if (this.accountSaving) return;
    if (!this.accountEmail || !this.accountPassword || !this.firstName || !this.lastName) {
      this.accountError = 'Complete your name, email, and password.';
      return;
    }
    this.accountSaving = true;
    this.accountError = '';
    try {
      await this.auth.registerMinimal({ username: `${this.firstName} ${this.lastName}`, email: this.accountEmail, phone: this.accountPhone, type: 'client', password: this.accountPassword });
      await this.auth.login(this.accountEmail, this.accountPassword);
      await this.persistProject();
      this.goTo('project-home');
    } catch (error: any) {
      this.accountError = error?.status === 400 ? 'This email may already be registered.' : 'We could not save your profile. Please try again.';
    } finally {
      this.accountSaving = false;
    }
  }

  async signInAndContinue(): Promise<void> {
    if (this.accountSaving) return;
    this.accountSaving = true;
    this.accountError = '';
    try {
      await this.auth.login(this.accountEmail, this.accountPassword);
      await this.persistProject();
      this.goTo('project-home');
    } catch {
      this.accountError = 'The email or password is not valid.';
    } finally {
      this.accountSaving = false;
    }
  }

  continueToProjectHome(): void {
    if (this.currentStep === 'create-profile') void this.createProfileAndContinue();
    else void this.signInAndContinue();
  }
  viewInstallationEstimate(): void { this.goTo('installation-estimate'); }
  openPasswordReset(): void {
    this.resetEmail = this.accountEmail;
    this.resetMessage = '';
    this.goTo('reset-password');
  }
  async sendPasswordReset(): Promise<void> {
    this.resetMessage = '';
    if (!this.resetEmail.trim()) return;
    try {
      await this.auth.requestPasswordReset(this.resetEmail.trim());
      this.resetMessage = 'If an account exists for this email, a reset link was sent.';
      this.goTo('reset-email-sent');
    } catch {
      this.resetMessage = 'We could not send the reset link. Please try again.';
    }
  }
  openProfile(): void {
    this.profileName = this.auth.user?.['name'] ?? '';
    this.profilePhone = this.auth.user?.['phone'] ?? '';
    this.profileMessage = '';
    this.goTo('profile');
  }
  async saveProfile(): Promise<void> {
    try {
      await this.auth.updateMyFields({ name: this.profileName.trim(), phone: this.profilePhone.trim() });
      this.profileMessage = 'Profile changes saved.';
    } catch {
      this.profileMessage = 'We could not save your profile changes.';
    }
  }
  async submitAdditionalInfo(): Promise<void> {
    const requestId = this.draft.remoteRequestId;
    if (!requestId || !this.additionalInfo.trim()) {
      this.additionalInfoError = 'Add the requested information before sending.';
      return;
    }
    this.additionalInfoError = '';
    await this.projectService.transitionRequest(requestId, 'pending', 'Customer provided additional information', {
      submission_snapshot: { ...this.draft, additional_info: this.additionalInfo.trim() }
    });
    this.goTo('photos-review');
  }
  async markPaymentPending(): Promise<void> {
    const requestId = this.draft.remoteRequestId;
    if (!requestId) return;
    const request = this.projectRecords.find(project => project.id === requestId);
    await this.projectService.transitionRequest(requestId, request?.['status'] ?? 'pending', 'Onsite payment provider pending', {
      payment_status: 'PAYMENT_PROVIDER_PENDING'
    });
    this.goTo('onsite-payment');
  }
  continueProject(): void { this.goTo('services'); }
  isServiceSelected(key: 'primer' | 'ceiling'): boolean { return this.draft.requestedServices?.[key] === true; }
  toggleAdditionalService(key: 'primer' | 'ceiling'): void {
    this.draft.requestedServices ??= { primer: false, ceiling: false };
    this.draft.requestedServices[key] = !this.draft.requestedServices[key];
    this.saveDraft();
  }
  async continueWithoutExtras(): Promise<void> {
    await this.persistProject();
    this.findInstallers();
  }
  findInstallers(): void {
    if (this.draft.remoteRequestId) void this.router.navigate(['/installer-results', this.draft.remoteRequestId]);
  }
  async openProject(project: any): Promise<void> {
    const snapshot = project?.submission_snapshot;
    if (snapshot && typeof snapshot === 'object') {
      this.draft = { ...(snapshot as HomeownerDraft), audience: 'homeowner', remoteRequestId: project.id };
      this.restoreStepState();
    } else {
      this.draft.remoteRequestId = project.id;
    }
    try { this.selectedProjectEstimate = (await this.projectService.getEstimates(project.id)).at(-1) ?? null; } catch { this.selectedProjectEstimate = null; }
    this.goTo('services');
  }
  async requestVisit(): Promise<void> {
    if (this.draft.remoteRequestId) {
      await this.projectService.transitionRequest(this.draft.remoteRequestId, 'pending', 'Homeowner requested an onsite visit');
    }
    this.goTo('onsite-request-sent');
  }

  signOut(): void {
    this.auth.logout();
    this.projectRecords = [];
    this.goTo('sign-in');
  }

  private async loadProjects(): Promise<void> {
    try {
      this.projectRecords = await this.projectService.listMyProjects();
      if (this.draft.remoteRequestId) {
        if (this.stopRequestSubscription) await this.stopRequestSubscription();
        this.stopRequestSubscription = await this.projectService.subscribeToProject(this.draft.remoteRequestId, record => {
          this.projectRecords = this.projectRecords.map(project => project.id === record.id ? record : project);
          if (record['payment_status'] === 'PAYMENT_PROVIDER_PENDING') this.goTo('onsite-payment');
          if (record['status'] === 'pending' && this.currentStep === 'photos-review') this.goTo('additional-info');
          if (record['status'] === 'installer_responded' && this.currentStep === 'onsite-request-sent') this.goTo('onsite-payment');
        });
      }
    } catch { this.projectRecords = []; }
  }

  private async persistProject(): Promise<void> {
    const results = this.draft.spaces.map(space => this.priceSpace(space));
    const fingerprint = JSON.stringify({ draft: this.draft, results });
    if (this.projectSaved && this.draft.remoteRequestId && fingerprint === this.persistedFingerprint) return;
    const saved = await this.projectService.saveProject(this.draft as any, results);
    this.draft.remoteRequestId = saved.request.id;
    this.projectSaved = true;
    this.persistedFingerprint = fingerprint;
    this.saveDraft();
    for (const space of this.draft.spaces) {
      const photos = this.photosBySpace.get(space) ?? [];
      if (photos.length) await this.projectService.uploadPhotos(saved.request.id, photos, space);
    }
  }


  get estimateItems(): Array<{
    space: SpaceType;
    label: string;
    description: string;
    amount: string;
    details: SpaceDetails | undefined;
  }> {
    return this.draft.spaces.map(space => {
      const details = this.draft.spaceDetails[space];
      const label = this.spaceLabelForEstimate(space, details);

      return {
        space,
        label,
        description: this.priceSpace(space).pricing_status.replaceAll('_', ' '),
        amount: this.money(this.priceSpace(space).known_subtotal_cents) ?? '—',
        details
      };
    });
  }


  get estimateTotalLabel(): string {
    const results = this.draft.spaces.map(space => this.priceSpace(space));
    return results.every(result => result.pricing_status === 'AUTO_PRICE' && result.known_subtotal_cents !== null)
      ? this.formatCents(results.reduce((total, result) => total + (result.known_subtotal_cents ?? 0), 0)) : '—';
  }

  get hasApprovedMapEstimate(): boolean { return this.estimateTotalLabel !== '—'; }

  private priceSpace(space?: SpaceType | null): PricingResult {
    return this.pricingEngine.quote(this.pricingInputFor(space));
  }

  private pricingInputFor(space?: SpaceType | null, answers?: Record<'width' | 'height' | 'sloped', RefinementAnswer>): PricingInput {
    const active = space ?? this.draft.activeSpace ?? 'bedroom';
    const details = this.draft.spaceDetails[active];
    const walls = details?.walls ?? (active === this.draft.activeSpace ? this.wallMeasurements : []);
    const refinementAnswers = answers ?? details?.pricingAnswers ?? (active === this.draft.activeSpace ? this.refinementAnswers : { width: 'not-sure', height: 'not-sure', sloped: 'not-sure' });
    const unit = details?.measurementUnit ?? this.measurementUnit;
    const feetFromWall = (wall: WallMeasurement, dimension: 'width' | 'height') => {
      const canonical = dimension === 'width' ? wall.canonicalWidthFeet : wall.canonicalHeightFeet;
      if (canonical !== null && canonical !== undefined) return canonical;
      return unit === 'feet-inches'
        ? this.toTotalInches(dimension === 'width' ? wall.widthFeet : wall.heightFeet, dimension === 'width' ? wall.widthInches : wall.heightInches) / 12
        : this.unitToFeet(dimension === 'width' ? wall.widthValue : wall.heightValue, unit);
    };
    const widths = walls.map(wall => feetFromWall(wall, 'width')).filter(value => value > 0);
    const heights = walls.map(wall => feetFromWall(wall, 'height')).filter(value => value > 0);
    const scope: Scope = details?.wallCoverage === 'one-wall' ? 'single_wall' : details?.wallCoverage === 'several-walls' ? 'partial_room' : 'all_walls';
    const room = active === 'bathroom' ? (details?.bathroomType ?? 'full-bathroom') : active;
    const normalizedRoom: Record<string, string> = { 'water-closet': 'water_closet', 'powder-room': 'powder_room', 'full-bathroom': 'full_bathroom', 'primary-bathroom': 'primary_bathroom', 'dining-room': 'dining_room', 'office-study': 'office_study_den', 'living-room': 'living_family_great', 'laundry-room': 'laundry', 'mudroom': 'mudroom_drop_zone', 'pantry': 'walk_in_pantry', 'foyer-entrance': 'foyer_entrance' };
    const answer = (value: RefinementAnswer): Answer => value === 'not-sure' ? 'not_sure' : value;
    return { customer_role: 'homeowner', project_phase: 'prematch', space: normalizedRoom[room] ?? room, scope,
      full_perimeter: widths.length ? { value: widths.reduce((sum, value) => sum + value, 0), unit: 'feet_inches' } : undefined,
      selected_wall_width: widths[0] ? { value: widths[0], unit: 'feet_inches' } : undefined,
      height: heights.length ? { value: Math.max(...heights), unit: 'feet_inches' } : undefined,
      partial_wall_count: scope === 'partial_room' ? walls.length : undefined,
      selected_perimeter_ratio: scope === 'partial_room' ? undefined : 1,
      wallpaper_width: refinementAnswers.width === 'no' ? { value: 36, unit: 'inches' } : refinementAnswers.width === 'yes' ? { value: 36.01, unit: 'inches' } : undefined, slanted: answer(refinementAnswers.sloped), slanted_wall_count: (details?.slantedWallIds?.length ?? (active === this.draft.activeSpace ? this.selectedSlantedWalls.size : 0)) || undefined,
       wainscoting: details?.lowerPaneling ? 'yes' : 'no',
       primer: this.draft.requestedServices?.primer ? 'yes' : 'no' };
  }

  formatCents(cents: number): string { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100); }
  private money(cents: number | null | undefined): string | null { return cents === null || cents === undefined ? null : this.formatCents(cents); }


  private spaceLabelForEstimate(
    space: SpaceType,
    details: SpaceDetails | undefined
  ): string {
    if (space === 'bathroom' && details?.bathroomType) {
      return this.bathroomTypes.find(
        option => option.value === details.bathroomType
      )?.title ?? this.activeSpaceLabelFor(space);
    }

    return this.activeSpaceLabelFor(space);
  }


  private activeSpaceLabelFor(space: SpaceType): string {
    return this.spaces.find(item => item.value === space)?.label ?? space;
  }


  spaceIcon(space: SpaceType): string {
    return this.spaces.find(item => item.value === space)?.icon ?? 'ph-square';
  }


  /* =======================================================
     ACTIVE SPACE LABEL
  ======================================================= */

  get activeSpaceLabel():
    string {

    const activeSpace =
      this.draft
        .activeSpace;


    if (!activeSpace) {

      return '';
    }


    return (
      this.spaces
        .find(
          item =>
            item.value ===
            activeSpace
        )
        ?.label ??
      activeSpace
    );
  }


  /* =======================================================
     RESTORE CURRENT STEP VALUES
  ======================================================= */

  private restoreStepState():
    void {

    /*
     * -----------------------------------------------------
     * H03
     * -----------------------------------------------------
     */

    this.locationQuery =
      this.draft
        .locationQuery ??
      '';


    this.selectedLocation =
      this.draft
        .location ??
      null;


    this.selectedStartTime =
      this.draft
        .timeline ??
      null;


    this.locationConfirmed =
      !!this.selectedLocation;


    /*
     * -----------------------------------------------------
     * CURRENT SPACE
     * -----------------------------------------------------
     */

    const activeSpace =
      this.draft
        .activeSpace;


    if (!activeSpace) {

      this.selectedBathroomType =
        null;


      this.selectedWallCoverage =
        null;


      this.lowerPaneling =
        null;


      return;
    }


    const details =
      this.draft
        .spaceDetails[
          activeSpace
        ];


    /*
     * -----------------------------------------------------
     * H05
     * -----------------------------------------------------
     */

    if (
      activeSpace ===
      'bathroom'
    ) {

      this.selectedBathroomType =
        details
          ?.bathroomType ??
        null;

    } else {

      this.selectedBathroomType =
        null;
    }


    /*
     * -----------------------------------------------------
     * H06
     * -----------------------------------------------------
     */

    this.selectedWallCoverage =
      details
        ?.wallCoverage ??
      null;


    this.lowerPaneling =

      typeof details
        ?.lowerPaneling ===
      'boolean'

        ? details
            .lowerPaneling

        : null;
    /* -----------------------------------------------------
       H07
    ----------------------------------------------------- */

    this.measurementUnit =
      details?.measurementUnit ?? 'feet-inches';

    this.wallMeasurements =
      details?.walls?.length
        ? details.walls.map(wall => ({ ...wall }))
        : this.createInitialWalls(details?.wallCoverage);

    this.spacePhotos =
      this.photosBySpace.get(activeSpace) ?? [];

    this.refinementAnswers = details?.pricingAnswers ?? { width: 'not-sure', height: 'not-sure', sloped: 'not-sure' };
    this.selectedSlantedWalls = new Set(details?.slantedWallIds ?? []);
  }


  get activeSpaceDetailLabel(): string {

    if (this.draft.activeSpace !== 'bathroom') {
      return this.activeSpaceLabel;
    }

    const bathroomType =
      this.draft.spaceDetails.bathroom?.bathroomType;

    return this.bathroomTypes.find(
      option => option.value === bathroomType
    )?.title ?? this.activeSpaceLabel;
  }


  private createInitialWalls(
    coverage?: WallCoverage
  ): WallMeasurement[] {

    const count = coverage === 'all-walls'
      ? 4
      : coverage === 'several-walls'
        ? 2
        : 1;

    return Array.from(
      { length: count },
      () => this.createWall()
    );
  }


  private createWall(): WallMeasurement {
    return {
      id: this.createItemId('wall'),
      widthFeet: null,
      widthInches: null,
      heightFeet: null,
      heightInches: null
    };
  }


  addWall(): void {

    this.wallMeasurements = [
      ...this.wallMeasurements,
      this.createWall()
    ];

    this.saveSpaceDetailsState();
  }


  removeWall(wallId: string): void {

    if (this.wallMeasurements.length <= 1) {
      return;
    }

    this.wallMeasurements = this.wallMeasurements.filter(
      wall => wall.id !== wallId
    );

    this.saveSpaceDetailsState();
  }


  updateWallValue(
    wall: WallMeasurement,
    field: 'widthFeet' | 'widthInches' | 'heightFeet' | 'heightInches',
    value: number | string | null
  ): void {

    wall[field] = field.endsWith('Inches')
      ? this.normalizeInches(value)
      : this.normalizePositiveNumber(value);

    if (field === 'widthFeet' || field === 'widthInches') {
      this.recordWallInput(wall, 'width');
    }
    if (field === 'heightFeet' || field === 'heightInches') {
      this.recordWallInput(wall, 'height');
    }

    this.saveSpaceDetailsState();
  }


  private normalizePositiveNumber(
    value: number | string | null
  ): number | null {

    if (value === null || value === '') {
      return null;
    }

    const normalized = Math.floor(Number(value));

    return Number.isFinite(normalized)
      ? Math.max(0, normalized)
      : null;
  }


  private normalizeInches(
    value: number | string | null
  ): number | null {
    if (value === null || value === '') {
      return null;
    }
    const normalized = Number(value);
    return Number.isFinite(normalized)
      ? Math.min(11.999999, Math.max(0, normalized))
      : null;
  }


  private toTotalInches(
    feet: number | null,
    inches: number | null
  ): number {
    return (feet ?? 0) * 12 + (inches ?? 0);
  }


  onPhotosSelected(event: Event): void {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? [])
      .filter(file => file.type.startsWith('image/'));

    for (const file of files) {
      this.spacePhotos.push({
        id: this.createItemId('photo'),
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        file
      });
    }

    input.value = '';

    if (files.length > 0) {
      this.saveSpaceDetailsState();
    }
  }


  removePhoto(photo: SpacePhoto): void {

    if (this.enlargedPhoto?.id === photo.id) {
      this.enlargedPhoto = null;
    }

    URL.revokeObjectURL(photo.previewUrl);

    this.spacePhotos = this.spacePhotos.filter(
      item => item.id !== photo.id
    );

    this.setCurrentSpacePhotos();
    this.saveSpaceDetailsState(false);
  }


  viewPhoto(photo: SpacePhoto): void {
    this.enlargedPhoto = photo;
  }


  closePhotoPreview(): void {
    this.enlargedPhoto = null;
  }


  @HostListener('document:keydown', ['$event'])
  onPhotoModalKeydown(event: KeyboardEvent): void {

    if (event.key === 'Escape' && this.enlargedPhoto) {
      this.closePhotoPreview();
    }
  }


  get hasSufficientMeasurements(): boolean {

    return this.wallMeasurements.length > 0 &&
      this.wallMeasurements.every(wall =>
        this.wallValueInFeet(wall, 'width') !== null &&
        this.wallValueInFeet(wall, 'height') !== null
      );
  }


  get hasPhotos(): boolean {

    const activeSpace = this.draft.activeSpace;

    return this.spacePhotos.length > 0 ||
      !!(
        activeSpace &&
        this.draft.spaceDetails[activeSpace]?.hasPhotos
      );
  }


  get canContinueFromSpaceDetails(): boolean {
    return this.hasSufficientMeasurements || this.hasPhotos;
  }


  private saveSpaceDetailsState(
    preserveStoredPhotos = true
  ): void {

    const activeSpace = this.draft.activeSpace;

    if (!activeSpace) {
      return;
    }

    const existing = this.draft.spaceDetails[activeSpace] ?? {
      type: activeSpace
    };

    this.setCurrentSpacePhotos();

    this.draft.spaceDetails[activeSpace] = {
      ...existing,
      measurementUnit: this.measurementUnit,
      walls: this.wallMeasurements.map(wall => ({ ...wall })),
      hasPhotos: this.spacePhotos.length > 0 ||
        (preserveStoredPhotos && existing.hasPhotos === true),
      pricingAnswers: { ...this.refinementAnswers },
      slantedWallIds: [...this.selectedSlantedWalls],
      completed: true
    };

    this.saveDraft();
  }


  private setCurrentSpacePhotos(): void {

    const activeSpace = this.draft.activeSpace;

    if (activeSpace) {
      this.photosBySpace.set(activeSpace, this.spacePhotos);
    }
  }


  private createItemId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  }


  continueFromSpaceDetails(): void {

    if (!this.canContinueFromSpaceDetails) {
      return;
    }

    this.saveSpaceDetailsState();

    if (this.hasSufficientMeasurements) {
      // H11 is currently a presentation-only mock. No price is calculated or
      // persisted; a future provider can replace this fixture by model shape.
      this.goTo('base-estimate');
      return;
    }

    this.goTo('photos-review');
  }


  requestOnsiteEstimate(): void {

    this.saveSpaceDetailsState();

    this.goTo('onsite-estimate');
  }


  private revokeSpacePhotos(space: SpaceType): void {

    for (const photo of this.photosBySpace.get(space) ?? []) {
      URL.revokeObjectURL(photo.previewUrl);
    }

    this.photosBySpace.delete(space);

    if (this.draft.activeSpace === space) {
      this.spacePhotos = [];
      this.enlargedPhoto = null;
    }
  }
  /* =======================================================
     SAVE DRAFT
  ======================================================= */

  private saveDraft():
    void {

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {

      return;
    }


    this.draft.updatedAt =
      new Date()
        .toISOString();


    sessionStorage.setItem(
      'installerRequestDraft',

      JSON.stringify(
        this.draft
      )
    );
  }


  /* =======================================================
     RESTORE DRAFT
  ======================================================= */

  private restoreDraft():
    void {

    if (
      !isPlatformBrowser(
        this.platformId
      )
    ) {

      return;
    }


    try {

      const stored =
        sessionStorage.getItem(
          'installerRequestDraft'
        );


      if (!stored) {

        return;
      }


      const parsed =
        JSON.parse(
          stored
        ) as HomeownerDraft;


      /*
       * No mezclamos estados de otros
       * tipos de usuario.
       */
      if (
        parsed.audience !==
        'homeowner'
      ) {

        return;
      }


      /*
       * También admite el draft que
       * teníamos antes de crear este
       * HomeownerWizard.
       */
      this.draft = {

        audience:
          'homeowner',

        locationQuery:
          parsed.locationQuery ??
          '',

        location:
          parsed.location,

        timeline:
          parsed.timeline,

        spaces:
          Array.isArray(
            parsed.spaces
          )
            ? parsed.spaces
            : [],

        activeSpace:
          parsed.activeSpace ??
          null,

        returnStep:
          parsed.returnStep ??
          null,

        spaceDetails:
          parsed.spaceDetails ??
          {},

        updatedAt:
          parsed.updatedAt,
        remoteRequestId: parsed.remoteRequestId
        ,requestedServices: parsed.requestedServices ?? { primer: false, ceiling: false }
      };


      this.restoreStepState();


    } catch (error) {

      console.error(
        'Could not restore homeowner wizard:',
        error
      );
    }
  }


  /* =======================================================
     DESTROY GOOGLE AUTOCOMPLETE
  ======================================================= */

  private destroyAutocomplete():
    void {

    if (
      this.autocompleteListener &&
      typeof google !==
        'undefined' &&
      google.maps?.event
    ) {

      google.maps.event
        .removeListener(
          this.autocompleteListener
        );
    }


    this.autocompleteListener =
      null;


    this.autocomplete =
      null;


    this.autocompleteInitialized =
      false;
  }


  /* =======================================================
     DESTROY
  ======================================================= */

  ngOnDestroy(): void {

    if (this.stopRequestSubscription) void this.stopRequestSubscription();

    this.destroyAutocomplete();

    for (const space of this.photosBySpace.keys()) {
      this.revokeSpacePhotos(space);
    }
  }
}
