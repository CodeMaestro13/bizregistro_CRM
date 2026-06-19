import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeadsComponent } from './leads/leads.component';

const routes: Routes = [
  { path: '',component: LeadsComponent },
  { path: 'convert-lead/:id', loadComponent: () => import('./convert-lead/convert-lead.component').then(m => m.ConvertLeadComponent) },
  { path: ':id', loadComponent: () => import('./lead-details/lead-details.component').then(m => m.LeadDetailsComponent) }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeadsRoutingModule { }
