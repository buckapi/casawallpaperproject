// src/app/models/calculator.model.ts
export type ProjectType = 'ceiling' | 'mural' | 'regular-walls';
export type MeasurementUnit = 'feet-inches' | 'inches-only' | 'centimeters' | 'meters';

export interface Measurement {
  feet?: number;
  inches?: number;
  centimeters?: number;
  meters?: number;
}

export interface WallpaperDetails {
  rollWidth: number;
  rollLength: number;
  patternRepeat: number;
  unit: string;
}

export interface WallMeasurement {
  width: Measurement;
  height: Measurement;
}

export interface CalculatorData {
  projectType: ProjectType | null;
  measurementUnit: MeasurementUnit | null;
  ceilingLength?: Measurement;
  ceilingWidth?: Measurement;
  muralWidth?: Measurement;
  muralHeight?: Measurement;
  walls: WallMeasurement[];
  wallpaperDetails: WallpaperDetails;
  wallpaperSelected: boolean | null;
}