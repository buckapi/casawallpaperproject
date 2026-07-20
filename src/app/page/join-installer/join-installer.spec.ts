import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinInstaller } from './join-installer';

describe('JoinInstaller', () => {
  let component: JoinInstaller;
  let fixture: ComponentFixture<JoinInstaller>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinInstaller]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinInstaller);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
