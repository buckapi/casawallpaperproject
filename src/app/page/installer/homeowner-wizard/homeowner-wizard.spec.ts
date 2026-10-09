import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';

import { HomeownerWizard } from './homeowner-wizard';

describe('HomeownerWizard', () => {
  let component: HomeownerWizard;
  let fixture: ComponentFixture<HomeownerWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeownerWizard],
      providers: [
        provideRouter([
          {
            path: 'installer/homeowner/:step',
            component: HomeownerWizard,
          },
        ]),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeownerWizard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('navigates from H73 to H74 and back without changing the draft', async () => {
    const router = TestBed.inject(Router);
    component.draft.spaces = ['bedroom', 'bathroom'];
    component.refinementAnswers.width = 'no';
    component.refinementAnswers.sloped = 'no';
    component.draft.spaceDetails = {
      bedroom: { type: 'bedroom', walls: [], completed: false },
      bathroom: {
        type: 'bathroom',
        bathroomType: 'powder-room',
        walls: [],
        completed: false
      }
    };

    component.viewProjectEstimate();
    await router.navigate(['/installer/homeowner/estimate']);
    expect(router.url).toContain('/installer/homeowner/estimate');
    expect(component.draft.spaces).toEqual(['bedroom', 'bathroom']);

    component.back();
    await router.navigate(['/installer/homeowner/review']);
    expect(router.url).toContain('/installer/homeowner/review');
  });

  it('combines deterministic H74 space results without mock amounts', () => {
    component.draft.spaces = ['bedroom', 'bathroom'];
    component.refinementAnswers.width = 'no';
    component.refinementAnswers.sloped = 'no';
    component.draft.spaceDetails = {
      bedroom: { type: 'bedroom', wallCoverage: 'all-walls', pricingAnswers: { width: 'no', height: 'no', sloped: 'no' }, walls: [{ id: 'bedroom-wall', widthFeet: 44, widthInches: 0, heightFeet: 10, heightInches: 0 }], completed: false },
      bathroom: {
        type: 'bathroom',
        bathroomType: 'powder-room',
        wallCoverage: 'all-walls',
        pricingAnswers: { width: 'no', height: 'no', sloped: 'no' },
        walls: [{ id: 'bathroom-wall', widthFeet: 19, widthInches: 0, heightFeet: 9, heightInches: 0 }],
        completed: false
      }
    };

    expect(component.estimateItems.map(item => item.amount)).toEqual([
      '$780.00',
      '$450.00'
    ]);
    expect(component.estimateTotalLabel).toBe('$1,230.00');
    expect(component.draft.spaceDetails.bedroom?.completed).toBe(false);
    expect(component.draft.spaceDetails.bathroom?.completed).toBe(false);
  });

  it('does not invent a price for unsupported space combinations', () => {
    component.draft.spaces = ['living-room'];
    component.draft.spaceDetails = {
      'living-room': { type: 'living-room', walls: [], completed: false }
    };

    expect(component.estimateItems[0]?.amount).toBe('—');
    expect(component.estimateTotalLabel).toBe('—');
  });

  it('advances H07 to H11 with sufficient measurements', () => {
    let target: string | undefined;
    component.draft.activeSpace = 'bedroom';
    component.draft.spaceDetails = {
      bedroom: { type: 'bedroom', completed: false }
    };
    component.wallMeasurements = [{
      id: 'wall-1',
      widthFeet: 12,
      widthInches: 0,
      heightFeet: 8,
      heightInches: 0
    }];
    component.goTo = ((step: string) => {
      target = step;
    }) as typeof component.goTo;

    component.continueFromSpaceDetails();

    expect(target).toBe('base-estimate');
    expect(component.activePricingResult.pricebook_version).toBe('handoff-2026-09-24-v1');
    expect(component.draft.spaceDetails.bedroom?.completed).toBe(true);
  });

  it('keeps H11 presentation values out of the persisted draft', () => {
    component.draft.activeSpace = 'bedroom';
    component.draft.spaceDetails = {
      bedroom: { type: 'bedroom', completed: false }
    };
    component.wallMeasurements = [{
      id: 'wall-1',
      widthFeet: 12,
      widthInches: 0,
      heightFeet: 8,
      heightInches: 0
    }];
    component.goTo = (() => undefined) as typeof component.goTo;

    component.continueFromSpaceDetails();

    const persisted = sessionStorage.getItem('installerRequestDraft');
    expect(persisted).toBeTruthy();
    expect(JSON.parse(persisted ?? '{}').estimate).toBeUndefined();
  });

  it('returns from H11 to H07 without changing measurements', () => {
    let target: string | undefined;
    component.currentStep = 'base-estimate';
    component.wallMeasurements = [{
      id: 'wall-1',
      widthFeet: 12,
      widthInches: 0,
      heightFeet: 8,
      heightInches: 0
    }];
    component.goTo = ((step: string) => {
      target = step;
    }) as typeof component.goTo;

    component.back();

    expect(target).toBe('space-details');
    expect(component.wallMeasurements[0]?.widthFeet).toBe(12);
  });

  it('routes the applicable sloped-wall refinement through H37', () => {
    let target: string | undefined;
    component.goTo = ((step: string) => { target = step; }) as typeof component.goTo;

    component.selectRefinement('sloped', 'yes');

    expect(target).toBe('slanted-walls');
    expect(component.refinementAnswers.sloped).toBe('yes');
  });

  it('does not expose a bathroom slanted-wall refinement or H37 route', () => {
    component.draft.activeSpace = 'bathroom';
    component.draft.spaceDetails = {
      bathroom: { type: 'bathroom', bathroomType: 'powder-room', wallCoverage: 'all-walls', walls: [{ id: 'bath', widthFeet: 19, widthInches: 0, heightFeet: 8, heightInches: 0 }] }
    };
    let target: string | undefined;
    component.goTo = ((step: string) => { target = step; }) as typeof component.goTo;

    expect(component.hasRefinementQuestion('sloped')).toBe(false);
    component.selectRefinement('sloped', 'yes');
    expect(target).toBeUndefined();
  });

  it('keeps the native H07 selector and all five units after draft restore', async () => {
    sessionStorage.clear();
    component.draft.activeSpace = 'bedroom';
    component.measurementUnit = 'meters';
    component.wallMeasurements = [{ id: 'restore-unit', widthFeet: null, widthInches: null, heightFeet: null, heightInches: null, widthValue: 4, heightValue: 2.4 }];
    (component as any).saveSpaceDetailsState();

    const restoredFixture = TestBed.createComponent(HomeownerWizard);
    const restored = restoredFixture.componentInstance;
    await restoredFixture.whenStable();
    restored.draft.activeSpace = 'bedroom';
    (restored as any).restoreStepState();
    expect(restored.measurementUnit).toBe('meters');
    expect(restored.measurementUnits.map(unit => unit.label)).toEqual(['Feet & inches', 'Inches', 'Centimeters', 'Meters', 'Millimeters']);
    sessionStorage.clear();
  });

  it('uses a versioned PricingResult for H13 instead of the mock fixture', () => {
    component.draft.activeSpace = 'bedroom';
    component.draft.spaceDetails = { bedroom: { type: 'bedroom', wallCoverage: 'all-walls', walls: [{ id: 'wall-1', widthFeet: 22, widthInches: 0, heightFeet: 10, heightInches: 0 }] } };
    expect(component.activePricingResult.line_items.some(item => item.rule_id === 'base')).toBe(true);
    expect(component.activePricingResult.pricing_engine_version).toContain('walivio-core');
  });

  it('keeps H12 answers and H37 slope count isolated by space', () => {
    component.draft.activeSpace = 'bedroom';
    component.draft.spaceDetails = {
      bedroom: { type: 'bedroom', pricingAnswers: { width: 'not-sure', height: 'yes', sloped: 'yes' }, slantedWallIds: ['one', 'two'] },
      bathroom: { type: 'bathroom', pricingAnswers: { width: 'no', height: 'no', sloped: 'no' }, slantedWallIds: [] }
    };

    (component as any).restoreStepState();
    expect(component.refinementAnswers).toEqual({ width: 'not-sure', height: 'yes', sloped: 'yes' });
    expect(component.selectedSlantedWalls.size).toBe(2);

    component.draft.activeSpace = 'bathroom';
    (component as any).restoreStepState();
    expect(component.refinementAnswers).toEqual({ width: 'no', height: 'no', sloped: 'no' });
    expect(component.selectedSlantedWalls.size).toBe(0);
  });

  it('stores the selected measurement unit and raw metric values with its space', () => {
    component.draft.activeSpace = 'bedroom';
    component.measurementUnit = 'centimeters';
    component.wallMeasurements = [{ id: 'metric-wall', widthFeet: null, widthInches: null, heightFeet: null, heightInches: null, widthValue: 1341.12, heightValue: 243.84 }];
    (component as any).saveSpaceDetailsState();

    component.draft.activeSpace = 'bathroom';
    component.measurementUnit = 'millimeters';
    component.wallMeasurements = [{ id: 'metric-bath', widthFeet: null, widthInches: null, heightFeet: null, heightInches: null, widthValue: 5791.2, heightValue: 2743.2 }];
    (component as any).saveSpaceDetailsState();

    component.draft.activeSpace = 'bedroom';
    (component as any).restoreStepState();
    expect(component.measurementUnit).toBe('centimeters');
    expect(component.wallMeasurements[0].widthValue).toBe(1341.12);
  });

  it.each([
    ['feet-inches', { widthFeet: 44, widthInches: 0, heightFeet: 8, heightInches: 0 }],
    ['inches', { widthValue: 528, heightValue: 96 }],
    ['centimeters', { widthValue: 1341.12, heightValue: 243.84 }],
    ['meters', { widthValue: 13.4112, heightValue: 2.4384 }],
    ['millimeters', { widthValue: 13411.2, heightValue: 2438.4 }],
  ] as const)('accepts valid H07 measurements entered in %s', (unit, values) => {
    component.measurementUnit = unit;
    component.wallMeasurements = [{
      id: `wall-${unit}`,
      widthFeet: null,
      widthInches: null,
      heightFeet: null,
      heightInches: null,
      ...values
    }];

    expect(component.hasSufficientMeasurements).toBe(true);
  });

  it('preserves the original raw input and pricing across a five-unit round trip', () => {
    component.draft.activeSpace = 'bedroom';
    component.measurementUnit = 'feet-inches';
    component.draft.spaceDetails = { bedroom: { type: 'bedroom', wallCoverage: 'all-walls', pricingAnswers: { width: 'no', height: 'no', sloped: 'no' } } };
    component.wallMeasurements = [{ id: 'round-trip', widthFeet: null, widthInches: null, heightFeet: null, heightInches: null }];
    component.updateWallValue(component.wallMeasurements[0], 'widthFeet', 44);
    component.updateWallValue(component.wallMeasurements[0], 'widthInches', 0);
    component.updateWallValue(component.wallMeasurements[0], 'heightFeet', 8);
    component.updateWallValue(component.wallMeasurements[0], 'heightInches', 0);
    const before = component.activePricingResult;

    for (const unit of ['centimeters', 'meters', 'millimeters', 'inches', 'feet-inches'] as const) {
      component.selectMeasurementUnit(unit);
    }

    const wall = component.wallMeasurements[0];
    expect(wall.rawInputUnit).toBe('feet-inches');
    expect(wall.rawWidth).toBe(528);
    expect(wall.rawHeight).toBe(96);
    expect(wall.canonicalWidthFeet).toBe(44);
    expect(wall.canonicalHeightFeet).toBe(8);
    expect(wall.widthFeet).toBe(44);
    expect(wall.widthInches).toBe(0);
    expect(component.activePricingResult.known_subtotal_cents).toBe(before.known_subtotal_cents);
    expect(component.activePricingResult.pricing_status).toBe(before.pricing_status);
  });

  it('does not close H74 when a different space has pending information', () => {
    component.draft.spaces = ['bedroom', 'bathroom'];
    component.draft.activeSpace = 'bedroom';
    component.draft.spaceDetails = {
      bedroom: { type: 'bedroom', wallCoverage: 'all-walls', pricingAnswers: { width: 'no', height: 'no', sloped: 'no' }, walls: [{ id: 'a', widthFeet: 44, widthInches: 0, heightFeet: 8, heightInches: 0 }] },
      bathroom: { type: 'bathroom', bathroomType: 'powder-room', wallCoverage: 'all-walls', pricingAnswers: { width: 'not-sure', height: 'no', sloped: 'no' }, walls: [{ id: 'b', widthFeet: 19, widthInches: 0, heightFeet: 8, heightInches: 0 }] }
    };

    expect(component.estimateItems.map(item => item.description)).toEqual(['AUTO PRICE', 'NEEDS INFO']);
    expect(component.estimateTotalLabel).toBe('—');
    expect(component.estimateItems[1].amount).not.toBe('$0.00');
  });

  it('does not close H74 when a different space requires installer review', () => {
    component.draft.spaces = ['bedroom', 'bathroom'];
    component.draft.activeSpace = 'bedroom';
    component.draft.spaceDetails = {
      bedroom: { type: 'bedroom', wallCoverage: 'all-walls', pricingAnswers: { width: 'no', height: 'no', sloped: 'no' }, walls: [{ id: 'a', widthFeet: 44, widthInches: 0, heightFeet: 8, heightInches: 0 }] },
      bathroom: { type: 'bathroom', bathroomType: 'powder-room', wallCoverage: 'all-walls', pricingAnswers: { width: 'no', height: 'no', sloped: 'no' }, walls: [{ id: 'b', widthFeet: 999, widthInches: 0, heightFeet: 8, heightInches: 0 }] }
    };

    expect(component.estimateItems[1].description).toBe('INSTALLER REVIEW');
    expect(component.estimateTotalLabel).toBe('—');
    expect(component.estimateItems[1].amount).not.toBe('$0.00');
  });

  it('restores serializable per-space pricing state after refresh', async () => {
    component.draft.activeSpace = 'bedroom';
    component.measurementUnit = 'feet-inches';
    component.wallMeasurements = [{ id: 'bedroom-refresh', widthFeet: 44, widthInches: 0, heightFeet: 10, heightInches: 0 }];
    component.refinementAnswers = { width: 'not-sure', height: 'yes', sloped: 'yes' };
    component.selectedSlantedWalls = new Set(['s1', 's2']);
    (component as any).saveSpaceDetailsState();

    component.draft.activeSpace = 'bathroom';
    component.measurementUnit = 'centimeters';
    component.wallMeasurements = [{ id: 'bathroom-refresh', widthFeet: null, widthInches: null, heightFeet: null, heightInches: null, widthValue: 579.12, heightValue: 243.84 }];
    component.refinementAnswers = { width: 'no', height: 'no', sloped: 'no' };
    component.selectedSlantedWalls = new Set();
    (component as any).saveSpaceDetailsState();

    const refreshedFixture = TestBed.createComponent(HomeownerWizard);
    const refreshed = refreshedFixture.componentInstance;
    await refreshedFixture.whenStable();

    refreshed.draft.activeSpace = 'bedroom';
    (refreshed as any).restoreStepState();
    expect(refreshed.measurementUnit).toBe('feet-inches');
    expect(refreshed.refinementAnswers.width).toBe('not-sure');
    expect(refreshed.selectedSlantedWalls.size).toBe(2);
    expect(refreshed.wallMeasurements[0].widthFeet).toBe(44);

    refreshed.draft.activeSpace = 'bathroom';
    (refreshed as any).restoreStepState();
    expect(refreshed.measurementUnit).toBe('centimeters');
    expect(refreshed.refinementAnswers).toEqual({ width: 'no', height: 'no', sloped: 'no' });
    expect(refreshed.selectedSlantedWalls.size).toBe(0);
    expect(refreshed.wallMeasurements[0].widthValue).toBe(579.12);
  });

  it('keeps pending width and sloped-wall counts on their originating spaces', () => {
    component.draft.spaces = ['bedroom', 'bathroom'];
    component.draft.spaceDetails = {
      bedroom: { type: 'bedroom', wallCoverage: 'all-walls', pricingAnswers: { width: 'not-sure', height: 'no', sloped: 'yes' }, slantedWallIds: ['one', 'two'], walls: [{ id: 'a', widthFeet: 44, widthInches: 0, heightFeet: 8, heightInches: 0 }] },
      bathroom: { type: 'bathroom', bathroomType: 'powder-room', wallCoverage: 'all-walls', pricingAnswers: { width: 'no', height: 'no', sloped: 'no' }, slantedWallIds: [], walls: [{ id: 'b', widthFeet: 19, widthInches: 0, heightFeet: 8, heightInches: 0 }] }
    };

    const bedroom = (component as any).priceSpace('bedroom');
    const bathroom = (component as any).priceSpace('bathroom');
    expect(bedroom.original_input.wallpaper_width).toBeUndefined();
    expect(bathroom.original_input.wallpaper_width).toEqual({ value: 36, unit: 'inches' });
    expect(bedroom.original_input.slanted).toBe('yes');
    expect(bedroom.original_input.slanted_wall_count).toBe(2);
    expect(bathroom.original_input.slanted).toBe('no');
    expect(bathroom.original_input.slanted_wall_count).toBeUndefined();
  });
});
