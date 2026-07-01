import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preferences.html',
  styleUrl: './preferences.scss',
})
export class Preferences {
@Input() priorities: any[] = [];
  @Input() styles: any[] = [];
  @Input() showAllStyles = false;
  @Input() selectedPriorities: string[] = [];
  @Input() selectedStyle = '';

  @Output() togglePriorityEvent = new EventEmitter<string>();
  @Output() selectStyleEvent = new EventEmitter<string>();
  @Output() toggleStylesEvent = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @Output() continue = new EventEmitter<void>();
}
