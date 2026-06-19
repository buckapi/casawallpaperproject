import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Estimate } from './estimate';

describe('Estimate', () => {
  let component: Estimate;
  let fixture: ComponentFixture<Estimate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Estimate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Estimate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
