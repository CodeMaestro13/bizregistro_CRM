import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, fromEvent, map, pluck, Subject, Subscription, takeUntil } from 'rxjs';
import { AdminsService } from '../../admins.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddonserviceComponent } from '../../clients/addonservice/addonservice.component';
import { EditDetailsComponent } from '../../clients/edit-details/edit-details.component';
import { PaymentsComponent } from '../../clients/payments/payments.component';
import { WorkProcessFormComponent } from '../../clients/work-process-form/work-process-form.component';
import Swal from 'sweetalert2';
import { CustomizerSettingsService } from '../../components/customizer-settings/customizer-settings.service';
import { LoaderService } from '../../shared/loader/loader.service';

@Component({
  selector: 'app-pending',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatMenuModule,
    EditDetailsComponent,
    PaymentsComponent,
    AddonserviceComponent,
    WorkProcessFormComponent
  ],
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss','../../clients/clients/clients.component.scss']
})
export class PendingComponent implements OnInit, OnDestroy {
  @ViewChild('nameInput') nameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput') emailInput!: ElementRef<HTMLInputElement>;
  @ViewChild('mobileInput') mobileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('pageInput') pageInput!: ElementRef<HTMLInputElement>;

  services: any;
  deleteLead: any = 0;
  clientsList: any;
  admins: any;
  selectedClient: any = null;

  namelist: any = [];
  emailList: any = [];
  numberList: any = [];

