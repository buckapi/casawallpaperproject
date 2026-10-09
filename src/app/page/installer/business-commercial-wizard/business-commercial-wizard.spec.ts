import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BusinessCommercialWizard } from './business-commercial-wizard';

describe('BusinessCommercialWizard', () => {
  let component: BusinessCommercialWizard; let fixture: ComponentFixture<BusinessCommercialWizard>;
  beforeEach(async () => { sessionStorage.clear(); await TestBed.configureTestingModule({imports:[BusinessCommercialWizard],providers:[provideRouter([{path:'installer',component:BusinessCommercialWizard},{path:'installer/business/:step',component:BusinessCommercialWizard}])]}).compileComponents(); fixture=TestBed.createComponent(BusinessCommercialWizard); component=fixture.componentInstance; await fixture.whenStable(); });
  const location=()=>Object.assign(component.draft,{businessName:'Northline Offices',locationName:'Raleigh office',zipCode:'27601',projectName:'Lobby refresh',timeframe:'Within 1 month'});
  it('enters BC01 with isolated business state',()=>{expect(component.step).toBe('location');expect(component.draft.customerRole).toBe('business_commercial');expect(sessionStorage.getItem('installerRequestDraft')).toBeNull();});
  it('moves BC01 through BC04 without pricing',async()=>{const router=TestBed.inject(Router);location();component.next();await fixture.whenStable();expect(router.url).toContain('/business/scope');component.step='scope';component.draft.areas='Lobby';component.draft.areaUnknown=true;component.next();await fixture.whenStable();expect(router.url).toContain('/business/access');component.step='access';component.draft.access='scaffold';component.next();await fixture.whenStable();expect(router.url).toContain('/business/review');expect('engine' in component).toBe(false);});
  it('preserves its own draft across navigation',()=>{location();component.save();expect(sessionStorage.getItem('businessCommercialRequestDraft')).toContain('Northline Offices');});
  it('does not inherit builder or designer state',()=>{sessionStorage.setItem('builderContractorRequestDraft',JSON.stringify({customerRole:'builder_contractor',projectName:'wrong'}));sessionStorage.setItem('interiorDesignerRequestDraft',JSON.stringify({customerRole:'interior_designer',projectUse:'residential'}));expect(component.draft.projectName).toBe('');expect(component.draft.customerRole).toBe('business_commercial');});
});
