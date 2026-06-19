import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidentialWizard } from './residential-wizard';

describe('ResidentialWizard', () => {
  let component: ResidentialWizard;
  let fixture: ComponentFixture<ResidentialWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentialWizard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResidentialWizard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
