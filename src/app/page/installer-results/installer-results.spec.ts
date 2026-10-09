import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { InstallerResults } from './installer-results';

describe('InstallerResults', () => {
  let component: InstallerResults;
  let fixture: ComponentFixture<InstallerResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallerResults],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallerResults);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
