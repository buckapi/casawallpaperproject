import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  calculatePanelsAndRolls,
  CalculatorResult,
  CalculatorMeasurementUnit,
} from '../../shared/utils/wallpaper-calculator.logic';

type ProjectType = 'walls' | 'mural' | 'ceiling' | '';
type MeasurementUnit = 'feet-inches' | 'inches' | 'meters' | 'cm' | '';
type WallpaperUnit = 'inches' | 'feet' | 'meters' | 'centimeters';

interface WallMeasurement {
  widthFeet: number | null;
  widthInches: number | null;
  heightFeet: number | null;
  heightInches: number | null;
  widthValue: number | null;
  heightValue: number | null;
}

interface WallpaperDimension {
  value: number | null;
  unit: WallpaperUnit;
}

interface WallpaperDetails {
  rollWidth: WallpaperDimension;
  rollLength: WallpaperDimension;
  patternRepeat: WallpaperDimension;
}

@Component({
  selector: 'app-estimate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estimate.html',
  styleUrl: './estimate.scss',
})
export class Estimate {
  readonly totalSteps = 5;
  readonly maxWalls = 4;

  currentStep = 1;

  result: CalculatorResult | null = null;
  errors: string[] = [];
  warnings: string[] = [];

  projectType: ProjectType = '';
  measurementUnit: MeasurementUnit = '';

  /*
   * Medidas del techo.
   *
   * Cuando la unidad seleccionada es feet-inches, se utilizan los campos
   * separados de pies y pulgadas. Para inches, meters o cm se utilizan
   * ceilingLengthValue y ceilingWidthValue.
   */
  ceilingLengthFeet: number | null = null;
  ceilingLengthInches: number | null = null;
  ceilingWidthFeet: number | null = null;
  ceilingWidthInches: number | null = null;

  ceilingLengthValue: number | null = null;
  ceilingWidthValue: number | null = null;

  walls: WallMeasurement[] = [];

  wallpaperDetails: WallpaperDetails = {
    rollWidth: {
      value: 20.5,
      unit: 'inches',
    },
    rollLength: {
      value: 33,
      unit: 'feet',
    },
    patternRepeat: {
      value: 21,
      unit: 'inches',
    },
  };

  constructor(private readonly router: Router) {}

  // ============================================================
  // Navegación
  // ============================================================

  nextStep(): void {
    this.clearMessages();

    if (this.currentStep === 1) {
      if (!this.projectType) {
        return;
      }

      if (this.projectType === 'mural') {
        this.currentStep = 3;
        this.scrollToTop();
        return;
      }

      this.currentStep = 2;
      this.scrollToTop();
      return;
    }

    if (this.currentStep === 2) {
      if (!this.measurementUnit) {
        return;
      }

      this.currentStep = 3;
      this.scrollToTop();
      return;
    }

    if (this.currentStep === 3) {
      if (this.projectType === 'walls' && this.walls.length === 0) {
        this.errors = ['Select how many walls are included in your project.'];
        return;
      }

      this.currentStep = 4;
      this.scrollToTop();
      return;
    }

    if (this.currentStep === 4 && this.projectType !== 'mural') {
      this.calculate();

      if (this.errors.length > 0 || !this.result) {
        return;
      }

      this.currentStep = 5;
      this.scrollToTop();
    }
  }

  prevStep(): void {
    this.clearMessages();

    if (this.projectType === 'mural' && this.currentStep === 3) {
      this.currentStep = 1;
      this.scrollToTop();
      return;
    }

    if (this.currentStep > 1) {
      this.currentStep--;
      this.scrollToTop();
    }
  }

  getSteps(): number[] {
    if (this.projectType === 'mural') {
      return [1, 3];
    }

    return [1, 2, 3, 4, 5];
  }

  getProgressWidth(): number {
    const steps = this.getSteps();
    const index = steps.indexOf(this.currentStep);

    if (index <= 0 || steps.length <= 1) {
      return 0;
    }

    return (index / (steps.length - 1)) * 100;
  }

