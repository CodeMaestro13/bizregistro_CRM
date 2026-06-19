import { map, Observable, pluck, tap, toArray } from 'rxjs';
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AdminsService } from '../../admins.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustomizerSettingsService } from '../../components/customizer-settings/customizer-settings.service';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule, MatDateRangeInput } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [ReactiveFormsModule,MatTooltipModule,FormsModule,CommonModule,MatCardModule,MatButtonModule,MatToolbarModule,MatMenuModule,MatIconModule,MatFormFieldModule,MatDatepickerModule,MatDateRangeInput,MatOptionModule,MatSelectModule],
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss',
    '../../themecomponent/tables/basic-table/basic-table.component.scss',
    '../../clients/clients/clients.component.scss'
  ]
})
export class ReceiptComponent implements OnInit {
  @Input() filters: any;
  @Input() options: any;
  services:any;
  assignedTo:Observable<any> = this.api.bde().pipe(pluck('data'),tap((res:any)=> localStorage.setItem('bdeList',JSON.stringify(res)) ));;
  receipts: any[] = [];
  pagination: any = { current_page: 1, per_page: 10, total_records: 0, total_pages: 0 };
  totalAmt:any = 0;

  constructor(private api:AdminsService,public themeService: CustomizerSettingsService){}

  form = new FormGroup({
    handledBy: new FormControl(''),
    search: new FormControl(''),
    service: new FormControl(''),
    payment_mode: new FormControl(''),
    date_from: new FormControl(''),
    date_to: new FormControl(''),
    page_no: new FormControl(1),
    per_page: new FormControl(10),
  })

  ngOnInit(): void {
    this.api.services().pipe(pluck('data')).subscribe((res:any)=>{
      // console.log(res);
      this.services = res;
    })
    this.loadReceipts();
  }

  serviceArray(element: any) {
    return element ? element.split(',') : [];
  }


  ngOnChanges(changes: SimpleChanges){
    if(changes['filters'] && !changes['filters'].firstChange){
      this.applyExternalFilters(changes['filters'].currentValue);
    }
    if(changes['options'] && !changes['options'].firstChange){
      const opts = changes['options'].currentValue || {};
      if(opts.per_page) this.form.get('per_page')?.setValue(opts.per_page);
      this.loadReceipts();
    }
  }

  loadReceipts(){
    // const payload = { ...this.form.value };
    const dateFrom = this.form.value.date_from;
    const startDateRaw = dateFrom ? new Date(dateFrom) : null;
    if (startDateRaw) {
      let startDateFormatted = `${startDateRaw.getFullYear()}-${String(startDateRaw.getMonth() + 1).padStart(2, '0')}-${String(startDateRaw.getDate()).padStart(2, '0')}`;
    }
    const dateTo = this.form.value.date_to;
    const endDateRaw = dateTo ? new Date(dateTo) : null;
    if (endDateRaw) {
      let endDateFormatted = `${endDateRaw.getFullYear()}-${String(endDateRaw.getMonth() + 1).padStart(2, '0')}-${String(endDateRaw.getDate()).padStart(2, '0')}`;
    }
    const payload = {
      ...this.form.value,
      date_from: startDateRaw ? `${startDateRaw.getFullYear()}-${String(startDateRaw.getMonth() + 1).padStart(2, '0')}-${String(startDateRaw.getDate()).padStart(2, '0')}` : '',
      date_to: endDateRaw ? `${endDateRaw.getFullYear()}-${String(endDateRaw.getMonth() + 1).padStart(2, '0')}-${String(endDateRaw.getDate()).padStart(2, '0')}` : ''
    };
    console.log(payload);
    this.totalAmt = 0;
    this.api.ranymentreceipt(payload).subscribe((res:any)=>{
      if(res && res.data){
        this.receipts = res.data;
        this.totalAmt = this.receipts.reduce((acc: number, res: any) => {
          const amount = Number(res?.payment_amount) || 0;
          return acc + amount;
        }, 0);
      } else {
        this.receipts = [];
      }
      if(res && res.pagination){
        this.pagination = res.pagination;
      }
    }, err => {
      this.receipts = [];
    });
  }

  applyFilters(){
    this.form.get('page_no')?.setValue(1);
    this.loadReceipts();
  }

  clearFilters(){
    this.form.patchValue({ search: '', payment_mode: '', date_from: '', date_to: '', handledBy: '',service:'' });
    this.applyFilters();
  }

  changePage(page:number){
    this.form.get('page_no')?.setValue(page);
    window.scroll({
      top: 300,
      behavior: "smooth",
    });
    this.loadReceipts();
  }

  private applyExternalFilters(filters:any){
    if(!filters) return;
    const patch: any = {};
    if(filters.handledBy) patch.handledBy = filters.handledBy;
    if(filters.payment_mode) patch.payment_mode = filters.payment_mode;
    if(filters.search) patch.search = filters.search;
    this.form.patchValue(patch);
    this.applyFilters();
  }

}