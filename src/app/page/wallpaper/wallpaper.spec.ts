import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wallpaper } from './wallpaper';

describe('Wallpaper', () => {
  let component: Wallpaper;
  let fixture: ComponentFixture<Wallpaper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wallpaper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Wallpaper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
