import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { InteriorDesignerWizard } from './interior-designer-wizard';

describe('InteriorDesignerWizard', () => {
  let component: InteriorDesignerWizard;
  let fixture: ComponentFixture<InteriorDesignerWizard>;

  beforeEach(async () => {
    sessionStorage.removeItem('interiorDesignerRequestDraft');
    await TestBed.configureTestingModule({ imports: [InteriorDesignerWizard], providers: [provideRouter([{ path: 'installer/interior-designer/:step', component: InteriorDesignerWizard }])] }).compileComponents();
    fixture = TestBed.createComponent(InteriorDesignerWizard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('enters the designer branch with isolated role state', () => {
    expect(component.draft.customerRole).toBe('interior_designer');
    expect(sessionStorage.getItem('installerRequestDraft')).toBeNull();
  });

  it('routes residential work to ID03 and commercial work to ID04', async () => {
    const router = TestBed.inject(Router);
    component.draft.projectName = 'Morgan residence'; component.draft.zipCode = '27601'; component.draft.timeframe = 'Within 1 month';
    component.next(); await router.navigate(['/installer/interior-designer/details']);
    component.step = 'details'; component.draft.spaces = ['Bedroom']; component.draft.projectUse = 'residential'; component.next(); await fixture.whenStable();
    expect(router.url).toContain('/installer/interior-designer/estimate');
    component.step = 'details'; component.draft.projectUse = 'commercial'; component.next(); await fixture.whenStable();
    expect(router.url).toContain('/installer/interior-designer/commercial-request');
  });

  it('does not run residential pricing for commercial designer work', () => {
    component.draft.projectUse = 'commercial'; component.draft.measurement.value = 44;
    expect(component.residentialResult).toBeNull();
    expect(component.estimateLabel).toBe('—');
  });

  it('does not invent a total when P04 is present', () => {
    component.draft.projectUse = 'residential'; component.draft.measurement.value = 44; component.draft.measurement.height = 10;
    expect(component.hasP04).toBe(true);
    expect(component.estimateLabel).toBe('—');
  });
});
