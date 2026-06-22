import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminsService } from '../../admins.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-quotation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule],
  templateUrl: './add-quotation.component.html',
  styleUrl: './add-quotation.component.scss'
})
export class AddQuotationComponent implements OnInit, OnChanges {
  @Input() data:any;
  @Input() services:any[]=[];
  @Output() closep= new EventEmitter<any>();


  quotationForm!: FormGroup;

selectedServices: any[] = [];
quotationServicePages: any[][] = [[]];
  isGeneratingPdf:boolean = false;

// adding the constructor
constructor(private fb:FormBuilder, private api: AdminsService) {}

ngOnInit(): void {

  this.quotationForm = this.fb.group({
    services: [[], Validators.required],
    notes: [''],
    companyName: [''],
    billingMobile: [''],
    billingEmail: [''],
    addressClient: ['']
  });

  // detect selected services
  this.quotationForm.get('services')?.valueChanges.subscribe(res => {
    this.updateSelectedServices(res || []);

  });

  this.prefillLeadServices();

}

ngOnChanges(changes: SimpleChanges): void {
  if ((changes['data'] || changes['services']) && this.quotationForm) {
    this.prefillLeadServices();
  }
}

onClose(closed:any = false) {
    this.data = '';
    this.closep.emit({'closed': closed});
  }

submitQuotation() {
  const payload = {
    lead_id: this.data?.id || this.data?.shopacttblID || this.data?.lead_id,
    services: this.selectedServices,
    notes: this.quotationForm.value.notes
  };

  console.log(payload);

  // API call
  this.api.postQuotation(payload).subscribe({
    next: (res: any) => {

      alert('Quotation Sent Successfully');

      this.onClose(true);

    },
    error: (err: any) => {
      console.log(err);
    }
  });
}

// today added 
today=new Date();

// object for the scope of work table in pdf generated  
scopeOfWorkMap: any = {
  'Udyam Aadhar': 
  [
    'MSME/Udyam application filing',
    'certificate support'
  ],
  'Shop Act': [
    'Application preparation',
    'document checking',
    'filing support',
    'certificate coordination'
  ],

  'Food License': [
    'FSSAI registration support',
    'Documentation assistance',
    'License application filing',
    'Basic compliance guidance'
  ],

  'State Food License':[
    'Eligibility check',
    'document review',
    'application preparation',
    'FSSAI portal filing',
    'license certificate coordination',
    'follow-up support'

  ],
  'Central Food License':[
    'Eligibility check',
    'document review',
    'central license application preparation',
    'FSSAI portal filing',
    'department query support',
    'license certificate coordination'
  ],
  'GST Registration': [
    'Application preparation',
    'document review',
    'GST portal filing',
    'ARN/GSTIN support'
  ],
  'GST Return':[
    'Monthly/quarterly GST return preparation',
    'filing support',
  ],
  'ITR Return': [
    'Income tax return filing support',
    'acknowledgement sharing'
  ],
  'ISO Certificate': [
    'ISO application/documentation coordination',
    'certificate support'
  ],
  'Import or Export Code Services': [
    'IEC application filing',
    'certificate support'
  ],

  'Startup India Registration':
    [
      'DPIIT application',
      'startup profile support',
      'innovation summary guidance'
    ],

  'Proprietorship':
    [
      'Proprietorship registration support',
      'document preparation',
      'filing assistance'
    ],

  'Trademark Registration':
    [
      'Trademark search',
      'class selection',
      'application filing',
      'acknowledgement support'
    ],
    'Parnership Firm': [
      'Partnership deed drafting',
      'registration support',
      'document preparation',
      'filing assistance'
    ],
    'Limited Liability Partnership': [
      'Consultation for LLP structure and business activity selection',
      'partner details review',
      'DSC application support for designated partners',
      'DIN/DPIN assistance,',
      'PAN/TAN support',
      'LLP name availability check',
      'name reservation filing, preparation of incorporation documents',
      'drafting of subscriber sheet and consent documents',
      'filing of LLP incorporation form with MCA',
      'PAN and TAN application support',
      'Certificate of Incorporation coordination',
      'LLP Agreement drafting support',
      'stamp duty guidance',
      'filing of LLP Agreement with MCA',
      'follow-up for MCA approval'
    ],

    'Private Limited Company': [
      'Consultation for company structure and business activity selection',
      'director/shareholder details review',
      'DSC application support for directors',
      'DIN assistance',
      'company name availability check',
      'name reservation filing',
      'drafting of MOA and AOA',
      'preparation of incorporation documents',
      'filing of SPICe+ incorporation forms with MCA',
      'PAN and TAN application support',
      'Certificate of Incorporation Coordination'
    ],
}

// function for getting the scope of work based on the service selected 
getScopeOfWork(serviceName:string): string[] {

  return this.scopeOfWorkMap[serviceName] || ['Scope of work details not available'];
}

private updateSelectedServices(services: any[]) {
  this.selectedServices = services.map((service: any) => {
    const serviceName = this.getServiceDisplayName(service);

    return {
      ...service,
      sName: serviceName,
      servicesName: service?.servicesName || serviceName,
      price: this.getServiceDefaultPrice(service),
      qty: service?.qty || 1,
      discount: service?.discount || 0
    };
  });
  this.quotationServicePages = this.paginateQuotationServices(this.selectedServices);
}

private getServiceDisplayName(service: any): string {
  return service?.sName || service?.servicesName || service?.name || service?.serviceName || service?.description || '';
}

private getServiceDefaultPrice(service: any): number {
  const rawPrice =
    service?.price ??
    service?.sPrice ??
    service?.servicePrice ??
    service?.servicesPrice ??
    service?.default_price ??
    service?.quotation_price ??
    service?.rate ??
    service?.amount ??
    0;

  const price = Number(rawPrice);
  return Number.isFinite(price) ? price : 0;
}

private prefillLeadServices() {
  const selectedValues = this.getLeadServiceValues();

  if (!selectedValues.length || !this.services?.length) {
    return;
  }

  const selectedServiceObjects = this.services.filter((service: any) =>
    selectedValues.some((value) => this.isSameService(service, value))
  );

  if (!selectedServiceObjects.length) {
    return;
  }

  this.quotationForm.get('services')?.setValue(selectedServiceObjects, { emitEvent: false });
  this.updateSelectedServices(selectedServiceObjects);
}

private getLeadServiceValues(): string[] {
  return [
    ...this.normalizeServiceValue(this.data?.lservices),
    ...this.normalizeServiceValue(this.data?.services),
    ...this.normalizeServiceValue(this.data?.service),
    ...this.normalizeServiceValue(this.data?.service_ids),
    ...this.normalizeServiceValue(this.data?.service_id),
    ...this.normalizeServiceValue(this.data?.serviceIds),
    ...this.normalizeServiceValue(this.data?.servicesName),
    ...this.normalizeServiceValue(this.data?.serviceName),
    ...this.normalizeServiceValue(this.data?.selected_services),
    ...this.normalizeServiceValue(this.data?.selectedServices)
  ];
}

private normalizeServiceValue(value: any): string[] {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => this.normalizeServiceValue(item));
  }

  if (typeof value === 'object') {
    return this.normalizeServiceValue(
      value?.sName ||
      value?.servicesName ||
      value?.name ||
      value?.serviceName ||
      value?.service ||
      value?.sId ||
      value?.id ||
      value?.serviceId ||
      value?.servicesTblId
    );
  }

  const stringValue = String(value).trim();

  if (!stringValue || stringValue === '[]' || stringValue.toLowerCase() === 'null') {
    return [];
  }

  if (stringValue.startsWith('[') && stringValue.endsWith(']')) {
    try {
      return this.normalizeServiceValue(JSON.parse(stringValue));
    } catch {
      return stringValue
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((item: string) => item.replace(/^['"]|['"]$/g, '').trim())
        .filter(Boolean);
    }
  }

  return stringValue.split(',').map((item: string) => item.trim()).filter(Boolean);
}

private isSameService(service: any, value: string): boolean {
  const normalizedValue = this.normalizeComparable(value);
  const serviceValues = [
    service?.sId,
    service?.id,
    service?.servicesTblId,
    service?.serviceId,
    service?.sName,
    service?.servicesName,
    service?.name
  ];

  return serviceValues.some((serviceValue) => this.normalizeComparable(serviceValue) === normalizedValue);
}

private normalizeComparable(value: any): string {
  return String(value ?? '').trim().toLowerCase();
}

private paginateQuotationServices(services: any[]): any[][] {
  if (!services.length) {
    return [[]];
  }

  const pages: any[][] = [];
  let currentPage: any[] = [];
  let currentPageWeight = 0;
  let pageIndex = 0;

  for (const service of services) {
    const rowWeight = this.getServiceRowWeight(service.sName);
    const maxPageWeight = pageIndex === 0 ? 22 : 34;
    const pageIsFull = currentPage.length >= 5;
    const scopeDoesNotFit = currentPageWeight + rowWeight > maxPageWeight;

    if (currentPage.length && (pageIsFull || scopeDoesNotFit)) {
      pages.push(currentPage);
      currentPage = [];
      currentPageWeight = 0;
      pageIndex++;
    }

    currentPage.push(service);
    currentPageWeight += rowWeight;
  }

  if (currentPage.length) {
    pages.push(currentPage);
  }

  return pages;
}

private getServiceRowWeight(serviceName: string): number {
  const scopeLines = this.getScopeOfWork(serviceName).reduce(
    (total, scope) => total + Math.max(1, Math.ceil(scope.length / 42)),
    0
  );

  return scopeLines + 1;
}

getServiceNumber(pageIndex: number, itemIndex: number): number {
  return this.quotationServicePages
    .slice(0, pageIndex)
    .reduce((total, page) => total + page.length, 0) + itemIndex + 1;
}

async savePdf() {
  if (!this.selectedServices.length) {
    alert('Please select at least one service');
    return;
  }

  const data = document.getElementById('quotationPdf');

  if (!data) {
    alert('Quotation content not found');
    return;
  }

  const pages = Array.from(data.querySelectorAll<HTMLElement>('.pdf-page'));

  if (!pages.length) {
    alert('Quotation pages not found');
    return;
  }

  // i have to start the loader 
  this.isGeneratingPdf = true;
  data.classList.add('pdf-rendering');

  let pdf: jsPDF;

  try {
    await new Promise(resolve => setTimeout(resolve, 50));
    await this.waitForPdfAssets(data);

    pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        // scale: 1.25,
        scale:4,
        useCORS: true,
        backgroundColor: '#ffffff',
        allowTaint: false,
        imageTimeout: 1500,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: pages[i].scrollWidth,
        windowHeight: pages[i].scrollHeight
      });

      if (i > 0) {
        pdf.addPage();
      }

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    }
  } catch (error) {
    console.error('PDF generation failed', error);
    alert('PDF generation failed. See console for details.');
    this.isGeneratingPdf = false;
    data.classList.remove('pdf-rendering');
    return;
  }

  pdf.save(`quotation-${this.data?.name || 'lead'}.pdf`);

  try {
    await this.saveQuotationToBackend();
    this.closep.emit({ saved: true, refresh: true });
  } catch (error) {
    console.error('Quotation PDF was generated, but backend save failed', error);
    alert(`PDF generated, but quotation was not saved in backend. ${this.getSaveErrorMessage(error)}`);
  } finally {
    this.isGeneratingPdf = false;
    data.classList.remove('pdf-rendering');
  }
}

