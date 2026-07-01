import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocalResults } from './local-results';

describe('LocalResults', () => {
  let component: LocalResults;
  let fixture: ComponentFixture<LocalResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocalResults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocalResults);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
