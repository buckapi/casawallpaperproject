import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { Installer } from './installer';

describe('Installer', () => {
  let component: Installer;
  let fixture: ComponentFixture<Installer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Installer],
      providers: [provideRouter([{ path: 'installer/contractor', component: Installer }])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Installer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('routes Builder / Contractor selection to GC01', async () => {
    const router = TestBed.inject(Router);
    component.selectAudience('contractor');
    await component.nextStep();
    expect(router.url).toBe('/installer/contractor');
  });
});
