import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results {
 @Input() brands: any[] = [];
  @Input() selectedPriorities: string[] = [];
  @Input() selectedStyle = '';
  @Input() selectedProject = '';
  @Input() projectDescription = '';

  @Output() openBrandEvent = new EventEmitter<any>();
  @Output() back = new EventEmitter<void>();
  @Output() startOver = new EventEmitter<void>();
}
