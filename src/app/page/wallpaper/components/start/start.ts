import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

goBack() {
  this.router.navigate(['/']).then(() => {
    setTimeout(() => {
      document
        .getElementById('help-section')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
    }, 100);
  });
}
}
