import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

type Step = 'project' | 'scope' | 'access' | 'review';
type ProjectUse = 'residential' | 'commercial';
type Unit = 'feet_inches' | 'inches' | 'centimeters' | 'meters';
type Access = 'standard_ladder' | 'scaffold' | 'scissor_lift' | 'not_sure';

interface BuilderContractorDraft {
  customerRole: 'builder_contractor';
  projectName: string;
  company: string;
  zipCode: string;
  location: string;
  projectUse: ProjectUse;
  timeframe: string;
  areasIncluded: string;
  wallcoveringArea: number | null;
  areaUnknown: boolean;
  areaUnit: 'sq_ft' | 'sq_m';
  plans: string[];
  wallpaperProductLink: string;
  units: Unit;
  typicalHeightFeet: number | null;
  typicalHeightInches: number | null;
  typicalHeightUnknown: boolean;
  highestWallFeet: number | null;
  highestWallInches: number | null;
  highestWallUnknown: boolean;
  access: Access | null;
  workHours: string;
}

@Component({
  selector: 'app-builder-contractor-wizard', standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './builder-contractor-wizard.html', styleUrl: './builder-contractor-wizard.scss'
})
export class BuilderContractorWizard {
  readonly steps: Step[] = ['project', 'scope', 'access'];
  readonly accessOptions: Array<{ value: Access; label: string }> = [
    { value: 'standard_ladder', label: 'Standard ladder' }, { value: 'scaffold', label: 'Scaffold' },
    { value: 'scissor_lift', label: 'Scissor lift' }, { value: 'not_sure', label: 'Not sure' }
  ];
  step: Step = 'project';
  draft: BuilderContractorDraft = this.emptyDraft();

  constructor(private readonly router: Router, private readonly route: ActivatedRoute, @Inject(PLATFORM_ID) private readonly platformId: object) {
    this.restore();
    this.route.paramMap.subscribe(params => {
      const step = params.get('step') as Step | null;
      if (step && ['project', 'scope', 'access', 'review'].includes(step)) this.step = step;
    });
  }

  get canProceed(): boolean {
    if (this.step === 'project') return !!this.draft.projectName && !!this.draft.company && !!this.draft.zipCode && !!this.draft.location && !!this.draft.timeframe;
    if (this.step === 'scope') return !!this.draft.areasIncluded && (this.draft.areaUnknown || !!this.draft.wallcoveringArea);
    if (this.step === 'access') return !!this.draft.access;
    return true;
  }
  get areaLabel(): string { return this.draft.areaUnknown ? 'Pending confirmation' : this.draft.wallcoveringArea ? `${this.draft.wallcoveringArea} ${this.draft.areaUnit === 'sq_ft' ? 'sq ft' : 'sq m'}` : 'Pending confirmation'; }
  get heightsLabel(): string { return this.draft.typicalHeightUnknown && this.draft.highestWallUnknown ? 'Pending confirmation' : 'Provided'; }
  get accessLabel(): string { return this.accessOptions.find(option => option.value === this.draft.access)?.label ?? 'To be confirmed'; }

  next(): void {
    if (!this.canProceed) return;
    if (this.step === 'project') this.go('scope');
    else if (this.step === 'scope') this.go('access');
    else if (this.step === 'access') this.go('review');
  }
  back(): void {
    if (this.step === 'project') { void this.router.navigate(['/installer']); return; }
    this.go(this.step === 'scope' ? 'project' : this.step === 'access' ? 'scope' : 'access');
  }
  editScope(): void { this.go('scope'); }
  saveAndContinue(): void { this.save(); }
  addPlans(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    this.draft.plans = [...this.draft.plans, ...Array.from(files).map(file => file.name)]; this.save();
  }
  removePlan(plan: string): void { this.draft.plans = this.draft.plans.filter(item => item !== plan); this.save(); }
  private go(step: Step): void { this.save(); void this.router.navigate(['/installer/contractor', step]); }
  save(): void { if (isPlatformBrowser(this.platformId)) sessionStorage.setItem('builderContractorRequestDraft', JSON.stringify(this.draft)); }
  private restore(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    try { const saved = JSON.parse(sessionStorage.getItem('builderContractorRequestDraft') ?? 'null') as Partial<BuilderContractorDraft> | null;
      if (saved?.customerRole === 'builder_contractor') this.draft = { ...this.draft, ...saved };
    } catch { /* Invalid browser-only draft is safely ignored. */ }
  }
  private emptyDraft(): BuilderContractorDraft { return { customerRole: 'builder_contractor', projectName: '', company: '', zipCode: '', location: '', projectUse: 'residential', timeframe: '', areasIncluded: '', wallcoveringArea: null, areaUnknown: false, areaUnit: 'sq_ft', plans: [], wallpaperProductLink: '', units: 'feet_inches', typicalHeightFeet: null, typicalHeightInches: null, typicalHeightUnknown: false, highestWallFeet: null, highestWallInches: null, highestWallUnknown: false, access: null, workHours: '' }; }
}