  isMuralInfoOnly(): boolean {
    return this.projectType === 'mural' && this.currentStep === 3;
  }

  isCompleted(step: number): boolean {
    const steps = this.getSteps();
    const currentIndex = steps.indexOf(this.currentStep);
    const stepIndex = steps.indexOf(step);

    return stepIndex >= 0 && currentIndex >= 0 && stepIndex < currentIndex;
  }

  isCurrent(step: number): boolean {
    return step === this.currentStep;
  }

  getStepTitle(step: number): string {
    const titles: Record<number, string> = {
      1: 'Project Type',
      2: 'Measurement Unit',
      3:
        this.projectType === 'ceiling'
          ? 'Ceiling Measurements'
          : this.projectType === 'walls'
            ? 'Wall Count'
            : 'Mural Information',
      4:
        this.projectType === 'ceiling'
          ? 'Review'
          : 'Wall Measurements',
      5: 'Result',
    };

    return titles[step] ?? '';
  }

  // ============================================================
  // Selecciones principales
  // ============================================================

  selectProjectType(type: Exclude<ProjectType, ''>): void {
    this.projectType = type;
    this.clearMessages();

    if (type === 'mural') {
      this.measurementUnit = '';
      return;
    }

    /*
     * Al cambiar entre paredes y techo se obliga al usuario a confirmar
     * nuevamente la unidad, evitando que una selección anterior pase
     * inadvertida.
     */
    this.measurementUnit = '';
  }

  selectMeasurementUnit(unit: Exclude<MeasurementUnit, ''>): void {
    this.measurementUnit = unit;
    this.clearMessages();
  }

  // ============================================================
  // Paredes
  // ============================================================

  selectWallCount(count: number): void {
    const safeCount = Math.min(Math.max(Math.trunc(count), 1), this.maxWalls);

    const existingWalls = this.walls.slice(0, safeCount);
    const missingCount = safeCount - existingWalls.length;

    this.walls = [
      ...existingWalls,
      ...Array.from(
        { length: missingCount },
        () => this.createEmptyWall()
      ),
    ];

    this.clearMessages();
  }

  addWall(): void {
    if (this.walls.length >= this.maxWalls) {
      return;
    }

    this.walls = [...this.walls, this.createEmptyWall()];
  }

  removeWall(index: number): void {
    if (index < 0 || index >= this.walls.length) {
      return;
    }

    this.walls = this.walls.filter((_, wallIndex) => wallIndex !== index);
  }

  private createEmptyWall(): WallMeasurement {
    return {
      widthFeet: null,
      widthInches: null,
      heightFeet: null,
      heightInches: null,
      widthValue: null,
      heightValue: null,
    };
  }

  // ============================================================
  // Cálculo
  // ============================================================

  calculate(): void {
    this.clearMessages();
    this.result = null;

    if (this.projectType === 'mural') {
      return;
    }

    if (!this.projectType || !this.measurementUnit) {
      this.errors = ['Complete the project type and measurement unit first.'];
      return;
    }

    if (this.projectType === 'walls' && this.walls.length === 0) {
      this.errors = ['Select at least one wall.'];
      return;
    }

    const input = {
      projectType:
        this.projectType === 'walls'
          ? 'regular_walls'
          : 'ceiling',

      measurementUnit: this.mapMeasurementUnit(),
      hasWallpaperSelected: true,

      walls: this.walls.map((wall, index) => ({
        label: `Wall ${index + 1}`,

        width: this.buildMeasurement(
          wall.widthFeet,
          wall.widthInches,
          wall.widthValue
        ),

        height: this.buildMeasurement(
          wall.heightFeet,
          wall.heightInches,
          wall.heightValue
        ),
      })),

      ceiling: {
        length: this.buildMeasurement(
          this.ceilingLengthFeet,
          this.ceilingLengthInches,
          this.ceilingLengthValue
        ),

        width: this.buildMeasurement(
          this.ceilingWidthFeet,
          this.ceilingWidthInches,
          this.ceilingWidthValue
        ),
      },

      wallpaper: {
        rollWidth: {
          value: this.wallpaperDetails.rollWidth.value,
          unit: this.wallpaperDetails.rollWidth.unit,
        },

        rollLength: {
          value: this.wallpaperDetails.rollLength.value,
          unit: this.wallpaperDetails.rollLength.unit,
        },

        patternRepeat: {
          value: this.wallpaperDetails.patternRepeat.value,
          unit: this.wallpaperDetails.patternRepeat.unit,
        },
      },
    };

    const calculation = calculatePanelsAndRolls(input);

    if (!calculation.ok) {
      this.errors = calculation.errors;
      this.warnings = calculation.warnings;
      return;
    }

    this.result = calculation;
    this.warnings = calculation.warnings;
  }

