import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AdminsService } from '../../admins.service';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule, MatDateRangeInput } from '@angular/material/datepicker';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, filter, fromEvent, interval, map, Observable, of, pluck, Subscription, switchMap, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { CdkTableModule } from "@angular/cdk/table";
import { CustomizerSettingsService } from '../../themecomponent/customizer-settings/customizer-settings.service';
import { MatDialog } from '@angular/material/dialog';
import { LoaderService } from '../../shared/loader/loader.service';
import { AddActivityComponent } from '../add-activity/add-activity.component';
import { AddNewLeadComponent } from '../add-new-lead/add-new-lead.component';
import { GetCsvComponent } from '../get-csv/get-csv.component';
import { AddQuotationComponent } from '../add-quotation/add-quotation.component';




@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, MatCardModule, MatAutocompleteModule, MatDateRangeInput, MatButtonModule, MatMenuModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatIconModule, MatDatepickerModule, CdkTableModule,AddActivityComponent,AddNewLeadComponent,GetCsvComponent,AddQuotationComponent],
  templateUrl: './leads.component.html',
  styleUrl: './leads.component.scss'
})

export class LeadsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('nameInput2') nameInput2!: ElementRef<HTMLInputElement>;
  @ViewChild('mobileInput2') mobileInput2!: ElementRef<HTMLInputElement>;
  @ViewChild('emailInput2') emailInput2!:ElementRef<HTMLInputElement>;

  bdedet:any = JSON.parse(<any>localStorage.getItem('biz-user'));
  actData:any;
  actTab:boolean = false;
  autoRefreshSub!: Subscription;
  constructor(private api: AdminsService,
    public dialog: MatDialog,
    public themeService: CustomizerSettingsService,
    private loader:LoaderService
  ) { }
  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleRTLEnabledTheme() {
    this.themeService.toggleRTLEnabledTheme();
  }
  addActivity(item:any){
    this.actData = item;
    this.actTab = true;
  }
  closepage(elmt:any) {
    console.log(elmt.closed);
    this.actTab = false;
    if(elmt.closed){
      this.getLeads();
    }
  }
  hide = true;
  namelist: any;
  numberList: any;
  emailList: any;
  services: any;
  assignedTo: Observable<any> = this.api.bde().pipe(pluck('data'),tap((res:any)=> localStorage.setItem('bdeList',JSON.stringify(res)) ));
  shopActList: any;
  getCountStatus:any;
  statusList:any;
  pageNo:Number = 1;
  ttlPage:any;
  campaignList:any;
  sourceList:any;
  ngOnInit(): void {
    this.api.campaignList().pipe(pluck('data')).subscribe((res:any) => {
      this.campaignList = res;
    });
    this.api.source().pipe(pluck('data')).subscribe((res:any) => {
      this.sourceList = res;
    });
    this.getLeads();
    this.api.status().pipe(pluck('data')).subscribe((res:any) => {
      this.statusList = res;
    });
    this.api.services().pipe(pluck('data')).subscribe((res:any) => {
      this.services = res;
    });
    this.autoRefreshSub = interval(60000).subscribe(() => {
      this.getLeads();
    });

    // throw new Error('Method not implemented.');
  }

  leadfilter = new FormGroup({
    status:new FormControl(''),
    name: new FormControl(''),
    email: new FormControl(''),
    mobile: new FormControl(''),
    service: new FormControl(''),
    assignedTo: new FormControl(''),
    dateFrom: new FormControl(''),
    dateTo: new FormControl(''),
    campaign: new FormControl(''),
    source: new FormControl(''),
    page: new FormControl(this.pageNo)
  });
  apiSub!: Subscription;
  getLeads() {
    if(this.apiSub){
      this.apiSub.unsubscribe();
    }
    this.loader.show();
    const dateFrom = this.leadfilter.value.dateFrom;
    const startDateRaw = dateFrom ? new Date(dateFrom) : null;
    // if (startDateRaw) {
    //   let startDateFormatted = `${startDateRaw.getFullYear()}-${String(startDateRaw.getMonth() + 1).padStart(2, '0')}-${String(startDateRaw.getDate()).padStart(2, '0')}`;
    // }
    const dateTo = this.leadfilter.value.dateTo;
    const endDateRaw = dateTo ? new Date(dateTo) : null;
    // if (endDateRaw) {
    //   let endDateFormatted = `${endDateRaw.getFullYear()}-${String(endDateRaw.getMonth() + 1).padStart(2, '0')}-${String(endDateRaw.getDate()).padStart(2, '0')}`;
    // }
    const filterData = {
      ...this.leadfilter.value,
      dateFrom: startDateRaw ? `${startDateRaw.getFullYear()}-${String(startDateRaw.getMonth() + 1).padStart(2, '0')}-${String(startDateRaw.getDate()).padStart(2, '0')}` : '',
      dateTo: endDateRaw ? `${endDateRaw.getFullYear()}-${String(endDateRaw.getMonth() + 1).padStart(2, '0')}-${String(endDateRaw.getDate()).padStart(2, '0')}` : ''
    };

    this.apiSub = this.api.leads(filterData).subscribe((res: any) => {
      this.loader.hide();
      console.log(res);
      this.shopActList = res?.filter;
      this.getCountStatus = res?.getCountStatus;
      console.log(this.getCountStatus);
      this.ttlPage = res?.pages?.total;
      this.sweetAlert('success','New Leads Update👍');
    });
  }
  clear() {
    this.leadfilter.reset();
    this.namelist = [];
    this.numberList = [];
    this.emailList = [];
    this.getLeads();
  }

  ngAfterViewInit(): void {
    
    let lastValue = '';
    fromEvent(this.nameInput2.nativeElement, 'input').pipe(
      map((event: any) => event.target.value.trim()),
      debounceTime(300),
      distinctUntilChanged(),

      switchMap((value: string) => {

        // Prevent repeated alerts
        if (value.length <= 3) {
          if (lastValue !== value) {
            this.sweetAlert('warning', "Minimum 4 characters required") 
            lastValue = value;
          }
          this.namelist = [];
          return [];
        }

        lastValue = value;

        return this.api.serchBy('name', value).pipe(
          map((res: any) => res.data ?? [])
        );
      })
    ).subscribe({
      next: (res: any) => {
        this.namelist = res;

        if (res.length === 0) {
          this.sweetAlert('info','No Results Found')
        }
      },
      error: () => {
        this.namelist = [];
        this.sweetAlert('error','Server Error')
      }
    });



    let previousSearch = ''; // ✅ changed variable name
    fromEvent(this.mobileInput2.nativeElement, 'input').pipe(
      map((event: any) => event.target.value.trim()),
      debounceTime(300),
      distinctUntilChanged(),

      switchMap((value: string) => {

        // ❌ Length validation
        if (value.length <= 1) {
          this.numberList = [];

          if (previousSearch !== value) {
            Swal.fire({
              icon: 'warning',
              title: 'Enter valid mobile',
              text: 'Please enter at least 4 digits'
            });
            previousSearch = value;
          }

          return of([]);
        }

        previousSearch = value;

        // ✅ API call
        return this.api.searchbyMobile(value).pipe(
          map((res: any) => res.data ?? [])
        );
      })
    ).subscribe({
      next: (res: any) => {
        this.numberList = res;

        // ❌ No results
        if (res.length === 0) {
          this.sweetAlert('info','Enter Minimum 3 Characters');
        }
      },
      error: () => {
        this.numberList = [];
        this.sweetAlert('error','Something Wen\'t Wrong!')
      }
    });




    let prevEmailSearch = ''; // ✅ different variable

    fromEvent(this.emailInput2.nativeElement, 'input').pipe(
      map((event: any) => event.target.value.trim()),
      debounceTime(300),
      distinctUntilChanged(),

      switchMap((value: string) => {

        // ❌ Length validation
        if (value.length <= 3) {
          this.emailList = [];

          if (prevEmailSearch !== value) {
            this.sweetAlert('warning','Please enter at least 4 characters');
            prevEmailSearch = value;
          }

          return of([]);
        }

        prevEmailSearch = value;

        // ✅ API Call
        return this.api.serchBy('email', value).pipe(
          map((res: any) => res.data ?? [])
        );
      })
    ).subscribe({
      next: (res: any) => {
        this.emailList = res;

        // ❌ No results
        if (res.length === 0) {
          this.sweetAlert('info','No Email Data Found!');
        }
      },
      error: () => {
        this.emailList = [];
        this.sweetAlert('error','Something Wen\'t Wrong!');
      }
    });

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

  serviceArray(element: any) {
    return element ? element.split(',') : [];
  }

  addCallAct(item: any) {
    const leadId = item?.shopacttblID;
    this.loader.show();
    window.scrollTo({
      top: 500,
      behavior: 'smooth'
    });
    this.api.addCallAct({ leadId: leadId }).subscribe((res: any) => {
      this.loader.hide();
      if (res.status === 'success') {
        this.leadfilter.get('status')?.setValue('7');
        this.getLeads();
        this.sweetAlert('success', 'Call Activity Added!');
      } else {
        this.sweetAlert(res.status, res.msg);
      }
    }, ((error: any) => {
      this.sweetAlert('error', "Something Wen't Wrong Please Try Again.");
    }), (() => {
      console.log('Call Activity API Closed!');
    }))
  }

  deleteLead(item: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This lead will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {

        const leadId = item?.shopacttblID;
        this.loader.show();

        this.api.deletelead({ leadId: leadId }).subscribe((res: any) => {
            this.getLeads();
            this.loader.hide();
            if (res.status === 'success') {
              this.sweetAlert('success', 'Lead successfully deleted');
            } else {
              this.sweetAlert(res.status, res.msg);
            }
          },(error:any) => {
            this.loader.hide();
            this.sweetAlert('error', "Something went wrong. Please try again!");
          },() => {
            console.warn('Lead Delete Function Closed!');
          });
      }
    });
  }

  pagination(page:any){
    window.scrollTo({
      top: 500,
      behavior: 'smooth'
    });
    let pageN = this.pageNo
    if(page == 'last'){
      pageN = this.ttlPage;
    }else if(page == 'next'){
      if(this.pageNo == this.ttlPage){
        pageN = <any>this.pageNo;
      }else{
        pageN = <any>this.pageNo + 1;
      }
    }else if(page == 'first'){
      pageN = 1
    }else if(page == 'privious'){
      if(this.pageNo == 1){
        pageN = 1
      }else{
        pageN = <any>this.pageNo - 1;
      }
    }
    
    console.log(pageN);
    this.pageNo = pageN;
    this.leadfilter.get('page')?.setValue(this.pageNo);
    this.getLeads();
  }
  addNewLead:any = false;
  openAddNewLead(){
    // alert('open New Lead Modal')
    this.addNewLead = true;
  }

  closedAddNewLead(data:any){
    console.log(data.saved);
    if(data.saved){
      this.getLeads();
    }
    this.addNewLead = false;
  }

  ngOnDestroy(): void {
    if (this.autoRefreshSub) {
      this.autoRefreshSub.unsubscribe();
    }
  }
  capitalizeFirstLetterRegex(string:any) {
      return string.split(' ').map( (res:any) => res.charAt(0).toUpperCase() + res.slice(1).toLowerCase()).join(' ');
  }
  getStatusColor(statusName: string): string {
    switch (statusName?.toLowerCase()) {
      case 'highly interested':
        return '#006400'; // Dark Green

      case 'converted':
        return '#ff0000'; // Red

      case 'not interested / cancel':
        return '#ff69b4'; // Pink

      case 'cold lead':
        return '#800080'; // Purple

      case 'will send doc.':
        return '#ffc107'; // Yellow

      case 'will visit office':
        return '#ff9800'; // Orange

      default:
        return '#347ab7'; // Default Blue
    }
  }  
  whatsapp(item:any){
    const mobile = item?.mobile;
    const formattedMobile = mobile.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${formattedMobile}`;
    window.open(whatsappUrl, '_blank');
  }

  csvForm:any = false;
  getCSVLeads(){
    this.csvForm = true;
  }

  closed(data:any){
    if(data.refresh){
      this.getLeads();
    }
    this.csvForm = false;
  }

  // added for qutation feature 

  selectedLead:any=null;
  showQutationModal=false;
  openAddQuotation(item:any){
    this.selectedLead = item;
    this.showQutationModal = true;
  }

  // on close of the qutation 
  onQutationClosed(event:any){
    this.showQutationModal=false;
    this.selectedLead = null;
    if(event.refresh){
      this.getLeads();
    }
  }

}
