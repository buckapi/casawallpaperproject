import pricebook from './pricebook_walivio.json';
import { Answer, EstimateRoute, LineItem, MeasurementInput, PolicyBlock, PricingInput, PricingResult, Scope } from './pricing.types';

type Band = { category?: string; min_exclusive?: number; min_inclusive?: number; max_inclusive?: number; max_exclusive?: number; amount_cents: number; wainscoting_amount_cents?: number };
const book: any = pricebook; // Normalized handoff JSON; no UI or persistence dependency.
const source = 'handoff-2026-09-24-v1';

function feet(input?: MeasurementInput): number | undefined {
  if (!input || !Number.isFinite(input.value) || input.value < 0 || (input.inches !== undefined && (input.inches < 0 || input.inches >= 12))) return undefined;
  switch (input.unit) {
    case 'feet_inches': return input.value + (input.inches ?? 0) / 12;
    case 'inches': return input.value / 12;
    case 'centimeters': return input.value / 30.48;
    case 'meters': return input.value / 0.3048;
    case 'millimeters': return input.value / 304.8;
  }
}
function inches(input?: MeasurementInput): number | undefined { const value = feet(input); return value === undefined ? undefined : value * 12; }
function inBand(value: number, band: Band): boolean {
  return (band.min_exclusive === undefined || value > band.min_exclusive) &&
    (band.min_inclusive === undefined || value >= band.min_inclusive) &&
    (band.max_inclusive === undefined || value <= band.max_inclusive) &&
    (band.max_exclusive === undefined || value < band.max_exclusive);
}
function pending(condition: string, answer: Answer | undefined, potential_rate_cents: number | null) {
  return { condition, answer, potential_rate_cents, visible_to_customer: true as const, visible_to_installer: true as const, included_in_subtotal: false as const };
}
function block(id: string, reason: string, required_resolution: string): PolicyBlock { return { policy_block_id: id, reason, required_resolution }; }

export class PricingEngine {
  readonly version = 'walivio-core-1.0.0';

  quote(input: PricingInput): PricingResult {
    const items: LineItem[] = []; const pendingItems: PricingResult['pending_items'] = [];
    const exclusions: string[] = []; const review: string[] = []; const blocks: PolicyBlock[] = [];
    let route: EstimateRoute = 'PREMATCH_ESTIMATE'; let status: PricingResult['pricing_status'] = 'AUTO_PRICE';
    const add = (rule_id: string, amount_cents: number, reason: string) => items.push({ rule_id, source, scope: input.scope, amount_cents, reason });
    const requireInfo = (condition: string, potential: number | null) => { pendingItems.push(pending(condition, 'not_sure', potential)); status = status === 'AUTO_PRICE' ? 'NEEDS_INFO' : status; };
    const reviewOnly = (reason: string) => { review.push(reason); status = 'INSTALLER_REVIEW'; };

    if (input.project_phase === 'postmatch') return this.result(input, 'INSTALLER_REVIEW', 'NO_WALIVIO_REPRICING', 'postmatch_reference', items, pendingItems, exclusions, ['NO_WALIVIO_REPRICING'], blocks);
    if (input.customer_role === 'builder_gc' || input.customer_role === 'commercial' || input.customer_role === 'commercial_designer') return this.result(input, 'NEEDS_INFO', 'MATCH_THEN_DIRECT_PROVIDER_QUOTE', 'provisional', items, pendingItems, exclusions, ['RESIDENTIAL_PRICING_EXCLUDED'], blocks);
    if (input.photos_only && !input.human_approved) return this.result(input, 'NEEDS_INFO', 'RECOMMENDED_REVIEW', 'provisional', items, pendingItems, exclusions, ['HUMAN_APPROVAL_REQUIRED'], blocks);

    const category = this.base(input, add, reviewOnly, blocks);
    if (!category) return this.result(input, status, route, 'provisional', items, pendingItems, exclusions, review, blocks);
    this.modifiers(input, category, add, requireInfo, reviewOnly, exclusions, blocks);
    this.services(input, category, add, requireInfo, reviewOnly, blocks);
    if (input.customer_role === 'designer') {
      // The base-only multiplier is approved; broader ordering is deliberately isolated as P04.
      const base = items.find(item => item.rule_id === 'base');
      if (base) add('designer_base_multiplier', Math.round(base.amount_cents * 0.35), 'Approved 35% residential-designer base adjustment');
      if (items.length > (base ? 2 : 1)) blocks.push(block('P04', 'Designer ordering for modifiers/services/materials is open.', 'Approve multiplier scope and rounding order.'));
    }
    if (blocks.length && status === 'AUTO_PRICE') status = 'POLICY_PENDING';
    return this.result(input, status, route, 'updated', items, pendingItems, exclusions, review, blocks);
  }

