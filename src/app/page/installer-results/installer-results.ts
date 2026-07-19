import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import PocketBase, { RecordModel } from 'pocketbase';

declare const google: any;

interface InstallerResult {
  id: string;
  name: string;
  companyName: string;
  avatar: string;
  rating: number;
  reviews: number;
  city: string;
  stateCode: string;
  lat: number;
  lng: number;
  distanceMiles: number;
  distanceLabel: string;
  verified: boolean;
  responseTime: string;
  specialties: string[];
  selected: boolean;
}

@Component({
  selector: 'app-installer-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './installer-results.html',
  styleUrl: './installer-results.scss',
})
export class InstallerResults
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('mapContainer')
  mapContainer?: ElementRef<HTMLDivElement>;

  private pb = new PocketBase('https://db.buckapi.site:8055');

  /*
   * Cambia este nombre únicamente si tu colección
   * de instaladores se llama diferente.
   */
  private readonly professionalsCollection = 'professionals';

  requestId = '';
  request: RecordModel | null = null;

  installers: InstallerResult[] = [];
  filteredInstallers: InstallerResult[] = [];

  selectedInstallerIds: string[] = [];

  loading = true;
  loadingInstallers = false;
  savingSelection = false;

  error = '';
  installerError = '';

  mapReady = false;

  private map: any = null;
  private infoWindow: any = null;
  private projectMarker: any = null;
  private installerMarkers = new Map<string, any>();

  maximumDistanceMiles = 50;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  async ngOnInit(): Promise<void> {
    this.requestId =
      this.route.snapshot.paramMap.get('requestId') || '';

    if (!this.requestId) {
      this.error = 'The search identifier was not found.';
      this.loading = false;
      return;
    }

    await this.loadRequest();
  }

  ngAfterViewInit(): void {
    this.mapReady = true;

    if (this.request) {
      setTimeout(() => this.initializeMap(), 100);
    }
  }

  ngOnDestroy(): void {
    this.installerMarkers.clear();
    this.map = null;
    this.infoWindow = null;
  }

  private async loadRequest(): Promise<void> {
    try {
      this.loading = true;
      this.error = '';

      this.request = await this.pb
        .collection('requests')
        .getOne(this.requestId);

      await this.loadNearbyInstallers();

      if (this.mapReady) {
        setTimeout(() => this.initializeMap(), 100);
      }
    } catch (error: any) {
      console.error('Error loading request:', error);
      console.error('PocketBase data:', error?.data);

      this.error = 'We could not load your installer search.';
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

 /*  private async loadNearbyInstallers(): Promise<void> {
    if (!this.request) return;

    try {
      this.loadingInstallers = true;
      this.installerError = '';

     
      const records = await this.pb
        .collection(this.professionalsCollection)
        .getFullList({
          filter: 'active=true',
          sort: '-rating',
          requestKey: null,
        });

      const projectLat = Number(this.request['lat'] || 0);
      const projectLng = Number(this.request['lng'] || 0);

      this.installers = records
        .map(record =>
          this.mapProfessionalRecord(
            record,
            projectLat,
            projectLng,
          ),
        )
        .filter(installer =>
          Number.isFinite(installer.distanceMiles),
        )
        .sort(
          (first, second) =>
            first.distanceMiles - second.distanceMiles,
        );

      this.applyDistanceFilter();
    } catch (error: any) {
      console.error('Error loading installers:', error);
      console.error('PocketBase data:', error?.data);

      this.installerError =
        'We could not load installers near this location.';

      this.installers = [];
      this.filteredInstallers = [];
    } finally {
      this.loadingInstallers = false;
      this.cdr.detectChanges();
    }
  } */
private async loadNearbyInstallers(): Promise<void> {
  if (!this.request) return;

  this.loadingInstallers = true;
  this.installerError = '';

  const projectLat = Number(this.request['lat'] || 0);
  const projectLng = Number(this.request['lng'] || 0);

  this.installers = this.createMockInstallers(
    projectLat,
    projectLng
  );

  this.applyDistanceFilter();

  this.loadingInstallers = false;
  this.cdr.detectChanges();
}
private createMockInstallers(
  projectLat: number,
  projectLng: number
): InstallerResult[] {
  const mockData = [
    {
      id: 'demo-installer-1',
      name: 'Michael Carter',
      companyName: 'Carter Wallcovering Studio',
      rating: 4.9,
      reviews: 128,
      responseTime: 'Usually responds in 2 hours',
      specialties: [
        'Residential',
        'Accent Walls',
        'Murals'
      ],
      avatar: 'assets/img/testimonial/01.png',
      latOffset: 0.018,
      lngOffset: -0.022,
    },
    {
      id: 'demo-installer-2',
      name: 'Sarah Johnson',
      companyName: 'Premium Wallpaper Pros',
      rating: 4.8,
      reviews: 94,
      responseTime: 'Usually responds today',
      specialties: [
        'Commercial',
        'Offices',
        'Large Spaces'
      ],
      avatar: 'assets/img/testimonial/02.png',
      latOffset: -0.026,
      lngOffset: 0.019,
    },
    {
      id: 'demo-installer-3',
      name: 'David Miller',
      companyName: 'Miller Install Co.',
      rating: 4.7,
      reviews: 76,
      responseTime: 'Usually responds within 24 hours',
      specialties: [
        'Residential',
        'Bathrooms',
        'Dining Rooms'
      ],
      avatar: 'assets/img/testimonial/03.png',
      latOffset: 0.034,
      lngOffset: 0.027,
    },
    {
      id: 'demo-installer-4',
      name: 'Emily Thompson',
      companyName: 'Elegant Walls LLC',
      rating: 4.9,
      reviews: 63,
      responseTime: 'Usually responds in 3 hours',
      specialties: [
        'Murals',
        'Bedrooms',
        'Premium Wallpaper'
      ],
      avatar: 'assets/img/testimonial/04.png',
      latOffset: -0.014,
      lngOffset: -0.037,
    }
  ];

  return mockData.map(item => {
    const lat = projectLat + item.latOffset;
    const lng = projectLng + item.lngOffset;

    const distanceMiles = this.calculateDistanceMiles(
      projectLat,
      projectLng,
      lat,
      lng
    );

    return {
      id: item.id,
      name: item.name,
      companyName: item.companyName,
      avatar: item.avatar,
      rating: item.rating,
      reviews: item.reviews,
      city: this.request?.['city'] || 'Local area',
      stateCode: this.request?.['state_code'] || '',
      lat,
      lng,
      distanceMiles,
      distanceLabel: `${distanceMiles.toFixed(1)} mi`,
      verified: true,
      responseTime: item.responseTime,
      specialties: item.specialties,
      selected: false,
    };
  });
}
  private mapProfessionalRecord(
    record: RecordModel,
    projectLat: number,
    projectLng: number,
  ): InstallerResult {
    const installerLat = Number(record['lat'] || 0);
    const installerLng = Number(record['lng'] || 0);

    const distanceMiles = this.calculateDistanceMiles(
      projectLat,
      projectLng,
      installerLat,
      installerLng,
    );

    const avatarFilename =
      record['avatar'] ||
      record['profile_image'] ||
      record['image'] ||
      '';

    const avatar = avatarFilename
      ? this.pb.files.getURL(record, avatarFilename)
      : 'assets/img/testimonial/01.png';

    const specialties = Array.isArray(record['specialties'])
      ? record['specialties']
      : this.normalizeSpecialties(
          record['specialties'] ||
          record['services'] ||
          record['project_types'],
        );

    return {
      id: record.id,

      name:
        record['name'] ||
        record['full_name'] ||
        record['username'] ||
        'Wallpaper Installer',

      companyName:
        record['company_name'] ||
        record['business_name'] ||
        record['company'] ||
        'Independent Installer',

      avatar,

      rating: Number(record['rating'] || 0),

      reviews: Number(
        record['reviews_count'] ||
        record['total_reviews'] ||
        0,
      ),

      city: record['city'] || '',

      stateCode:
        record['state_code'] ||
        record['state'] ||
        '',

      lat: installerLat,
      lng: installerLng,

      distanceMiles,

      distanceLabel: Number.isFinite(distanceMiles)
        ? `${distanceMiles.toFixed(1)} mi`
        : 'Distance unavailable',

      verified:
        record['verified'] === true ||
        record['is_verified'] === true ||
        record['status'] === 'approved',

      responseTime:
        record['response_time'] ||
        'Usually responds within 24 hours',

      specialties,

      selected: false,
    };
  }

  private normalizeSpecialties(value: unknown): string[] {
    if (!value) {
      return ['Wallpaper Installation'];
    }

    if (Array.isArray(value)) {
      return value.map(item => String(item));
    }

    return String(value)
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  applyDistanceFilter(): void {
    this.filteredInstallers = this.installers.filter(
      installer =>
        installer.distanceMiles <=
        this.maximumDistanceMiles,
    );

    if (!this.filteredInstallers.length) {
      /*
       * Si no hay instaladores dentro del radio,
       * mostramos los 10 más cercanos.
       */
      this.filteredInstallers = this.installers.slice(0, 10);
    }

    if (this.map) {
      this.renderInstallerMarkers();
    }
  }

  onDistanceChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.maximumDistanceMiles =
      Number(select.value) || 50;

    this.applyDistanceFilter();
  }

  selectInstaller(installer: InstallerResult): void {
    installer.selected = !installer.selected;

    if (installer.selected) {
      if (
        !this.selectedInstallerIds.includes(installer.id)
      ) {
        this.selectedInstallerIds = [
          ...this.selectedInstallerIds,
          installer.id,
        ];
      }
    } else {
      this.selectedInstallerIds =
        this.selectedInstallerIds.filter(
          id => id !== installer.id,
        );
    }

    const marker =
      this.installerMarkers.get(installer.id);

    if (marker && this.map) {
      this.map.panTo({
        lat: installer.lat,
        lng: installer.lng,
      });

      this.map.setZoom(13);
      this.openInstallerInfo(installer, marker);
    }
  }

  focusInstaller(installer: InstallerResult): void {
    const marker =
      this.installerMarkers.get(installer.id);

    if (!marker || !this.map) return;

    this.map.panTo({
      lat: installer.lat,
      lng: installer.lng,
    });

    this.map.setZoom(13);
    this.openInstallerInfo(installer, marker);
  }

  private initializeMap(): void {
    if (!this.mapContainer?.nativeElement) return;
    if (!this.request) return;

    if (
      typeof google === 'undefined' ||
      !google.maps
    ) {
      this.installerError =
        'Google Maps could not be loaded.';
      this.cdr.detectChanges();
      return;
    }

    const projectLat = Number(
      this.request['lat'] || 0,
    );

    const projectLng = Number(
      this.request['lng'] || 0,
    );

    if (!projectLat || !projectLng) {
      this.installerError =
        'The project location does not have valid coordinates.';
      return;
    }

    const projectPosition = {
      lat: projectLat,
      lng: projectLng,
    };

    this.map = new google.maps.Map(
      this.mapContainer.nativeElement,
      {
        center: projectPosition,
        zoom: 10,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        clickableIcons: false,
      },
    );

    this.infoWindow =
      new google.maps.InfoWindow();

    this.projectMarker =
      new google.maps.Marker({
        position: projectPosition,
        map: this.map,
        title: 'Project location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: '#1d1d1d',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 4,
        },
      });

    this.projectMarker.addListener(
      'click',
      () => {
        this.infoWindow.setContent(`
          <div style="padding:6px 4px;min-width:190px">
            <strong style="display:block;margin-bottom:5px">
              Project location
            </strong>

            <span>
              ${
                this.request?.['formatted_address'] ||
                this.request?.['city'] ||
                ''
              }
            </span>
          </div>
        `);

        this.infoWindow.open(
          this.map,
          this.projectMarker,
        );
      },
    );

    this.renderInstallerMarkers();
  }

  private renderInstallerMarkers(): void {
    if (!this.map) return;

    this.installerMarkers.forEach(marker =>
      marker.setMap(null),
    );

    this.installerMarkers.clear();

    const bounds =
      new google.maps.LatLngBounds();

    if (this.request) {
      bounds.extend({
        lat: Number(this.request['lat']),
        lng: Number(this.request['lng']),
      });
    }

    for (const installer of this.filteredInstallers) {
      if (!installer.lat || !installer.lng) continue;

      const marker = new google.maps.Marker({
        position: {
          lat: installer.lat,
          lng: installer.lng,
        },
        map: this.map,
        title: installer.name,
        label: {
          text: 'W',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: '700',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor: '#c77b00',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });

      marker.addListener('click', () => {
        this.ngZone.run(() => {
          this.focusInstaller(installer);
        });
      });

      this.installerMarkers.set(
        installer.id,
        marker,
      );

      bounds.extend({
        lat: installer.lat,
        lng: installer.lng,
      });
    }

    if (this.filteredInstallers.length) {
      this.map.fitBounds(bounds);

      google.maps.event.addListenerOnce(
        this.map,
        'bounds_changed',
        () => {
          if (this.map.getZoom() > 13) {
            this.map.setZoom(13);
          }
        },
      );
    }
  }

  private openInstallerInfo(
    installer: InstallerResult,
    marker: any,
  ): void {
    if (!this.infoWindow) return;

    this.infoWindow.setContent(`
      <div style="min-width:220px;padding:5px">
        <strong style="font-size:15px">
          ${installer.name}
        </strong>

        <div style="margin-top:4px;color:#666">
          ${installer.companyName}
        </div>

        <div style="margin-top:7px">
          ⭐ ${installer.rating.toFixed(1)}
          · ${installer.distanceLabel}
        </div>
      </div>
    `);

    this.infoWindow.open(this.map, marker);
  }

  async continueWithInstallers(): Promise<void> {
    if (!this.request) return;

    if (!this.selectedInstallerIds.length) {
      this.installerError =
        'Please select at least one installer.';
      return;
    }

    if (this.savingSelection) return;

    try {
      this.savingSelection = true;
      this.installerError = '';

      /*
       * interested_professionals admite múltiples relaciones.
       * selected_professional se asignará después,
       * cuando el cliente elija definitivamente uno.
       */
      await this.pb
        .collection('requests')
        .update(this.request.id, {
          interested_professionals:
            this.selectedInstallerIds,

          status: 'sent',

          max_leads:
            this.selectedInstallerIds.length,
        });

      /*
       * Aquí decidimos a qué flujo continúa.
       * La búsqueda del Home no se mezcla con el selector /installer.
       */
      const projectType =
        this.request['project_type'];

      if (projectType === 'commercial') {
        await this.router.navigate([
          '/installer/commercial',
        ], {
          queryParams: {
            requestId: this.request.id,
          },
        });

        return;
      }

      await this.router.navigate(
        ['/installer/residential'],
        {
          queryParams: {
            requestId: this.request.id,
          },
        },
      );
    } catch (error: any) {
      console.error(
        'Error saving installers:',
        error,
      );

      console.error(
        'PocketBase data:',
        error?.data,
      );

      this.installerError =
        'We could not save your installer selection.';
    } finally {
      this.savingSelection = false;
      this.cdr.detectChanges();
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  private calculateDistanceMiles(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    if (
      !lat1 ||
      !lng1 ||
      !lat2 ||
      !lng2
    ) {
      return Number.POSITIVE_INFINITY;
    }

    const earthRadiusMiles = 3958.8;

    const latitudeDifference =
      this.toRadians(lat2 - lat1);

    const longitudeDifference =
      this.toRadians(lng2 - lng1);

    const firstLatitude =
      this.toRadians(lat1);

    const secondLatitude =
      this.toRadians(lat2);

    const a =
      Math.sin(latitudeDifference / 2) ** 2 +
      Math.cos(firstLatitude) *
        Math.cos(secondLatitude) *
        Math.sin(longitudeDifference / 2) ** 2;

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a),
      );

    return earthRadiusMiles * c;
  }

  private toRadians(value: number): number {
    return value * (Math.PI / 180);
  }
}