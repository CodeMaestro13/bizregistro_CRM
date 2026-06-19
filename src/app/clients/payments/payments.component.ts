import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AdminsService } from '../../admins.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
      CommonModule,
      MatIconModule,
      MatButtonModule,
      MatFormFieldModule,
      MatSelectModule,
      MatInputModule,
      MatDatepickerModule,
      MatNativeDateModule,
      ReactiveFormsModule,
      FormsModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, 
      useValue: 'en-IN' 
    }
  ],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss','../edit-details/edit-details.component.scss','../../themecomponent/tables/basic-table/basic-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentsComponent implements OnChanges {
  @Input() data:any;
  @Input() servicesList:any;
  @Input() adminList:any;
  @Output() closed = new EventEmitter<{ saved: boolean; data?: any }>();
  visible: boolean = false;
  form = new FormGroup({
    fullAmount: new FormControl({ value: '', disabled: true }),
    paidAmount: new FormControl('', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
    ttlPaid: new FormControl({ value: '', disabled: true }),
    next_payment_date: new FormControl('', [Validators.required]),
    paymentMode: new FormControl('', [Validators.required]),
    transactionId: new FormControl({ value: 'N/A', disabled: false }, [Validators.required]),
    remainingAmount: new FormControl({ value: 0, disabled: true }),
  });
  saved:boolean = false;



  constructor(private api:AdminsService,private ref: ChangeDetectorRef) {
    this.form.get('paidAmount')!.valueChanges.subscribe(() => this.updateRemaining());
    this.form.get('paymentMode')!.valueChanges.subscribe((mode: any) => {
      const txCtrl = this.form.get('transactionId')!;
      if (mode == 'cash') {
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
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.api.getPaymentDetails(changes['data'].currentValue.id).subscribe((res:any) => {
        console.log('Payment details fetched successfully:', res);
        res.data.reverse();
        this.data.paymentDetails = res;
        this.form.patchValue({
          fullAmount: this.data.full_amount,
          paidAmount: '',
          next_payment_date: '',
          paymentMode: '',
          ttlPaid: res?.ttl?.totalPaid,
          remainingAmount: res?.ttl?.totalRemaining
        });
        this.ref.markForCheck();
      });
      this.visible = true;
    }
  }
  updateRemaining() {
    console.warn('Updating remaining amount');

    const full = Number(this.form.get('fullAmount')?.value) || 0;
    const ttlPaid = Number(this.form.get('ttlPaid')?.value) || 0;
    const paid = Number(this.form.get('paidAmount')?.value) || 0;

    const control = this.form.get('paidAmount')!;
    const remaining = Math.max(full - ttlPaid - paid, 0);

    if (full - ttlPaid - paid < 0) {
      // ADD only overpay error
      control.setErrors({
        ...control.errors,
        overpay: true
      });
    } else {
      // REMOVE only overpay error
      if (control.errors) {
        const { overpay, ...otherErrors } = control.errors;
        control.setErrors(
          Object.keys(otherErrors).length ? otherErrors : null
        );
      }
    }

    this.form.get('remainingAmount')!
      .setValue(remaining, { emitEvent: false });
  }



  save(){
    if(this.form.invalid) {
      alert('Please fill all required fields correctly.');
      this.form.markAllAsTouched();
      return;
    }
    let transactionId = this.form.get('transactionId')!.value;
    if(this.form.get('paymentMode')!.value === 'cash') {
      transactionId = 'N/A';
    }
    const client_id = this.data.id;
    const payload = {
      client_id,
      payment_amount: this.form.get('paidAmount')!.value,
      payment_mode: this.form.get('paymentMode')!.value,
      next_payment_date: this.formatDateForApi(<any>this.form.value.next_payment_date),
      ttl_paid: this.form.get('ttlPaid')!.value,
      remainingAmount: this.form.get('remainingAmount')!.value,
      transaction_id: transactionId
    };
    console.log('Payment details saved:', this.data.paymentDetails);
    
    this.data = '';
    this.visible = false;
    this.api.savePayment(payload).subscribe((res:any) => {
      this.saved = true;
      this.closed.emit({ saved: this.saved, data: this.data });
      console.log('Payment saved successfully:', res);
      (res.status == 'success' ? this.sweetAlert('success', 'Payment saved successfully!') : this.sweetAlert('error', 'Failed to save payment. Please try again.'));
      const url:string = `https://apis.bizregistro.com/receipt?pid=`+res?.payId;
      window.open(url,'popupWindow',"width=600,height=400,scrollbars=yes");
      this.form.reset();
      this.ref.markForCheck();
    }, error => {
      console.error('Error saving payment:', error);
      this.sweetAlert('error', 'Failed to save payment. Please try again.');
    });
  }

  cancel() {
    this.data = '';
    this.visible = false;
    this.closed.emit({ saved: this.saved });
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

  updateStatus(data:any,d:any){
    console.log(data);
    console.log(d.target.value);
    this.api.updatePaymentStatus(data.id,d.target.value).subscribe((res:any)=>{
      console.log(res);
      this.api.getPaymentDetails(this.data.id).subscribe((res:any) => {
        console.log('Payment details fetched successfully:', res);
        res.data.reverse();
        this.data.paymentDetails = res;
        this.form.patchValue({
          fullAmount: this.data.full_amount,
          paidAmount: '',
          next_payment_date: '',
          paymentMode: '',
          ttlPaid: res?.ttl?.totalPaid,
          remainingAmount: res?.ttl?.totalRemaining
        });
        this.ref.markForCheck();
      });
      this.saved = true;
    },(err:any)=>{
      console.log(err);
    },()=>{
      console.log("payment status request completed!.🤣")
    })
  }
}
