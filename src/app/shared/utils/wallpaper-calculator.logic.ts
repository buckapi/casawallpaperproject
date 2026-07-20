export type CalculatorProjectType =
  | 'regular_walls'
  | 'ceiling'
  | 'mural';

export type CalculatorMeasurementUnit =
  | 'feet_inches'
  | 'inches_only'
  | 'centimeters'
  | 'meters';

export type WallpaperDetailUnit =
  | 'inches'
  | 'feet'
  | 'meters'
  | 'centimeters';
/* export type CalculatorProjectType = 'regular_walls' | 'ceiling';
export type CalculatorMeasurementUnit =
  | 'feet_inches'
  | 'inches_only'
  | 'centimeters'
  | 'meters'; */

export interface CalculatorResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  totalPanelsNeeded?: number;
  panelsPerRoll?: number;
  exactRollsNeeded?: number;
  totalRollsRequired?: number;
  recommendedWasteAllowance?: string;
  totalWallAreaSqFt?: number;
}

const DEFAULTS = {
  trimmingAllowanceInches: 6,
  wallWasteRate: 0.15,
  ceilingWasteRate: 0.2,
};

function numberOrZero(value: any): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function roundTo(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

export function measurementToInches(measurement: any, unit: CalculatorMeasurementUnit): number {
  if (!measurement) return 0;

  switch (unit) {
    case 'feet_inches':
      return numberOrZero(measurement.feet) * 12 + numberOrZero(measurement.inches);
    case 'inches_only':
      return numberOrZero(measurement.inches);
    case 'centimeters':
      return numberOrZero(measurement.centimeters) / 2.54;
    case 'meters':
      return numberOrZero(measurement.meters) * 39.37007874015748;
    default:
      return 0;
  }
}

/* export function lengthToInches(value: number, unit: string): number {
  const num = numberOrZero(value);

  switch (unit) {
    case 'inches':
      return num;
    case 'feet':
      return num * 12;
    case 'yards':
      return num * 36;
    case 'centimeters':
      return num / 2.54;
    case 'meters':
      return num * 39.37007874015748;
    default:
      return 0;
  }
} */

export function lengthToInches(value: number, unit: string): number {
  const num = numberOrZero(value);

  switch (unit) {
    case 'inches':
      return num;

    case 'feet':
      return num * 12;

    case 'centimeters':
      return num / 2.54;

    case 'meters':
      return num * 39.37007874015748;

    default:
      return 0;
  }
}

export function calculatePanelsAndRolls(input: any): CalculatorResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const wallpaper = input.wallpaper;

  const rollWidthInches = lengthToInches(
    wallpaper?.rollWidth?.value,
    wallpaper?.rollWidth?.unit || 'inches'
  );

  const rollLengthInches = lengthToInches(
    wallpaper?.rollLength?.value,
    wallpaper?.rollLength?.unit || 'feet'
  );

  const patternRepeatInches = lengthToInches(
    wallpaper?.patternRepeat?.value || 0,
    wallpaper?.patternRepeat?.unit || 'inches'
  );

  if (rollWidthInches <= 0) errors.push('Wallpaper roll width must be greater than 0.');
  if (rollLengthInches <= 0) errors.push('Wallpaper roll length must be greater than 0.');
  if (patternRepeatInches < 0) errors.push('Pattern repeat cannot be negative.');

  const surfaces =
    input.projectType === 'ceiling'
      ? [
          {
            label: 'Ceiling',
            widthInches: measurementToInches(input.ceiling.width, input.measurementUnit),
            panelLengthInches: measurementToInches(input.ceiling.length, input.measurementUnit),
          },
        ]
      : input.walls.map((wall: any, index: number) => ({
          label: wall.label || `Wall ${index + 1}`,
          widthInches: measurementToInches(wall.width, input.measurementUnit),
          panelLengthInches: measurementToInches(wall.height, input.measurementUnit),
        }));

  surfaces.forEach((surface: any) => {
    if (surface.widthInches <= 0) errors.push(`${surface.label} width must be greater than 0.`);
    if (surface.panelLengthInches <= 0) errors.push(`${surface.label} height/length must be greater than 0.`);
  });

  if (errors.length) {
    return { ok: false, errors, warnings };
  }

  const surfaceDetails = surfaces.map((surface: any) => {
    const panelsNeeded = Math.ceil(surface.widthInches / rollWidthInches);
    const rawPanelLength = surface.panelLengthInches + DEFAULTS.trimmingAllowanceInches;

    const usablePanelLength =
      patternRepeatInches > 0
        ? Math.ceil(rawPanelLength / patternRepeatInches) * patternRepeatInches
        : rawPanelLength;

    return {
      panelsNeeded,
      usablePanelLengthInches: usablePanelLength,
      areaSqFt: (surface.widthInches * surface.panelLengthInches) / 144,
    };
  });

  const totalPanelsNeeded = surfaceDetails.reduce(
    (sum: number, item: any) => sum + item.panelsNeeded,
    0
  );

  const totalAreaSqFt = surfaceDetails.reduce(
    (sum: number, item: any) => sum + item.areaSqFt,
    0
  );

  const tallestUsablePanelLength = Math.max(
    ...surfaceDetails.map((item: any) => item.usablePanelLengthInches)
  );

  const panelsPerRoll = Math.floor(rollLengthInches / tallestUsablePanelLength);

  if (panelsPerRoll < 1) {
    return {
      ok: false,
      errors: [
        'The roll length is too short for the wall or ceiling length entered.',
      ],
      warnings,
    };
  }

  const exactRollsNeeded = totalPanelsNeeded / panelsPerRoll;
  const wasteRate =
    input.projectType === 'ceiling'
      ? DEFAULTS.ceilingWasteRate
      : DEFAULTS.wallWasteRate;

  if (patternRepeatInches === 0) {
    warnings.push('No pattern repeat was used. If your wallpaper has a pattern, add the repeat.');
  }

  if (input.projectType === 'ceiling') {
    warnings.push('Ceiling projects are more complex and may require professional review.');
  }

  return {
    ok: true,
    errors: [],
    warnings,
    totalPanelsNeeded,
    panelsPerRoll,
    exactRollsNeeded: roundTo(exactRollsNeeded),
    totalRollsRequired: Math.ceil(exactRollsNeeded * (1 + wasteRate)),
    recommendedWasteAllowance: `${Math.round(wasteRate * 100)}%`,
    totalWallAreaSqFt: roundTo(totalAreaSqFt),
  };
}