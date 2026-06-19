import { pluck } from 'rxjs';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AdminsService } from '../../admins.service';
import { MatIconModule } from '@angular/material/icon';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-addonservice',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './addonservice.component.html',
  styleUrls: [
    './addonservice.component.scss',
    '../edit-details/edit-details.component.scss',
    '../../themecomponent/tables/basic-table/basic-table.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddonserviceComponent implements OnChanges {
  constructor(
    private ref: ChangeDetectorRef,
    private api: AdminsService,
  ) {
    this.form.get('addonFullAmt')?.valueChanges.subscribe(() => {
      this.updateRemaining();
    });
    this.form.get('newPaidAmt')?.valueChanges.subscribe(() => {
      this.updateRemaining();
    });
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
  @Input() data: any;
  @Output() closed = new EventEmitter<any>();
  visible: boolean = false;
  serviceList: any;
  onClose(closed: any = false) {
    this.data = '';
    this.closed.emit({ closed: closed });
  }
  form = new FormGroup({
    clientId: new FormControl('', Validators.required),
    services: new FormControl([], Validators.required),
    previousFullAmt: new FormControl({ value: '', disabled: true }),
    previousPaidAmt: new FormControl({ value: '', disabled: true }),
    previousRemainingAmt: new FormControl({ value: '', disabled: true }),
    addonFullAmt: new FormControl('', [
      Validators.required,
      Validators.min(1),
    ]),
    newPaidAmt: new FormControl('', [
      Validators.required,
      Validators.min(0),
    ]),
    newRemainingAmt: new FormControl({ value: '', disabled: true }),
    finalFullAmt: new FormControl({ value: '', disabled: true }),
    finalPaidAmt: new FormControl({ value: '', disabled: true }),
    finalRemainingAmt: new FormControl({ value: '', disabled: true }),
    paymentMode: new FormControl('', Validators.required),
    transactionId: new FormControl('', Validators.required),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.visible = true;
      console.log('Data changed in AddonserviceComponent:', this.data);
      this.form.patchValue({
        clientId: this.data?.id || '',
        previousFullAmt: this.data?.full_amount || 0,
        previousPaidAmt: this.data?.total_paid || 0,
        previousRemainingAmt: this.data?.remaining_amount || 0,
        finalFullAmt: this.data?.full_amount || 0,
        finalPaidAmt: this.data?.total_paid || 0,
        finalRemainingAmt: this.data?.remaining_amount || 0
      });
      this.api
        .getClientsAvailableServices(this.data?.id)
        .pipe(pluck('data'))
        .subscribe((res) => {
          console.log('Available services for client:', res);
          this.serviceList = res;
          this.ref.markForCheck();
        });
      console.log('Received data in AddonserviceComponent:', this.data);
      this.ref.markForCheck();
    }
  }

  updateRemaining() {
    const previousFull = Number(this.form.get('previousFullAmt')?.value) || 0;
    const previousPaid = Number(this.form.get('previousPaidAmt')?.value) || 0;
    const previousRemaining = Number(this.form.get('previousRemainingAmt')?.value) || 0;
    const addonFull = Number(this.form.get('addonFullAmt')?.value) || 0;
    const newPaid = Number(this.form.get('newPaidAmt')?.value) || 0;
    // Prevent over payment
    const totalAvailable = previousRemaining + addonFull;
    const safeNewPaid = newPaid > totalAvailable ? totalAvailable : newPaid;
    const newRemaining = addonFull - newPaid;
    // Final calculations
    const finalFull = previousFull + addonFull;
    const finalPaid = previousPaid + safeNewPaid;
    const finalRemaining = finalFull - finalPaid;
    // Patch values without triggering loop
    this.form.patchValue({
      newRemainingAmt: <any>newRemaining,
      finalFullAmt: <any>finalFull,
      finalPaidAmt: <any>finalPaid,
      finalRemainingAmt: <any>finalRemaining
    }, { emitEvent: false });
  }


  save(){
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const formData = {
      clientId: this.data.id,
      services: this.form.get('services')?.value,
      previousFullAmt: this.form.get('previousFullAmt')?.value,
      previousPaidAmt: this.form.get('previousPaidAmt')?.value,
      previousRemainingAmt: this.form.get('previousRemainingAmt')?.value,
      addonFullAmt: this.form.get('addonFullAmt')?.value,
      newPaidAmt: this.form.get('newPaidAmt')?.value,
      newRemainingAmt: this.form.get('newRemainingAmt')?.value,
      finalFullAmt: this.form.get('finalFullAmt')?.value,
      finalPaidAmt: this.form.get('finalPaidAmt')?.value,
      finalRemainingAmt: this.form.get('finalRemainingAmt')?.value,
      paymentMode: this.form.get('paymentMode')?.value,
      transactionId: this.form.get('transactionId')?.value
    };
    
    this.api.addonadd(formData).subscribe((res:any) => {
      console.log("Addon added:", res); 
      if(res.status == 'success'){
        const url:string = `https://apis.bizregistro.com/receipt/addon?adid=${res?.data?.addOnM}`;
        window.open(url,'popupWindow',"width=600,height=400,scrollbars=yes");
        this.sweetAlert(res.status,res.msg);
        this.onClose(true);
      }
    },(err:any)=>{
      this.sweetAlert('error', 'Failed to save data. Please try again!');
    });
  }

  sweetAlert(status: any, msg: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
    });
    Toast.fire({
      icon: status,
      title: msg,
    });
  }

}