  private base(input: PricingInput, add: (id: string, amount: number, reason: string) => void, review: (reason: string) => void, blocks: PolicyBlock[]): string | undefined {
    let bands: Band[] | undefined; let metric: number | undefined;
    if (input.scope === 'single_wall') { bands = book.single_wall.bands; metric = feet(input.selected_wall_width); }
    else if (input.scope === 'kitchen_island') { bands = book.special_scopes.kitchen_island.bands; metric = feet(input.selected_wall_length); if (metric !== undefined) blocks.push(block('P07', 'Kitchen Island measurement definition is open.', 'Confirm visible-face versus summed-face metric.')); }
    else if (input.scope === 'stairwell') { bands = book.special_scopes.stairwell.one_flight_bands; metric = feet(input.selected_wall_length); if (metric !== undefined) blocks.push(block('P07', 'Stairwell length definition is open.', 'Confirm approved stairwell measurement method.')); }
    else if (input.scope === 'ceiling_standalone' || input.scope === 'ceiling_addon') { bands = book.special_scopes[input.scope].bands; metric = input.ceiling_area_sqft; if (input.scope === 'ceiling_addon') blocks.push(block('P07', 'Ceiling add-on eligibility is open.', 'Confirm same-space/project eligibility.')); }
    else { const room = book.room_pricebook.find((room: any) => room.id === input.space); bands = room?.bands; metric = feet(input.full_perimeter); }
    if (metric === undefined) { review('MEASUREMENT_REQUIRED'); return undefined; }
    const matched = bands?.find(band => inBand(metric!, band));
    if (!matched) { review('ABOVE_APPROVED_RANGE'); return undefined; }
    let amount = matched.amount_cents;
    if (input.scope === 'single_wall' && input.wainscoting === 'yes') amount = matched.wainscoting_amount_cents ?? amount;
    add('base', amount, `Approved ${matched.category ?? 'scope'} band`);
    if (input.scope === 'partial_room') {
      if (input.selected_perimeter_ratio === undefined || input.partial_wall_count === undefined) { review('PARTIAL_SCOPE_DATA_REQUIRED'); return matched.category; }
      if (input.selected_perimeter_ratio >= .8) return matched.category;
      if (input.partial_wall_count === 2) add('partial_room_multiplier', Math.round(amount * -.30), 'Approved 70% two-wall partial multiplier');
      else if (input.partial_wall_count === 3) blocks.push(block('P01', 'Three-wall partial result requires $10 tie policy.', 'Approve rounding tie policy before pricing.'));
      else blocks.push(block('P02', 'Partial-room geometry is not resolved for this wall count.', 'Resolve partial scope classification.'));
    }
    return matched.category ?? 'UNKNOWN';
  }

