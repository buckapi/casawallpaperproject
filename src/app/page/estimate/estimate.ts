import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  calculatePanelsAndRolls,
  CalculatorResult,
} from '../../shared/utils/wallpaper-calculator.logic';
@Component({
  selector: 'app-estimate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estimate.html',
  styleUrl: './estimate.scss',
})
export class Estimate {
  result: CalculatorResult | null = null;
errors: string[] = [];
warnings: string[] = [];
currentStep = 1;
  totalSteps = 5;
  
  // Datos del formulario
  projectType: string = '';
  measurementUnit: string = '';
  
  // Medidas
  ceilingLengthFeet = 16;
  ceilingLengthInches = 0;
  ceilingWidthFeet = 12;
  ceilingWidthInches = 0;
  
  muralWidthFeet = 16;
  muralWidthInches = 0;
  muralHeightFeet = 9;
  muralHeightInches = 6;
  
  walls: any[] = [];
  currentWall = { widthFeet: 12, widthInches: 0, heightFeet: 9, heightInches: 0 };
  
  wallpaperDetails = {
    rollWidth: 20.5,
    rollLength: 33,
    patternRepeat: 21,
    unit: 'inches'
  };
  
  wallpaperSelected: boolean | null = null;

  // Navegación
nextStep() {
  if (this.currentStep === 1 && !this.projectType) return;
  if (this.currentStep === 2 && !this.measurementUnit) return;

  if (this.currentStep === 1 && this.projectType === 'mural') {
    this.currentStep = 3;
  } else {
    if (this.currentStep === 4 && this.projectType !== 'mural') {
      this.calculate();

      if (this.errors.length > 0) {
        return;
      }
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

prevStep() {
  if (this.projectType === 'mural' && this.currentStep === 3) {
    this.currentStep = 1;
  } else if (this.currentStep > 1) {
    this.currentStep--;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

getSteps() {
  if (this.projectType === 'mural') {
    return [1, 3];
  }

  return [1, 2, 3, 4, 5];
}

getProgressWidth(): number {
  const steps = this.getSteps();
  const index = steps.indexOf(this.currentStep);

  if (index <= 0) return 0;

  return (index / (steps.length - 1)) * 100;
}

isMuralInfoOnly(): boolean {
  return this.projectType === 'mural' && this.currentStep === 3;
}

  selectProjectType(type: string) {
  this.projectType = type;

  if(type === 'mural'){
    this.measurementUnit = 'not-required';
  }else{
    this.measurementUnit = '';
  }
}

  selectMeasurementUnit(unit: string) {
    this.measurementUnit = unit;
  }

  addWall() {
    this.walls.push({ ...this.currentWall });
    this.currentWall = { widthFeet: 12, widthInches: 0, heightFeet: 9, heightInches: 0 };
  }

  removeWall(index: number) {
    this.walls.splice(index, 1);
  }

  calculate() {
  this.errors = [];
  this.warnings = [];
  this.result = null;

  if (this.projectType === 'mural') {
    return;
  }

  const input = {
    projectType: this.projectType === 'walls' ? 'regular_walls' : 'ceiling',
    measurementUnit: this.mapMeasurementUnit(),
    hasWallpaperSelected: true,

    walls: this.walls.map((wall, index) => ({
      label: `Wall ${index + 1}`,
      width: {
        feet: wall.widthFeet,
        inches: wall.widthInches,
      },
      height: {
        feet: wall.heightFeet,
        inches: wall.heightInches,
      },
    })),

    ceiling: {
      length: {
        feet: this.ceilingLengthFeet,
        inches: this.ceilingLengthInches,
      },
      width: {
        feet: this.ceilingWidthFeet,
        inches: this.ceilingWidthInches,
      },
    },

    wallpaper: {
      rollWidth: {
        value: this.wallpaperDetails.rollWidth,
        unit: 'inches',
      },
      rollLength: {
        value: this.wallpaperDetails.rollLength,
        unit: this.wallpaperDetails.unit,
      },
      patternRepeat: {
        value: this.wallpaperDetails.patternRepeat,
        unit: 'inches',
      },
    },
  };

  const calculation = calculatePanelsAndRolls(input);

  if (!calculation.ok) {
    this.errors = calculation.errors;
    return;
  }

  this.result = calculation;
  this.warnings = calculation.warnings;
}
mapMeasurementUnit() {
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

  // Helpers para la línea de tiempo
  isCompleted(step: number) {
    return step < this.currentStep;
  }

  isCurrent(step: number) {
    return step === this.currentStep;
  }

getStepTitle(step: number): string {
  const titles: any = {
    1: 'Project Type',
    2: 'Measurement Unit',
    3: this.projectType === 'ceiling'
      ? 'Ceiling Measurements'
      : this.projectType === 'walls'
        ? 'Wall Count'
        : 'Mural Information',
    4: this.projectType === 'ceiling'
      ? 'Review'
      : 'Wall Measurements',
    5: 'Result'
  };

  return titles[step] || '';
}
}
