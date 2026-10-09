import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DashboardLogin } from './login';

describe('DashboardLogin', () => {
  let component: DashboardLogin;
  let fixture: ComponentFixture<DashboardLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardLogin],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
