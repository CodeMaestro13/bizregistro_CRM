import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkStatusComponent } from './work-status/work-status.component';

const routes: Routes = [
  { path: '',component:WorkStatusComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkprostatusRoutingModule { }
