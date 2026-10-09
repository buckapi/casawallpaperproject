export type PricingStatus = 'AUTO_PRICE' | 'NEEDS_INFO' | 'INSTALLER_REVIEW' | 'POLICY_PENDING';
export type EstimateRoute =
  | 'PREMATCH_ESTIMATE'
  | 'MATCH_THEN_DIRECT_PROVIDER_QUOTE'
  | 'NO_WALIVIO_REPRICING'
  | 'RECOMMENDED_REVIEW'
  | 'ONSITE';
export type Unit = 'feet_inches' | 'inches' | 'centimeters' | 'meters' | 'millimeters';
export type Answer = 'yes' | 'no' | 'not_sure';
export type Scope = 'all_walls' | 'single_wall' | 'partial_room' | 'kitchen_island' | 'stairwell' | 'ceiling_standalone' | 'ceiling_addon';

export interface MeasurementInput { value: number; unit: Unit; inches?: number; }
export interface PricingInput {
  customer_role: 'homeowner' | 'designer' | 'builder_gc' | 'commercial' | 'commercial_designer';
  project_phase?: 'prematch' | 'postmatch';
  photos_only?: boolean;
  human_approved?: boolean;
  space: string;
  scope: Scope;
  full_perimeter?: MeasurementInput;
  selected_wall_width?: MeasurementInput;
  selected_wall_length?: MeasurementInput;
  ceiling_area_sqft?: number;
  partial_wall_count?: number;
  selected_perimeter_ratio?: number;
  height?: MeasurementInput;
  wallpaper_width?: MeasurementInput;
  slanted?: Answer;
  slanted_wall_count?: number;
  wainscoting?: Answer;
  removal?: Answer;
  primer?: Answer;
  primer_area_sqft?: number;
  adhesive?: Answer;
  wallpaper_type?: 'unpasted' | 'prepasted' | 'peel_and_stick' | 'unknown';
  provider_supplies_adhesive?: boolean;
  ceiling_access?: 'normal_ladder' | 'scaffold' | 'complex';
}
export interface LineItem { rule_id: string; source: string; scope: Scope; amount_cents: number; reason: string; }
export interface PendingItem { condition: string; answer?: Answer; potential_rate_cents: number | null; visible_to_customer: true; visible_to_installer: true; included_in_subtotal: false; }
export interface PolicyBlock { policy_block_id: string; reason: string; required_resolution: string; }
export interface PricingResult {
  pricing_status: PricingStatus;
  estimate_route: EstimateRoute;
  stage: 'provisional' | 'updated' | 'postmatch_reference';
  known_subtotal_cents: number | null;
  line_items: LineItem[];
  pending_items: PendingItem[];
  exclusions: string[];
  review_reasons: string[];
  policy_blocks: PolicyBlock[];
  pricing_engine_version: string;
  pricebook_id: string;
  pricebook_version: string;
  original_input: PricingInput;
}
