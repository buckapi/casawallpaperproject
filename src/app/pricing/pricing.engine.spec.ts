import acceptance from './casos_de_aceptacion.json';
import { PricingEngine } from './pricing.engine';
import { PricingInput } from './pricing.types';

const homeowner = { customer_role: 'homeowner' as const, space: 'bedroom', scope: 'all_walls' as const, height: { value: 9, unit: 'feet_inches' as const }, wallpaper_width: { value: 36, unit: 'inches' as const }, slanted: 'no' as const };
const ft = (value: number) => ({ value, unit: 'feet_inches' as const });
const inputByCase: Record<string, { input: PricingInput; line?: string }> = {
  T01: { input: { ...homeowner, full_perimeter: ft(44) } }, T02: { input: { ...homeowner, full_perimeter: ft(44.1) } },
  T03: { input: { ...homeowner, full_perimeter: ft(68.1) } }, T04: { input: { customer_role: 'homeowner', space: 'powder_room', scope: 'all_walls', full_perimeter: ft(19), height: ft(9), wallpaper_width: { value: 36, unit: 'inches' }, slanted: 'yes', slanted_wall_count: 2 } },
  T05: { input: { customer_role: 'homeowner', space: 'bedroom', scope: 'single_wall', selected_wall_width: ft(8), height: ft(9), wallpaper_width: { value: 36, unit: 'inches' } } }, T06: { input: { customer_role: 'homeowner', space: 'bedroom', scope: 'single_wall', selected_wall_width: ft(8.01), height: ft(9), wallpaper_width: { value: 36, unit: 'inches' } } },
  T07: { input: { customer_role: 'homeowner', space: 'bedroom', scope: 'single_wall', selected_wall_width: ft(9), height: ft(9), wallpaper_width: { value: 36, unit: 'inches' }, wainscoting: 'yes' } }, T08: { input: { ...homeowner, scope: 'partial_room', full_perimeter: ft(44), partial_wall_count: 2, selected_perimeter_ratio: .7 } },
  T09: { input: { ...homeowner, scope: 'partial_room', full_perimeter: ft(44), partial_wall_count: 3, selected_perimeter_ratio: .7 } }, T10: { input: { ...homeowner, scope: 'partial_room', full_perimeter: ft(44), partial_wall_count: 2, selected_perimeter_ratio: .8 } },
  T11: { input: { ...homeowner, full_perimeter: ft(44), height: ft(9.99) } }, T12: { input: { ...homeowner, full_perimeter: ft(44), height: ft(10) } },
  T13: { input: { ...homeowner, full_perimeter: ft(44), wallpaper_width: { value: 36, unit: 'inches' } } }, T14: { input: { ...homeowner, full_perimeter: ft(44), wallpaper_width: { value: 36.01, unit: 'inches' } } },
  T15: { input: { ...homeowner, full_perimeter: ft(44), wallpaper_width: undefined, slanted: 'no' } }, T16: { input: { ...homeowner, full_perimeter: ft(44), wallpaper_width: { value: 36, unit: 'inches' }, slanted: 'yes', slanted_wall_count: 2 } },
  T17: { input: { ...homeowner, full_perimeter: ft(44), selected_wall_length: ft(25), height: ft(10), adhesive: 'yes', wallpaper_type: 'unpasted', provider_supplies_adhesive: true }, line: 'adhesive' }, T18: { input: { ...homeowner, full_perimeter: ft(44), selected_wall_length: ft(25.001), height: ft(10), adhesive: 'yes', wallpaper_type: 'unpasted', provider_supplies_adhesive: true }, line: 'adhesive' },
  T19: { input: { ...homeowner, full_perimeter: ft(44), adhesive: 'yes', wallpaper_type: 'peel_and_stick' }, line: 'adhesive' }, T20: { input: { customer_role: 'homeowner', space: 'bedroom', scope: 'ceiling_standalone', ceiling_area_sqft: 40, wallpaper_width: { value: 36, unit: 'inches' } } },
  T21: { input: { customer_role: 'designer', space: 'bedroom', scope: 'all_walls', full_perimeter: ft(44) } }, T22: { input: { customer_role: 'builder_gc', space: 'bedroom', scope: 'all_walls', full_perimeter: ft(44) } },
  T23: { input: { ...homeowner, project_phase: 'postmatch', full_perimeter: ft(44) } }, T24: { input: { ...homeowner, photos_only: true, human_approved: false } },
  T25: { input: { customer_role: 'homeowner', space: 'kitchen_island', scope: 'kitchen_island', selected_wall_length: ft(8) } }, T26: { input: { ...homeowner, full_perimeter: ft(44), slanted: 'yes' } }
};

describe('PricingEngine acceptance package', () => {
  const engine = new PricingEngine();
  it('has a structured input adapter for every handoff acceptance case', () => expect(Object.keys(inputByCase).sort()).toEqual(acceptance.cases.map(c => c.id).sort()));
  for (const testCase of acceptance.cases) {
    it(testCase.id + ': ' + testCase.input_description, () => {
      const fixture = inputByCase[testCase.id]!; const result = engine.quote(fixture.input);
      expect(result.pricebook_version).toBe('handoff-2026-09-24-v1');
      expect(result.line_items.every(item => item.rule_id && item.source && item.reason)).toBe(true);
      if (testCase.expected_known_component_or_subtotal_cents !== null) {
        const actual = fixture.line ? result.line_items.find(item => item.rule_id === fixture.line)?.amount_cents : result.known_subtotal_cents;
        expect(actual).toBe(testCase.expected_known_component_or_subtotal_cents);
      } else expect(['NEEDS_INFO', 'INSTALLER_REVIEW', 'POLICY_PENDING']).toContain(result.pricing_status);
    });
  }
});

describe('PricingEngine boundaries and normalization', () => {
  const engine = new PricingEngine();
  it('keeps exact category boundaries and unit conversion deterministic', () => {
    expect(engine.quote({ ...homeowner, full_perimeter: { value: 528, unit: 'inches' } }).known_subtotal_cents).toBe(70000);
    expect(engine.quote({ ...homeowner, full_perimeter: { value: 1341.12, unit: 'centimeters' } }).known_subtotal_cents).toBe(70000);
    expect(engine.quote({ ...homeowner, full_perimeter: ft(68.01) }).pricing_status).toBe('INSTALLER_REVIEW');
  });
  it('keeps Not sure pending and exempts bathroom slanted walls', () => {
    const unsure = engine.quote({ ...homeowner, full_perimeter: ft(44), slanted: 'not_sure' });
    expect(unsure.pending_items.some(item => item.condition.includes('Slanted'))).toBe(true);
    const bathroom = engine.quote({ customer_role: 'homeowner', space: 'powder_room', scope: 'all_walls', full_perimeter: ft(19), slanted: 'yes', slanted_wall_count: 3 });
    const unsureBathroom = engine.quote({ customer_role: 'homeowner', space: 'powder_room', scope: 'all_walls', full_perimeter: ft(19), slanted: 'not_sure' });
    expect(bathroom.exclusions).toContain('SLANTED_TOP_EXEMPT_BATHROOM');
    expect(bathroom.line_items.some(item => item.rule_id === 'slanted_top')).toBe(false);
    expect(unsureBathroom.pending_items.some(item => item.condition.includes('Slanted'))).toBe(false);
  });
});
