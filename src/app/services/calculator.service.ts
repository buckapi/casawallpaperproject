// src/app/services/calculator.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { CalculatorData, ProjectType, MeasurementUnit, WallMeasurement } from '../models/calculator.model';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  private data = signal<CalculatorData>({
    projectType: null,
    measurementUnit: null,
    walls: [],
    wallpaperDetails: {
      rollWidth: 20.5,
      rollLength: 33,
      patternRepeat: 21,
      unit: 'inches'
    },
    wallpaperSelected: null
  });

  currentStep = signal<number>(1);
  totalSteps = 5;

  calculatorData = computed(() => this.data());

  updateData(partial: Partial<CalculatorData>): void {
    this.data.update(current => ({ ...current, ...partial }));
  }

  setProjectType(type: ProjectType): void {
    this.updateData({ projectType: type });
  }

  setMeasurementUnit(unit: MeasurementUnit): void {
    this.updateData({ measurementUnit: unit });
  }

  setCeilingMeasurements(length: { feet: number; inches: number }, width: { feet: number; inches: number }): void {
    this.updateData({
      ceilingLength: length,
      ceilingWidth: width
    });
  }

  setMuralMeasurements(width: { feet: number; inches: number }, height: { feet: number; inches: number }): void {
    this.updateData({
      muralWidth: width,
      muralHeight: height
    });
  }

  addWall(wall: WallMeasurement): void {
    const walls = [...this.data().walls, wall];
    this.updateData({ walls });
  }

  removeWall(index: number): void {
    const walls = this.data().walls.filter((_, i) => i !== index);
    this.updateData({ walls });
  }

  setWallpaperDetails(details: Partial<CalculatorData['wallpaperDetails']>): void {
    this.updateData({
      wallpaperDetails: { ...this.data().wallpaperDetails, ...details }
    });
  }

  setWallpaperSelected(selected: boolean): void {
    this.updateData({ wallpaperSelected: selected });
  }

  nextStep(): void {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep.set(step);
    }
  }

  reset(): void {
    this.data.set({
      projectType: null,
      measurementUnit: null,
      walls: [],
      wallpaperDetails: {
        rollWidth: 20.5,
        rollLength: 33,
        patternRepeat: 21,
        unit: 'inches'
      },
      wallpaperSelected: null
    });
    this.currentStep.set(1);
  }
}