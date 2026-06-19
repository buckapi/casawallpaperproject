import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Installer } from './installer';

describe('Installer', () => {
  let component: Installer;
  let fixture: ComponentFixture<Installer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Installer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Installer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
