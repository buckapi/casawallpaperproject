import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommercialWizard } from './commercial-wizard';

describe('CommercialWizard', () => {
  let component: CommercialWizard;
  let fixture: ComponentFixture<CommercialWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommercialWizard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommercialWizard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
