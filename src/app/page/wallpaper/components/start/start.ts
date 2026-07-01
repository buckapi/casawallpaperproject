import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';

type StartOption = 'shop-online' | 'local-stores' | 'not-sure' | '';
@Component({
  selector: 'app-start',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './start.html',
  styleUrl: './start.scss',
})
export class Start {
@Input() selectedStartOption: StartOption = '';

  @Output() selectOption = new EventEmitter<StartOption>();
  @Output() continue = new EventEmitter<void>();
}
