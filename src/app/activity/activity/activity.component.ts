import { start } from 'repl';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AdminsService } from '../../admins.service';
import { Subscription, tap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { ViewsComponent } from '../views/views.component';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatTableModule,
    ViewsComponent
  ],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss'
})
export class ActivityComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['SN', 'Lead Details', 'Activity', 'Created Date'];
  dataSource: any;
  constructor(private api:AdminsService) { }
  subscription:Subscription = new Subscription();
  admin_list:any;
  current_admin:any = JSON.parse(localStorage.getItem('biz-user')|| '{}');

  
  leadfilter = new FormGroup({
    admin_id: new FormControl(''),
    start_date: new FormControl(''),
    end_date: new FormControl('')
  })

  ngOnInit(): void {
    this.subscription.add(
      this.api.bde(1).subscribe((res:any)=>{
        this.admin_list = res.data;
      })
    )
    this.getLeads();
  }

  getLeads(){
    this.dataSource = [];
    const admin_id = this.leadfilter.value.admin_id || '';
    let start_date:any = this.leadfilter.value.start_date || '';
    let end_date:any = this.leadfilter.value.end_date || '';
    start_date = start_date ? new Date(start_date) : '';
    end_date = end_date ? new Date(end_date) : '';
    start_date = start_date ? `${start_date.getFullYear()}-${String(start_date.getMonth() + 1).padStart(2, '0')}-${String(start_date.getDate()).padStart(2, '0')}` : '';
    end_date = end_date ? `${end_date.getFullYear()}-${String(end_date.getMonth() + 1).padStart(2, '0')}-${String(end_date.getDate()).padStart(2, '0')}` : '';

    const payload = {
      admin_id: admin_id,
      start_date: start_date,
      end_date: end_date
    }
    console.log(payload);
    this.subscription.add(
      this.api.getactivities(admin_id,start_date,end_date).subscribe((res:any)=>{
        this.dataSource = res.data;
        console.log(res.data);
      })
    );
  }

  clear(){
    this.leadfilter.reset();
    this.getLeads();
  }

  elementD:any;
  viewB:boolean = false;
  openView(elmt:any){
    this.viewB = true;
    this.elementD = elmt;
  }

  close(elmt:any){
    console.log(elmt);
    this.viewB = false;
    this.elementD = '';
  }





















  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