  clientFilter = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    mobile: new FormControl(''),
    service: new FormControl(''),
    handledBy: new FormControl(''),
    dateFrom: new FormControl(''),
    dateTo: new FormControl(''),
    page: new FormControl(1),
    payment_status:new FormControl('PARTIAL')
  });

  pageNo: number = 1;
  ttlPage: number = 1;

  // Button colors
  addButtonColor = '#0d6efd';
  submitButtonColor = '#198754';
  cancelButtonColor = '#fd7e14';
  actionButtonColors = {
    edit: '#6f42c1',
    delete: '#dc3545',
  };

  constructor(
    private api: AdminsService,
    public themeService: CustomizerSettingsService,
    private renderer: Renderer2,
    private loader: LoaderService,
  ) {
    const biz_user = JSON.parse(localStorage.getItem('biz-user') || '{}');
    this.deleteLead = parseInt(biz_user?.deleteLead || 0);
    console.log('Logged in user this.deleteLead:', this.deleteLead);
  }

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.getClients();
    this.api.services().pipe(pluck('data')).subscribe((res: any) => {
      this.services = res;
      console.log('Services loaded:', this.services);
    });
    this.api.bde().pipe(pluck('data')).subscribe((res: any) => {
      this.admins = res;
      console.log('Admins loaded:', this.admins);
    });
  }

  getClients() {
    // Load clients from API or use static list
    const serviceVal = this.clientFilter.get('service')?.value;
    const services = Array.isArray(serviceVal)
      ? serviceVal.map((s: any) => s).join(',')
      : '';
    const payload = { ...this.clientFilter.value, services };
    this.api.pendingPaymentData(payload).subscribe((res: any) => {
      this.clientsList = res?.data?.list;
      this.ttlPage = res?.data?.pagination?.total_pages;
      console.log('Clients loaded:', this.clientsList);
    });
  }

  filterClients() {
    const filterData = this.clientFilter.value;
    console.log('Filtering clients with:', filterData);
    this.getClients();
    // Apply filter logic here
  }

  clear() {
    this.clientFilter.reset();
    this.namelist = [];
    this.emailList = [];
    this.numberList = [];
    this.pageNo = 1;

    this.clientFilter.get('page')?.setValue(this.pageNo);
    this.clientFilter.get('payment_status')?.setValue('PARTIAL');
    this.getClients();
  }

  serviceArray(element: any) {
    return element ? element.split(',') : [];
  }

  deleteClient(item: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This client will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.deleteClient(item.id).subscribe({
          next: (res: any) => {
            this.getClients();
            this.sweetAlert('success', 'Client has been deleted.');
          },
          error: (err: any) => {
            this.sweetAlert(err.error?.status, err.error?.msg);
          },
        });
        console.log('Deleting client:', item.id);
      }
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

  pagination(page: any) {
    let pageN = this.pageNo;
    if (page == 'last') {
      pageN = this.ttlPage;
    } else if (page == 'next') {
      if (this.pageNo == this.ttlPage) {
        pageN = <any>this.pageNo;
      } else {
        pageN = <any>this.pageNo + 1;
      }
    } else if (page == 'first') {
      pageN = 1;
    } else if (page == 'privious') {
      if (this.pageNo == 1) {
        pageN = 1;
      } else {
        pageN = <any>this.pageNo - 1;
      }
    }

    console.log(pageN);
    this.pageNo = pageN;
    this.clientFilter.get('page')?.setValue(this.pageNo);
    this.getClients();
    window.scrollTo({
      top: 500,
      behavior: 'smooth',
    });
  }

  ngAfterViewInit(): void {
    if (this.pageInput && this.pageInput.nativeElement) {
      fromEvent<InputEvent>(this.pageInput.nativeElement, 'input')
        .pipe(
          map((event) => +(event.target as HTMLInputElement).value),
          debounceTime(400),
          distinctUntilChanged(),
          filter((page) => !isNaN(page)),
          takeUntil(this.destroy$),
        )
        .subscribe((page) => {
          if (page <= 1) {
            page = 1;
          }
          if (page >= <any>this.ttlPage) {
            page = <any>this.ttlPage;
          }
          this.pageNo = page;
          this.clientFilter.get('page')?.setValue(page);
          this.getClients();
        });
    }

    /* helper that wires any input to its endpoint */
    const wire = (
      el: ElementRef<HTMLInputElement>,
      type: 'name' | 'mobile' | 'email',
      listProp: 'namelist' | 'numberList' | 'emailList',
      minLen: number,
      msg: string,
    ) => {
      if (!el || !el.nativeElement) {
        return;
      }

      fromEvent<InputEvent>(el.nativeElement, 'input')
        .pipe(
          map((e) => (e.target as HTMLInputElement).value.trim()),
          debounceTime(300),
          distinctUntilChanged(),
          takeUntil(this.destroy$),
        )
        .subscribe((value: any) => {
          if (!value) {
            this[listProp] = [];
            return;
          }
          if (value.length < minLen) {
            this[listProp] = [];
            this.sweetAlert('info', msg);
            return;
          }

          this.api.serchClientBy(type, value).subscribe({
            next: (res: any) => (this[listProp] = res.data ?? []),
            error: (err: any) => {
              this[listProp] = [];
              this.sweetAlert(err.error?.status, err.error?.msg);
            },
          });
        });
    };
    wire(
      this.nameInput,
      'name',
      'namelist',
      3,
      'Please enter at least 3 characters!',
    );
    wire(
      this.mobileInput,
      'mobile',
      'numberList',
      3,
      'Please enter at least 3 digits!',
    );
    wire(
      this.emailInput,
      'email',
      'emailList',
      3,
      'Please enter at least 3 characters!',
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  editClient(item: any) {
    this.selectedClient = item;
    console.log('Edit client:', item);
    // Navigate to edit page or open modal
  }

  closeEditDetails(event: any) {
    this.selectedClient = null;
    console.log('Edit details closed:', event.saved);
    if (event.saved) {
      this.getClients();
    }
  }
  clientPayment: any;
  payment(item: any) {
    this.clientPayment = item;
    console.log('Payment for client:', item);
    // Navigate to payment page or open payment modal
  }

  closePaymentDetails(event: any) {
    this.clientPayment = null;
    console.log('Payment details closed:', event.saved);
    if (event.saved) {
      this.getClients();
    }
  }

  addOnClientDetails: any;
  addOnClient(item: any) {
    this.addOnClientDetails = item;
    console.log('Add on for client:', item);
  }

  closeAddOnDetails(event: any) {
    this.addOnClientDetails = null;
    console.log('Add-on details closed:', event.closed);
    if (event.closed) {
      this.getClients();
    }
  }

  workFormDat: any = '';
  openWorkForm(item: any) {
    this.workFormDat = item;
    console.log('Open work form for client:', item);
  }

  closedWorkForm(elmt: any) {
    this.workFormDat = null;
    console.log('Work form closed:', elmt.saved);
    if (elmt.saved == true) {
      this.getClients();
    }
  }



}
