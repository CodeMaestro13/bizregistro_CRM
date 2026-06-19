import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CsvExportService } from '../csv-export.service';
import { Observable, pluck, tap } from 'rxjs';
import { AdminsService } from '../../admins.service';


@Component({
  selector: 'app-get-csv',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,MatSelectModule,],
  templateUrl: './get-csv.component.html',
  styleUrls: ['./get-csv.component.scss','../add-activity/add-activity.component.scss']
})
export class GetCsvComponent {
  private csv = inject(CsvExportService);
  private api = inject(AdminsService);
  @Output() closep = new EventEmitter<{refresh:boolean}>();
  @Input() statusList: any;
  leads:any;
  @Input() services: any;
  @Input() bdeList: Observable<any> = this.api.bde(1).pipe(pluck('data'),tap((res:any)=> localStorage.setItem('bdeList',JSON.stringify(res)) ));
  onClose(){
    this.closep.emit({refresh:false});
  }

  getCsv(){
    // let services = this.csvForm.get('services')?.value || [];
    let status = this.csvForm.get('status')?.value || [];
    let bde = this.csvForm.get('bde')?.value || [];
    let start_date = this.csvForm.get('start_date')?.value || '';
    let end_date = this.csvForm.get('end_date')?.value || '';

    if( Array.isArray(status) && Array.isArray(bde)){
      // services = services.join(',');
      status = status.join(',');
      bde = bde.join(',');
      const payload = {status, bde, start_date, end_date};
      console.log(payload);
      // Call API to fetch leads based on filters
      this.csv.getLeadsForCsv(payload).subscribe((res:any)=>{
        this.leads = res.data;
        this.export();
        this.closep.emit({refresh:false});
      })
      

    }
    console.log(this.csvForm.value);
  }

  csvForm = new FormGroup({
    status: new FormControl(''),
    bde: new FormControl(''),
    // services: new FormControl(''),
    start_date: new FormControl(''),
    end_date: new FormControl('')
  });

  export() {
    this.csv.exportToCsv('lead-report', this.leads);
  }
}