  private buildMeasurement(
    feet: number | null,
    inches: number | null,
    value: number | null
  ): Record<string, number> {
    switch (this.measurementUnit) {
      case 'feet-inches':
        return {
          feet: feet ?? 0,
          inches: inches ?? 0,
        };

      case 'inches':
        return {
          inches: value ?? 0,
        };

      case 'cm':
        return {
          centimeters: value ?? 0,
        };

      case 'meters':
        return {
          meters: value ?? 0,
        };

      default:
        return {
          feet: 0,
          inches: 0,
        };
    }
  }

  private mapMeasurementUnit(): CalculatorMeasurementUnit {
    switch (this.measurementUnit) {
      case 'feet-inches':
        return 'feet_inches';

      case 'inches':
        return 'inches_only';

      case 'cm':
        return 'centimeters';

      case 'meters':
        return 'meters';

      default:
        return 'feet_inches';
    }
  }

  // ============================================================
  // Etiquetas y placeholders
  // ============================================================

  getMeasurementUnitLabel(): string {
    switch (this.measurementUnit) {
      case 'inches':
        return 'in';

      case 'meters':
        return 'm';

      case 'cm':
        return 'cm';

      case 'feet-inches':
        return 'ft / in';

      default:
        return '';
    }
  }

  getWidthPlaceholder(): string {
    switch (this.measurementUnit) {
      case 'inches':
        return '144';

      case 'meters':
        return '3.66';

      case 'cm':
        return '366';

      default:
        return '12';
    }
  }

  getHeightPlaceholder(): string {
    switch (this.measurementUnit) {
      case 'inches':
        return '108';

      case 'meters':
        return '2.74';

      case 'cm':
        return '274';

      default:
        return '9';
    }
  }

  getCeilingLengthPlaceholder(): string {
    switch (this.measurementUnit) {
      case 'inches':
        return '192';

      case 'meters':
        return '4.88';

      case 'cm':
        return '488';

      default:
        return '16';
    }
  }

  getCeilingWidthPlaceholder(): string {
    switch (this.measurementUnit) {
      case 'inches':
        return '144';

      case 'meters':
        return '3.66';

      case 'cm':
        return '366';

      default:
        return '12';
    }
  }

  // ============================================================
  // Acciones finales
  // ============================================================

  calculateAgain(): void {
    this.result = null;
    this.errors = [];
    this.warnings = [];

    if (this.projectType === 'walls') {
      this.currentStep = 3;
    } else if (this.projectType === 'ceiling') {
      this.currentStep = 2;
    } else {
      this.currentStep = 1;
    }

    this.scrollToTop();
  }

  goHome(): void {
    void this.router.navigate(['/']);
  }

  findInstaller(): void {
    /*
     * Ajusta esta ruta si el módulo de instaladores usa otra URL.
     */
    void this.router.navigate(['/find-installer']);
  }

  // ============================================================
  // Utilidades
  // ============================================================

  private clearMessages(): void {
    this.errors = [];
    this.warnings = [];
  }

  private scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
}