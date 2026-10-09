import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PricingEngine } from '../../../pricing/pricing.engine';
import { PricingResult } from '../../../pricing/pricing.types';

type ProjectUse = 'residential' | 'commercial';
type Unit = 'feet_inches' | 'inches' | 'centimeters' | 'meters' | 'millimeters';
type Step = 'project' | 'details' | 'estimate' | 'commercial-request';

interface DesignerDraft {
  customerRole: 'interior_designer';
  projectUse: ProjectUse;
  projectName: string;
  clientReference: string;
  zipCode: string;
  timeframe: string;
  spaces: string[];
  productLink: string;
  measurement: { value: number | null; unit: Unit; height: number | null };
}

@Component({
  selector: 'app-interior-designer-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interior-designer-wizard.html',
  styleUrl: './interior-designer-wizard.scss'
})
export class InteriorDesignerWizard {
  readonly units: Array<{ value: Unit; label: string }> = [
    { value: 'feet_inches', label: 'Feet & inches' }, { value: 'inches', label: 'Inches' },
    { value: 'centimeters', label: 'Centimeters' }, { value: 'meters', label: 'Meters' }, { value: 'millimeters', label: 'Millimeters' }
  ];
  readonly availableSpaces = ['Bedroom', 'Powder Room', 'Living room', 'Office'];
  readonly engine = new PricingEngine();
  step: Step = 'project';
  draft: DesignerDraft = {
    customerRole: 'interior_designer', projectUse: 'residential', projectName: '', clientReference: '', zipCode: '', timeframe: '',
    spaces: [], productLink: '', measurement: { value: null, unit: 'feet_inches', height: null }
  };

  constructor(private readonly router: Router, private readonly route: ActivatedRoute, @Inject(PLATFORM_ID) private readonly platformId: object) {
    this.restore();
    this.route.paramMap.subscribe(params => {
      const requested = params.get('step') as Step | null;
      if (requested && ['project', 'details', 'estimate', 'commercial-request'].includes(requested)) this.step = requested;
    });
  }

  get residentialResult(): PricingResult | null {
    if (this.draft.projectUse !== 'residential' || !this.draft.measurement.value) return null;
    return this.engine.quote({ customer_role: 'designer', project_phase: 'prematch', space: 'bedroom', scope: 'all_walls',
      full_perimeter: { value: this.draft.measurement.value, unit: this.draft.measurement.unit },
      height: this.draft.measurement.height ? { value: this.draft.measurement.height, unit: this.draft.measurement.unit } : undefined,
      wallpaper_width: undefined, slanted: 'not_sure' });
  }

  get canProceedProject(): boolean { return !!this.draft.projectName && !!this.draft.zipCode && !!this.draft.timeframe; }
  get canProceedDetails(): boolean { return this.draft.spaces.length > 0; }
  get estimateLabel(): string {
    const result = this.residentialResult;
    if (!result || result.pricing_status !== 'AUTO_PRICE' || result.policy_blocks.length) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((result.known_subtotal_cents ?? 0) / 100);
  }
  get hasP04(): boolean { return !!this.residentialResult?.policy_blocks.some(block => block.policy_block_id === 'P04'); }

  toggleSpace(space: string): void {
    this.draft.spaces = this.draft.spaces.includes(space) ? this.draft.spaces.filter(item => item !== space) : [...this.draft.spaces, space];
    this.save();
  }
  next(): void {
    if (this.step === 'project' && this.canProceedProject) this.go('details');
    else if (this.step === 'details' && this.canProceedDetails) this.go(this.draft.projectUse === 'residential' ? 'estimate' : 'commercial-request');
  }
  back(): void {
    if (this.step === 'project') void this.router.navigate(['/installer']);
    else if (this.step === 'details') this.go('project');
    else this.go('details');
  }
  saveAndContinue(): void { this.save(); }
  private go(step: Step): void { this.save(); void this.router.navigate(['/installer/interior-designer', step]); }
  save(): void { if (isPlatformBrowser(this.platformId)) sessionStorage.setItem('interiorDesignerRequestDraft', JSON.stringify(this.draft)); }
  private restore(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const parsed = JSON.parse(sessionStorage.getItem('interiorDesignerRequestDraft') ?? 'null') as Partial<DesignerDraft> | null;
      if (parsed?.customerRole === 'interior_designer') this.draft = { ...this.draft, ...parsed, measurement: { ...this.draft.measurement, ...parsed.measurement } };
    } catch { /* Invalid local draft is safely ignored. */ }
  }
}
