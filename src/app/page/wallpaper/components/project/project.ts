import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project.html',
  styleUrl: './project.scss',
})
export class Project {
  @Input() projects: any[] = [];
  @Input() selectedProject = '';
  @Input() projectDescription = '';

  @Output() selectProjectEvent = new EventEmitter<string>();
  @Output() descriptionChange = new EventEmitter<string>();

  @Output() back = new EventEmitter<void>();

  @Output() getResultsEvent = new EventEmitter<void>();
}