import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { InstallerUnavailable } from './installer-unavailable';

describe('InstallerUnavailable', () => {
  let component: InstallerUnavailable;
  let fixture: ComponentFixture<InstallerUnavailable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallerUnavailable],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstallerUnavailable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
