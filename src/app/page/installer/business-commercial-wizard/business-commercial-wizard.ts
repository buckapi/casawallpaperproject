import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

type Step = 'location' | 'scope' | 'access' | 'review' | 'locations' | 'projects' | 'add-location';
type Access = 'standard_ladder' | 'scaffold' | 'scissor_lift' | 'not_sure';
interface Draft { customerRole: 'business_commercial'; businessName:string; locationName:string; zipCode:string; resolvedLocation:string; projectName:string; timeframe:string; areas:string; area:number|null; areaUnknown:boolean; unit:'sq_ft'|'sq_m'; files:string[]; productLink:string; access:Access|null; workHours:string|null; notes:string; }

@Component({selector:'app-business-commercial-wizard',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./business-commercial-wizard.html',styleUrl:'./business-commercial-wizard.scss'})
export class BusinessCommercialWizard {
  step: Step = 'location'; draft: Draft = {customerRole:'business_commercial',businessName:'',locationName:'',zipCode:'',resolvedLocation:'',projectName:'',timeframe:'',areas:'',area:null,areaUnknown:false,unit:'sq_ft',files:[],productLink:'',access:null,workHours:null,notes:''};
  readonly accessOptions:Array<{value:Access;label:string}>=[{value:'standard_ladder',label:'Standard ladder'},{value:'scaffold',label:'Scaffold'},{value:'scissor_lift',label:'Scissor lift'},{value:'not_sure',label:'Not sure'}];
  constructor(private router:Router,private route:ActivatedRoute,@Inject(PLATFORM_ID) private platform:object){this.restore();this.route.paramMap.subscribe(p=>{const s=p.get('step') as Step|null;if(s&&['location','scope','access','review','locations','projects','add-location'].includes(s))this.step=s;});}
  get canProceed(){if(this.step==='location')return !!this.draft.businessName&&!!this.draft.locationName&&!!this.draft.zipCode&&!!this.draft.projectName&&!!this.draft.timeframe;if(this.step==='scope')return !!this.draft.areas&&(this.draft.areaUnknown||!!this.draft.area);return this.step!=='access'||!!this.draft.access;}
  next(){if(!this.canProceed)return;this.go(this.step==='location'?'scope':this.step==='scope'?'access':this.step==='access'?'review':'locations');}
  back(){if(this.step==='location')void this.router.navigate(['/installer']);else this.go(this.step==='scope'?'location':this.step==='access'?'scope':this.step==='review'?'access':this.step==='projects'?'locations':'locations');}
  go(step:Step){this.save();void this.router.navigate(['/installer/business',step]);} save(){if(isPlatformBrowser(this.platform))sessionStorage.setItem('businessCommercialRequestDraft',JSON.stringify(this.draft));}
  addFiles(e:Event){const fs=(e.target as HTMLInputElement).files;if(fs){this.draft.files=[...this.draft.files,...Array.from(fs).map(f=>f.name)];this.save();}} removeFile(file:string){this.draft.files=this.draft.files.filter(x=>x!==file);this.save();}
  private restore(){if(!isPlatformBrowser(this.platform))return;try{const saved=JSON.parse(sessionStorage.getItem('businessCommercialRequestDraft')??'null') as Partial<Draft>|null;if(saved?.customerRole==='business_commercial')this.draft={...this.draft,...saved};}catch{/* ignore invalid draft */}}
}