private async saveQuotationToBackend() {
  const response: any = await firstValueFrom(this.api.createQuotation(this.buildQuotationPayload()));

  if (response?.status && response.status !== 'success') {
    throw new Error(response?.msg || response?.message || 'Quotation save failed');
  }

  return response;
}

private getSaveErrorMessage(error: any) {
  if (error?.status === 0) {
    return 'The request was blocked or the backend is unreachable. Check CORS/OPTIONS for Quotation/create.';
  }

  return error?.error?.msg || error?.error?.message || error?.message || 'Please check Quotation/create backend response.';
}

private buildQuotationPayload() {
  const quotationDate = this.formatDateForApi(this.today);
  const validUntil = new Date(this.today);
  validUntil.setDate(validUntil.getDate() + 10);
  const quotationServices = this.buildQuotationServicesPayload();

  return {
    lead_id: this.data?.id || this.data?.shopacttblID || this.data?.lead_id,
    created_by: this.getCurrentAdminId(),
    quotation_date: quotationDate,
    valid_until: this.formatDateForApi(validUntil),
    subtotal: this.getSubTotal(),
    discount_amount: this.getDiscountTotal(),
    tax_amount: '0.00',
    total_amount: this.getGrandTotal(),
    notes: this.quotationForm.value.notes || '',
    status: 'sent',
    billing: {
      company_name: this.quotationForm.value.companyName || this.data?.name || '',
      mobile: this.quotationForm.value.billingMobile || this.data?.mobile || '',
      email: this.quotationForm.value.billingEmail || this.data?.email || '',
      address: this.quotationForm.value.addressClient || this.data?.address || ''
    },
    services: quotationServices,
    items: quotationServices
  };
}

