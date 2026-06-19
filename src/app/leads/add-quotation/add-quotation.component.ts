import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminsService } from '../../admins.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-add-quotation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule],
  templateUrl: './add-quotation.component.html',
  styleUrl: './add-quotation.component.scss'
})
export class AddQuotationComponent {
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

    this.selectedServices = res.map((service: any) => ({
      ...service,
      price: this.priceMap[service.sName] || '',
      qty: 1,
      discount: 0
    }));
    this.quotationServicePages = this.paginateQuotationServices(this.selectedServices);

  });

}

onClose(closed:any = false) {
    this.data = '';
    this.closep.emit({'closed': closed});
  }

submitQuotation() {
  const payload = {
    lead_id: this.data.id,
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

// OBJECT FOR PRICE SELECTION BASED ON THE SERVICE SELECTED
priceMap: any = {
  'Udyam Aadhar': 999,
  'Shop Act': 999,
  'Food License': 3499,
  'State Food License': 9999,
  'Central Food License': 19999,
  'GST Registration': 1999,
  'GST Return': 999,
  'ITR Return': 1999,
  'ISO Certificate': 5999,
  'Import or Export Code Services': 3999,
  'Startup India Registration': 9999,
  'Proprietorship': 1499,
  'Trademark Registration': 13500,
  'Partnership Firm': 9999,
  'Limited Liability Partnership': 19999,
  'Private Limited Company': 19999
};

async savePdf() {
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

  try {
    await new Promise(resolve => setTimeout(resolve, 50));
    await this.waitForPdfAssets(data);

    const pdf = new jsPDF('p', 'mm', 'a4');
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

    pdf.save(`quotation-${this.data?.name || 'lead'}.pdf`);
  } catch (error) {
    console.error('PDF generation failed', error);
    alert('PDF generation failed. See console for details.');
  } finally {
    this.isGeneratingPdf = false;
    data.classList.remove('pdf-rendering');
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
