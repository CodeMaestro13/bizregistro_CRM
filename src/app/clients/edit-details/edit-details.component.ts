import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { indianStates } from '../../shared/constants'
import { AdminsService } from '../../admins.service';
import { tap, pluck } from 'rxjs';

@Component({
  selector: 'app-edit-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './edit-details.component.html',
  styleUrls: ['./edit-details.component.scss']
})
export class EditDetailsComponent implements OnInit, OnChanges {
  constructor(private api:AdminsService) {}
  @Input() set data(d: any) {
    if (d) {
      this.visible = true;
      this.populateForm(d);
    }
  }
  @Input() servicesList:any;
  @Input() adminList:any;
  @Output() closed = new EventEmitter<{ saved: boolean; data?: any }>();
  states:any= indianStates;
  services:any;


  visible = false;
  form: FormGroup = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    mobile: new FormControl('', [Validators.required, Validators.minLength(7)]),
    address_line1: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    postal_code: new FormControl('', [Validators.required, Validators.pattern(/^\d{5,6}$/)]),
    services: new FormControl('', [Validators.required]),
    servicesName: new FormControl(''),
    handledBy: new FormControl({ value: 0, disabled: true }, [Validators.required]),
    payment_status: new FormControl(''),
    full_amount: new FormControl('',[Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
    total_paid: new FormControl({ value: 0, disabled: true }),
    remaining_amount: new FormControl({ value: 0, disabled: true })
  });

  ngOnInit(): void {
    this.form.get('full_amount')!.valueChanges.subscribe(() => this.updateRemaining());
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && changes['data'].currentValue) {
      this.visible = true;
      this.api.getClientsServices(changes['data'].currentValue?.id).pipe(pluck('data','service_ids')).subscribe((res:any)=>{
        
        const services = res ? res.split(',').map((s: string) => s.trim()) : [];
        console.log(services);
        this.form.patchValue({
          services: services ?? [],
        });

      })
      this.populateForm(changes['data'].currentValue);
    }
    console.log('Services List:', this.servicesList);
  }

  populateForm(d: any) {
    
    
    this.form.patchValue({
      id: d.id ?? '',
      name: d.name ?? '',
      email: d.email ?? '',
      mobile: d.mobile ?? '',
      address_line1: d.address_line1 ?? '',
      city: d.city ?? '',
      state: d.state ?? '',
      postal_code: d.postal_code ?? '',
      servicesName: d.servicesName ?? '',
      handledBy: d.handleId ?? '',
      payment_status: d.payment_status ?? '',
      full_amount: d.full_amount ?? '',
      total_paid: d.total_paid,
      remaining_amount: d.remaining_amount ?? ''
    });
  }

  save() {
    if (this.form.valid) {
      const services = this.form.get('services')!.value.join(','); // Convert array to comma-separated string
      console.log('Saving client with services:', services);
      this.api.updateClient({ ...this.form.value, services }).subscribe((res:any) => {
        console.log('Client updated successfully:', res);
        this.closed.emit({ saved: true, data: { ...this.form.value, services } });
      });
      this.visible = false;
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancel() {
    this.visible = false;
    this.closed.emit({ saved: false });
  }
  
  updateRemaining() {
    const full = Number(this.form.get('full_amount')!.value) || 0;
    const paid = Number(this.form.get('total_paid')!.value) || 0;
    const remaining = Math.max(full - paid, 0);
    this.form.get('remaining_amount')!.setValue(remaining, { emitEvent: false });
  }
}