private buildQuotationServicesPayload() {
  return this.selectedServices.map((item: any) => {
    const qty = Number(item.qty || 1);
    const unitPrice = Number(item.price || 0);
    const discount = Number(item.discount || 0);
    const lineTotal = (unitPrice * qty) - discount;

    return {
      service_id: item?.sId || item?.id || item?.serviceId || item?.servicesTblId || '',
      description: item?.sName || item?.servicesName || item?.name || '',
      service_name: item?.sName || item?.servicesName || item?.name || '',
      sName: item?.sName || item?.servicesName || item?.name || '',
      qty: qty.toFixed(2),
      quantity: qty.toFixed(2),
      unit_price: unitPrice.toFixed(2),
      price: unitPrice.toFixed(2),
      discount: discount.toFixed(2),
      tax_rate: '0.00',
      tax_amount: '0.00',
      line_total: lineTotal.toFixed(2),
      total: lineTotal.toFixed(2)
    };
  });
}

private formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

private getCurrentAdminId() {
  try {
    const user = JSON.parse(localStorage.getItem('biz-user') || '{}');
    return user?.aId || user?.id || user?.admin_id || '';
  } catch {
    return '';
  }
}

private async waitForPdfAssets(data: HTMLElement) {
  const timeout = (milliseconds: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
  const fontReady = (document as any).fonts?.ready ?? Promise.resolve();
  const imageReady = Array.from(data.querySelectorAll('img')).map((image) => {
    if (image.complete) {
      return Promise.resolve();
    }

    return Promise.race([
      new Promise<void>((resolve) => {
        image.onload = () => resolve();
        image.onerror = () => resolve();
      }),
      timeout(1500)
    ]);
  });

  await Promise.all([Promise.race([fontReady, timeout(1500)]), ...imageReady]);
}

getGrandTotal() {

  return this.selectedServices.reduce(

    (sum: number, item: any) => {

      const subtotal =
        item.price * item.qty;

      const total =
        subtotal - Number(item.discount || 0);

      return sum + total;

    },

    0

  ).toFixed(2);

}

getSubTotal() {

  return this.selectedServices.reduce(

    (sum: number, item: any) => {

      return sum + (item.price * item.qty);

    },

    0

  ).toFixed(2);

}

getDiscountTotal() {

  return this.selectedServices.reduce(

    (sum: number, item: any) => {

      return sum + Number(item.discount || 0);

    },

    0

  ).toFixed(2);

}

// for sending the quotation through whatsapp
sendWhatsApp(){
}


}
