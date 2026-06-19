// rxjs imports removed (not used directly here)
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AdminsService } from '../../admins.service';
import { indianStates } from '../../shared/constants';
import { LoaderService } from '../../shared/loader/loader.service';
import Swal from 'sweetalert2';
import { MatDatepickerModule } from '@angular/material/datepicker';

@Component({
  selector: 'app-convert-lead',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    RouterLink,
    MatDatepickerModule
  ],
  templateUrl: './convert-lead.component.html',
  styleUrls: ['./convert-lead.component.scss']
})
export class ConvertLeadComponent implements OnInit, OnDestroy {
  form: FormGroup;
  servicesList:any[] = [];
  indianStates:any = indianStates;
  bdeList:any[] = [];
  data:any;

  constructor(private fb: FormBuilder, private route: ActivatedRoute,private router:Router,private api:AdminsService,private loader:LoaderService) { 
    this.bdeList = localStorage.getItem('bdeList') ? JSON.parse(localStorage.getItem('bdeList')!) : []; 
    this.api.services().subscribe((res:any)=>{
      console.log(res);
      if(res.status == 'success'){
        this.servicesList = res?.data;
      }
    });
    this.form = this.fb.group({
      leadId: [this.route.snapshot.paramMap.get('id'), Validators.required],
      name: ['', Validators.required],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      email: ['', [Validators.required, Validators.email]],
      handled_by: ['', [Validators.required]],
      services: [[], Validators.required],
      address: this.fb.group({
        line1: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['India', Validators.required]
      }),
      fullAmount: [0, [Validators.required, Validators.min(0)]],
      paidAmount: [0, [Validators.required, Validators.min(0)]],
      remainingAmount: [{ value: 0, disabled: true }],
      paymentMode: ['cash', Validators.required],
      transactionId: [{ value: 'N/A', disabled: true }, Validators.required ],
      next_payment_date: ['', Validators.required]
    });

    this.form.get('fullAmount')!.valueChanges.subscribe(() => this.updateRemaining());
    this.form.get('paidAmount')!.valueChanges.subscribe(() => this.updateRemaining());
    // toggle transactionId when payment mode changes
    this.form.get('paymentMode')!.valueChanges.subscribe((mode: string) => {
      const txCtrl = this.form.get('transactionId')!;
      if (mode === 'cash') {
        txCtrl.setValue('N/A');
        txCtrl.disable({ emitEvent: false });
        txCtrl.clearValidators();
      } else {
        txCtrl.enable({ emitEvent: false });
        txCtrl.setValue('');
        txCtrl.setValidators([Validators.required]);
      }
      txCtrl.updateValueAndValidity({ emitEvent: false });
    });
  }

  ngOnInit(): void {
    const leadData: any = localStorage.getItem('covertLeadData') ? JSON.parse(localStorage.getItem('covertLeadData')!) : null; 
    const leadApiData: any = localStorage.getItem('covertLeadApiData') ? JSON.parse(localStorage.getItem('covertLeadApiData')!) : null; 
    console.log('Lead Data:', leadData);
    console.log('Lead API LocalStorage Data:', leadApiData);
    if(leadData){
      this.data = leadData; 
      this.form.patchValue({
        name: leadData.name,
        mobile: leadData.mobile,
        email: leadData.email,
        handled_by: leadData.adId,
        address: {
          city: leadData.city.charAt(0).toUpperCase() + leadData.city.slice(1).toLowerCase()
        }
        
      });
      const servicelcl = leadData.lservices ? leadData.lservices : leadData.services ? leadData.services : '';
      const service = servicelcl
        ? servicelcl.split(',').map((s: string) => s.trim())
        : [];
      this.form.get('services')!.setValue(service);
      console.warn('Using localStorage lead data for conversion.');
    }else if(leadApiData)
    {
      this.data = leadApiData; 
      this.form.patchValue({
        name: leadApiData.name,
        mobile: leadApiData.mobile,
        email: leadApiData.email,
        handled_by: leadApiData.handled_by,
        address: {
          city: leadApiData.city.charAt(0).toUpperCase() + leadApiData.city.slice(1).toLowerCase()
        }
        
      });
      console.log('Lead API Data:', this.data);
      const servicelcl = leadApiData.lservices ? leadApiData.lservices : leadApiData.services ? leadApiData.services : '';
      const service = servicelcl
        ? servicelcl.split(',').map((s: string) => s.trim())
        : [];
      this.form.get('services')!.setValue(service);
      console.warn('Using localStorage lead data for conversion.');
    }else{
      this.api.lead(this.route.snapshot.paramMap.get('id')).subscribe((res:any)=>{
        console.log( 'Lead API Data:',res);
        if(res.status == 'success'){
          const service = res?.data?.services ? res?.data?.services.split(',').map((s: string) => s.trim()) : [];
          this.form.get('services')!.setValue(service);
          this.form.patchValue({
            name: res?.data?.name,
            mobile: res?.data?.mobile,
            email: res?.data?.email,
            handled_by: res?.data?.handled_by,
          });
          localStorage.setItem('covertLeadApiData',JSON.stringify(res?.data));
        }
      });
      console.warn('Using API lead data for conversion.');
    }
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    const leadId = this.route.snapshot.paramMap.get('id');
    console.log('Converting lead with ID:', leadId);
  }

  updateRemaining() {
    const full = Number(this.form.get('fullAmount')!.value) || 0;
    const paid = Number(this.form.get('paidAmount')!.value) || 0;
    const remaining = Math.max(full - paid, 0);
    this.form.get('remainingAmount')!.setValue(remaining, { emitEvent: false });
  }

  submit() {
    if (this.form.valid) {
      this.loader.show();
      localStorage.removeItem('covertLeadData');
      const payload = { ...this.form.getRawValue(),
        next_payment_date: this.formatDateForApi(<any>this.form.value.next_payment_date) 
      };
      console.log('Convert Lead payload:', payload);

      this.api.convertLead(payload).subscribe((res:any)=>{
        this.loader.hide();
        console.log(res);
        if(res.status == 'success'){
          const url:string = `https://apis.bizregistro.com/receipt?pid=`+res?.rMail?.payDId;
          window.open(url,'popupWindow',"width=600,height=400,scrollbars=yes");
          this.router.navigate(['/clients']);
          console.log('Lead converted successfully:', res);
          this.sweetAlert('success',res.msg);
        } else {
          this.sweetAlert('error','Conversion failed: ' + res.msg);
        } 
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
  ngOnDestroy(): void {
    localStorage.removeItem('covertLeadData');
    localStorage.removeItem('covertLeadApiData');
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

  formatDateForApi(date: Date) {
    if (!date) return '';
    const dt = new Date(date);
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(dt);
    const year = parts.find(p => p.type === 'year')!.value;
    const month = parts.find(p => p.type === 'month')!.value;
    const day = parts.find(p => p.type === 'day')!.value;
    return `${year}-${month}-${day}`;
  }
}
