import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallerResults } from './installer-results';

describe('InstallerResults', () => {
  let component: InstallerResults;
  let fixture: ComponentFixture<InstallerResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallerResults]
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
