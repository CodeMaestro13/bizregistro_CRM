import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, Output, EventEmitter, SimpleChanges, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';
import { AdminsService } from '../../admins.service';
import { Router } from '@angular/router';
import { Observable, pluck } from 'rxjs';

@Component({
  selector: 'app-add-activity',
  standalone: true,
  imports: [MatButtonModule,CommonModule,ReactiveFormsModule,FormsModule,MatFormFieldModule,MatSelectModule],
  templateUrl: './add-activity.component.html',
  styleUrl: './add-activity.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class AddActivityComponent implements OnChanges, OnInit {
  @Input() data:any;
  @Input() statusList:any; 
  @Input() services:any;
  @Output() closep = new EventEmitter<any>();
  leadAct:any;
  reasonList:Observable<any> = this.api.reasonList().pipe(pluck('data'));
  constructor(private ref: ChangeDetectorRef,private api:AdminsService,private router:Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['data']){
      console.log('Current Value of Data: ',changes['data']);
      this.activityForm.get('lead_id')?.setValue(this.data?.shopacttblID)
      if(this.data?.lservices.trim() != ''){
        const selectedServices = this.data?.lservices
        .split(',')
        .map((v:any) => v.trim());
        console.log('this.data?.lservices:- ',this.data?.lservices);
        console.log('selectedServices:- ',selectedServices);   
        this.activityForm.get('services')?.setValue(selectedServices)
      }
      this.activityForm.get('status')?.setValue(this.data?.status)
      this.setValidationAndValue(this.data?.status);
      this.ref.markForCheck(); 
    }
  }

  activityForm = new FormGroup({
    lead_id:new FormControl('',[Validators.required]),
    status:new FormControl('',[Validators.required]),
    reason:new FormControl(''),
    next_date: new FormControl('',[Validators.required]),
    services: new FormControl([],[Validators.required]),
    description: new FormControl('',[Validators.required])
  })
  
  onClose(closed:any = false) {
    this.data = '';
    this.closep.emit({'closed': closed});
  }
  

  submitActivity(){
    if(this.activityForm.invalid){
      this.sweetAlert("warning","Fill All Required Feilds😁");
      return;
    }

    if(<any>this.activityForm.value.status == 6){
      this.data.lservices = this.activityForm.value.services ? this.activityForm.value.services.join(',') : '';
      localStorage.setItem('covertLeadData',JSON.stringify(this.data));
      this.sweetAlert("success","Your Redirect to convert page")
      this.router.navigate(['/leads/convert-lead',this.activityForm.value.lead_id]);
      return;
    }

    this.api.addAct(this.activityForm.value).subscribe((res:any)=>{
      console.log(res);
      let status = (res?.status == 'success') ? 'success': 'warning' ;
      let msg = res?.msg;
      this.sweetAlert(status,msg);
      this.onClose(true);
    },(err:any)=>{
      this.sweetAlert("error",'Something Wen\'t Wrong. Connect Your Developer😒');
    },()=>{
      console.log('Closed Activity Add Function!');
    })    
    console.log(this.activityForm.value);
  }

  sweetAlert(status: any, msg: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: status,
      title: msg
    });
  }
  ngOnInit(): void {
    this.api.getAct(this.data?.shopacttblID).subscribe((res:any)=>{
      console.log('Lead Activities: ',res);
      this.leadAct = res?.data;
      this.ref.markForCheck();
    });

    this.activityForm.get('status')?.valueChanges.subscribe((val:any)=>{
      console.log('Status Changed to: ',val);
      this.setValidationAndValue(val);
    });
  }


  setValidationAndValue(val:any){
    const date = new Date();
      date.setDate(date.getDate());
      if(val == 6){
        this.activityForm.get('next_date')?.setValue(date.toISOString().split('T')[0]);
        this.activityForm.get('description')?.setValue('Converted to Client');
        this.activityForm.get('reason')?.clearValidators();
      }else if(val == 5){
        this.activityForm.get('next_date')?.setValue(date.toISOString().split('T')[0]);
        // this.activityForm.get('description')?.setValue('Not Inrested');
        this.activityForm.get('reason')?.addValidators([Validators.required]);
        this.activityForm.get('services')?.clearValidators();
      }
      else{
        this.activityForm.get('reason')?.clearValidators();
        this.activityForm.get('next_date')?.setValue('');
        this.activityForm.get('description')?.setValue('');
        this.activityForm.get('services')?.addValidators([Validators.required]);
      }
      this.activityForm.get('services')?.updateValueAndValidity();
      this.activityForm.get('reason')?.updateValueAndValidity();
  }

}