  private modifiers(input: PricingInput, category: string, add: (id: string, amount: number, reason: string) => void, need: (c: string, p: number | null) => void, review: (r: string) => void, exclusions: string[], blocks: PolicyBlock[]) {
    const height = feet(input.height); const width = inches(input.wallpaper_width); const room = book.room_pricebook.find((r: any) => r.id === input.space);
    if (input.scope !== 'stairwell' && !input.scope.startsWith('ceiling') && input.scope !== 'kitchen_island') {
      if (height === undefined) need('Wall height needs verification.', null);
      else if (height >= 10) add('high_wall', input.scope === 'single_wall' ? book.modifiers.high_wall.single_wall_cents : book.modifiers.high_wall.room_by_category_cents[category], 'Height is at least 10 ft');
      if (height !== undefined && height > 14) blocks.push(block('P08', 'Normal wall protection above 14 ft is not approved.', 'Approve or reject review policy.'));
    } else exclusions.push('HIGH_WALL_REGULAR_EXCLUDED_FOR_SPECIAL_SCOPE');
    if (width === undefined) need('Wallpaper width needs verification.', null);
    else if (width > 36) add('wide_wallpaper', input.scope === 'stairwell' ? book.modifiers.wide_wallpaper.stairwell_cents[category] : input.scope.startsWith('ceiling') ? book.modifiers.wide_wallpaper.ceiling_cents[category] : book.modifiers.wide_wallpaper.category_cents[category], 'Wallpaper is wider than 36 in');
    // Bathrooms are never eligible for the slanted-top modifier. Keep the
    // exemption in pricing applicability so callers never receive a pending
    // item (and therefore never render an irrelevant refinement/H37 path).
    if (room?.family === 'bathroom') {
      if (input.slanted === 'yes' || input.slanted === 'not_sure') exclusions.push('SLANTED_TOP_EXEMPT_BATHROOM');
    } else if (input.slanted === 'not_sure') {
      need('Slanted top needs verification.', book.modifiers.slanted_top.amount_per_wall_cents);
    } else if (input.slanted === 'yes') {
      if (!input.slanted_wall_count) need('Slanted-wall count is required.', book.modifiers.slanted_top.amount_per_wall_cents);
      else add('slanted_top', input.slanted_wall_count * book.modifiers.slanted_top.amount_per_wall_cents, 'Applicable ordinary slanted walls');
    }
    if (input.wainscoting === 'not_sure') need('Wainscoting scope needs verification.', null);
    if (input.wainscoting === 'yes' && input.scope !== 'single_wall' && input.scope === 'all_walls') add('wainscoting_discount', -book.modifiers.wainscoting.room_discount_cents[category], 'Approved room wainscoting scope reduction');
    if (input.wainscoting === 'yes' && input.scope === 'partial_room') blocks.push(block('P03', 'Partial wainscoting scope is open.', 'Resolve real scope reduction.'));
    if (input.ceiling_access === 'complex') review('CEILING_COMPLEX_ACCESS');
  }

  private services(input: PricingInput, category: string, add: (id: string, amount: number, reason: string) => void, need: (c: string, p: number | null) => void, review: (r: string) => void, blocks: PolicyBlock[]) {
    if (input.removal === 'yes') add('removal', input.scope === 'single_wall' ? book.services.removal.single_wall_cents : book.services.removal.room_category_cents[category], 'Selected removal service');
    if (input.removal === 'not_sure') need('Removal requirement needs verification.', null);
    if (input.primer === 'yes') { if (input.scope === 'single_wall') blocks.push(block('P06', 'Primer single-wall limits are open.', 'Approve area and height limits.')); else { const band = book.services.primer_labor.bands.find((b: Band) => input.primer_area_sqft !== undefined && inBand(input.primer_area_sqft, b)); if (band) add('primer_labor', band.amount_cents, 'Selected primer labor service'); else review('PRIMER_AREA_REQUIRED_OR_OVERSIZED'); } }
    if (input.primer === 'not_sure') need('Primer requirement needs verification.', null);
    if (input.adhesive === 'yes') { if (input.wallpaper_type === 'unknown') need('Adhesive product requirement is unknown.', null); else if (input.wallpaper_type === 'prepasted' || input.wallpaper_type === 'peel_and_stick' || !input.provider_supplies_adhesive) add('adhesive', 0, 'No automatic adhesive charge for product/supply condition'); else if (input.wallpaper_type === 'unpasted') { const area = input.scope.startsWith('ceiling') ? input.ceiling_area_sqft : (feet(input.selected_wall_length) ?? feet(input.full_perimeter))! * feet(input.height)!; if (area === undefined || !Number.isFinite(area)) review('ADHESIVE_AREA_REQUIRED'); else add('adhesive', Math.ceil(area / book.services.adhesive.budget_sqft_per_gallon) * book.services.adhesive.per_gallon_cents, 'Approved unpasted adhesive formula'); } }
    if (input.adhesive === 'not_sure') need('Adhesive requirement needs verification.', null);
  }

  private result(input: PricingInput, pricing_status: PricingResult['pricing_status'], estimate_route: EstimateRoute, stage: PricingResult['stage'], line_items: LineItem[], pending_items: PricingResult['pending_items'], exclusions: string[], review_reasons: string[], policy_blocks: PolicyBlock[]): PricingResult {
    const known_subtotal_cents = pricing_status === 'INSTALLER_REVIEW' ? null : line_items.reduce((total, item) => total + item.amount_cents, 0);
    return { pricing_status, estimate_route, stage, known_subtotal_cents, line_items, pending_items, exclusions, review_reasons, policy_blocks, pricing_engine_version: this.version, pricebook_id: 'walivio-pricebook', pricebook_version: book.document_version, original_input: input };
  }
}
