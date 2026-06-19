import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { pluck } from 'rxjs';
import { AdminsService } from '../../admins.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-filler',
  standalone: true,
  imports: [CommonModule,
    MatCardModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule
  ],
  templateUrl: './filler.component.html',
  styleUrl: './filler.component.scss'
})
export class FillerComponent {
  admin_list:any;
  users:any;
  displayedColumns: string[] = ['SN', 'Lead Details', 'Activity', 'Created Date'];
  dataSource: any;


  clientList:any; // = [...this.users];
  workStatus:any;
  constructor(private api:AdminsService){
    this.api.bde(2).pipe(pluck('data')).subscribe((res:any)=>{
      this.admin_list = res;
    })
    this.api.getclients().subscribe((res:any)=>{
      console.log(res)
      this.users = res.data;
      this.clientList = [...this.users];
    })
    this.api.getWorkStatus().subscribe((res:any)=>{
      this.workStatus = res.data;
      console.log(res);
    })
    if(this.current_admin?.deleteLead != 1){
      if(this.current_admin?.admin_id != 5)
        this.fillerfilter.get('fillerId')?.setValue(this.current_admin?.admin_id);
    }
    this.getActivitiesWrapper();
  }
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;
  current_admin:any = JSON.parse(<any>localStorage.getItem('biz-user')); 

  fillerfilter = new FormGroup({
    fillerId: new FormControl(),
    start_date: new FormControl(),
    end_date:new FormControl(),
    client_id: new FormControl(),
    status_id: new FormControl(),
  })
  getActivitiesWrapper() {
    this.currentPage = 0;
    this.getActivities(1, this.pageSize);
  }

  getActivities(page: number = 1, size: number = this.pageSize) {
    const startdates = this.fillerfilter.get('start_date')?.value;
    const startDateRow = startdates ? new Date(startdates) : null;
    const dateFrom = startDateRow
      ? `${startDateRow.getFullYear()}-${String(startDateRow.getMonth() + 1).padStart(2, '0')}-${String(startDateRow.getDate()).padStart(2, '0')}`
      : '';

    const todates = this.fillerfilter.get('end_date')?.value;
    const toDateRow = todates ? new Date(todates) : null;
    const dateTo = toDateRow
      ? `${toDateRow.getFullYear()}-${String(toDateRow.getMonth() + 1).padStart(2, '0')}-${String(toDateRow.getDate()).padStart(2, '0')}`
      : '';

    const payload = {
      ...this.fillerfilter.value,
      startDate: dateFrom,
      endDate: dateTo,
      page: page,
      limit: size
    };

    console.log(payload);

    this.api.getWorkFilter(payload).subscribe((res: any) => {
      this.dataSource = res.data;

      // ✅ VERY IMPORTANT
      this.totalRecords = res.pagination.total_records;
      this.currentPage = res.pagination.current_page - 1; // paginator is 0-based
    });
  }

  clear(){
    this.fillerfilter.reset();
    this.getActivities()
  }


 
  selectedUser: number | null = null;

  filterUsers(searchText:string) {
    const search = searchText.toLowerCase();

    this.clientList = this.users.filter((user:any) =>
      user.name.toLowerCase().includes(search)
    );
  }
  onKeydown(event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.stopPropagation();
    }
  }
  
  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;

    // API page starts from 1
    this.getActivities(this.currentPage + 1, this.pageSize);
  }
}
