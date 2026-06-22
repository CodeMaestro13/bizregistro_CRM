import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminsService } from '../../admins.service';
import { LoaderService } from '../../shared/loader/loader.service';
import { AddQuotationComponent } from '../add-quotation/add-quotation.component';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-lead-details',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule, AddQuotationComponent],
  templateUrl: './lead-details.component.html',
  styleUrl: './lead-details.component.scss'
})
export class LeadDetailsComponent implements OnInit, OnDestroy {
  leadId = '';
  lead: any = history.state?.lead || null;
  activities: any[] = [];
  quotations: any[] = [];
  quotationPreview: any = null;
  isQuotationPreviewOpen = false;
  isQuotationPreviewLoading = false;
  isQuotationDownloading = false;
  services: any[] = [];
  leadServices: string[] = [];
  selectedLead: any = null;
  showQuotationModal = false;
  bdeList: any[] = localStorage.getItem('bdeList') ? JSON.parse(localStorage.getItem('bdeList')!) : [];
  private sub?: Subscription;
  private previewSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private api: AdminsService,
    private loader: LoaderService
  ) {}

  ngOnInit(): void {
    this.leadId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.leadId) {
      return;
    }
    this.getdata();
  }

  getdata(){
    this.loader.show();
    this.sub = forkJoin({
      lead: this.api.lead(this.leadId).pipe(catchError(() => of(null))),
      activities: this.api.getAct(this.leadId).pipe(catchError(() => of(null))),
      services: this.api.services().pipe(catchError(() => of(null))),
      serviceCatalog: this.api.getServices().pipe(catchError(() => of(null))),
      quotations: this.api.getLeadQuotations(this.leadId).pipe(catchError(() => of(null)))
    }).subscribe({
      next: (res: any) => {
        const leadData = this.normalizeLeadResponse(res?.lead);
        this.services = this.mergeServicePriceLists(
          this.normalizeListResponse(res?.services),
          this.normalizeListResponse(res?.serviceCatalog)
        );
        this.lead = this.mergeLeadData(this.lead, leadData);
        this.activities = this.normalizeListResponse(res?.activities);
        this.quotations = this.normalizeQuotationHistory(res?.quotations);
        this.leadServices = this.resolveLeadServices(this.lead);
      },
      complete: () => this.loader.hide(),
      error: () => this.loader.hide()
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.previewSub?.unsubscribe();
  }

  serviceArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value.flatMap((item: any) => this.normalizeServiceValue(item));
    }

    return this.normalizeServiceValue(value);
  }

  getLeadServices(): string[] {
    return this.leadServices;
  }

  getDisplay(value: any, fallback = 'N/A') {
    return value === null || value === undefined || value === '' ? fallback : value;
  }

  getLeadTakenBy() {
    const handledBy = this.lead?.handled_by || this.lead?.handledBy || this.lead?.taken_by || this.lead?.takenBy;

    if (handledBy && Number.isNaN(Number(handledBy))) {
      return handledBy;
    }

    const handledById = handledBy || this.lead?.adId || this.lead?.admin_id || this.lead?.assignedTo;
    const bde = this.bdeList.find((item: any) => String(item?.aId) === String(handledById));

    return bde?.aName || handledBy || 'N/A';
  }

  getTotalQuotationAmount(quotation: any) {
    const services = quotation?.services || quotation?.items || [];

    if (!Array.isArray(services)) {
      return quotation?.amount || quotation?.total || quotation?.grandTotal || '';
    }

    return services.reduce((sum: number, item: any) => {
      const price = Number(item?.price || item?.amount || 0);
      const qty = Number(item?.qty || item?.quantity || 1);
      const discount = Number(item?.discount || 0);
      return sum + (price * qty) - discount;
    }, 0);
  }

  getMoney(value: any) {
    const amount = Number(value || 0);
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  getScopeOfWork(serviceName: string): string[] {
    const scopeOfWorkMap: any = {
      'Udyam Aadhar': ['MSME/Udyam application filing', 'certificate support'],
      'Shop Act': ['Application preparation', 'document checking', 'filing support', 'certificate coordination'],
      'Food License': ['FSSAI registration support', 'Documentation assistance', 'License application filing', 'Basic compliance guidance'],
      'State Food License': ['Eligibility check', 'document review', 'application preparation', 'FSSAI portal filing', 'license certificate coordination', 'follow-up support'],
      'Central Food License': ['Eligibility check', 'document review', 'central license application preparation', 'FSSAI portal filing', 'department query support', 'license certificate coordination'],
      'GST Registration': ['Application preparation', 'document review', 'GST portal filing', 'ARN/GSTIN support'],
      'GST Return': ['Monthly/quarterly GST return preparation', 'filing support'],
      'ITR Return': ['Income tax return filing support', 'acknowledgement sharing'],
      'ISO Certificate': ['ISO application/documentation coordination', 'certificate support'],
      'Import or Export Code Services': ['IEC application filing', 'certificate support'],
      'Startup India Registration': ['DPIIT application', 'startup profile support', 'innovation summary guidance'],
      'Proprietorship': ['Proprietorship registration support', 'document preparation', 'filing assistance'],
      'Trademark Registration': ['Trademark search', 'class selection', 'application filing', 'acknowledgement support'],
      'Partnership Firm': ['Partnership deed drafting', 'registration support', 'document preparation', 'filing assistance'],
      'Limited Liability Partnership': ['Consultation for LLP structure and business activity selection', 'partner details review', 'DSC application support for designated partners', 'DIN/DPIN assistance', 'PAN/TAN support', 'LLP name availability check', 'name reservation filing', 'preparation of incorporation documents', 'LLP Agreement drafting support'],
      'Private Limited Company': ['Consultation for company structure and business activity selection', 'director/shareholder details review', 'DSC application support for directors', 'DIN assistance', 'company name availability check', 'name reservation filing', 'drafting of MOA and AOA', 'preparation of incorporation documents', 'filing of SPICe+ incorporation forms with MCA', 'PAN and TAN application support', 'Certificate of Incorporation Coordination']
    };

    return scopeOfWorkMap[serviceName] || ['Scope of work details not available'];
  }

  openAddQuotation() {
    this.selectedLead = this.normalizeQuotationLead(this.lead);
    this.showQuotationModal = true;
  }

  onQuotationClosed(event?: any) {
    this.showQuotationModal = false;
    this.selectedLead = null;

    if (event?.refresh) {
      this.refreshQuotationHistory();
      this.getdata();
    }
  }

  previewQuotation(quotation: any) {
    const quotationId = quotation?.id;

    if (!quotationId) {
      return;
    }

    this.previewSub?.unsubscribe();
    this.isQuotationPreviewOpen = true;
    this.isQuotationPreviewLoading = true;
    this.quotationPreview = null;

    this.previewSub = this.api.viewQuotation(quotationId).subscribe({
      next: (res: any) => {
        this.quotationPreview = res?.data || null;
      },
      complete: () => {
        this.isQuotationPreviewLoading = false;
      },
      error: () => {
        this.isQuotationPreviewLoading = false;
      }
    });
  }

  closeQuotationPreview() {
    this.previewSub?.unsubscribe();
    this.isQuotationPreviewOpen = false;
    this.isQuotationPreviewLoading = false;
    this.isQuotationDownloading = false;
    this.quotationPreview = null;
  }

  downloadQuotationPreview() {
    if (!this.quotationPreview || this.isQuotationDownloading) {
      return;
    }

    this.isQuotationDownloading = true;
    setTimeout(() => this.renderQuotationPreviewPdf(), 0);
  }

  private async renderQuotationPreviewPdf() {
    const data = document.getElementById('quotationHistoryPdf');

    if (!data) {
      this.isQuotationDownloading = false;
      alert('Quotation PDF content not found.');
      return;
    }

    data.classList.add('pdf-rendering');

    try {
      await this.waitForPdfAssets(data);

      const pages = Array.from(data.querySelectorAll<HTMLElement>('.pdf-page'));
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;

      for (let index = 0; index < pages.length; index++) {
        const canvas = await html2canvas(pages[index], {
          scale: 3,
          useCORS: true,
          backgroundColor: '#ffffff',
          allowTaint: false,
          imageTimeout: 1500,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: pages[index].scrollWidth,
          windowHeight: pages[index].scrollHeight
        });

        if (index > 0) {
          pdf.addPage();
        }

        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, pageWidth, pageHeight);
      }

      pdf.save(`${this.quotationPreview?.quotation_no || 'quotation'}.pdf`);
    } catch (error) {
      console.error('Quotation PDF download failed', error);
      alert('Quotation PDF download failed. See console for details.');
    } finally {
      data.classList.remove('pdf-rendering');
      this.isQuotationDownloading = false;
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

  private refreshQuotationHistory() {
    this.api.getLeadQuotations(this.leadId).pipe(catchError(() => of(null))).subscribe((res: any) => {
      this.quotations = this.normalizeQuotationHistory(res);
    });
  }

  private getQuotationList(lead: any, rawResponse: any): any[] {
    const source =
      rawResponse?.quotations ||
      rawResponse?.quotation ||
      rawResponse?.data?.quotations ||
      rawResponse?.data?.quotation ||
      lead?.quotations ||
      lead?.quotation ||
      lead?.quotation_sent ||
      lead?.quotationSent;

    if (Array.isArray(source)) {
      return source;
    }

    if (source && typeof source === 'object') {
      return [source];
    }

    if (lead?.quotation_status || lead?.quotation_notes || lead?.quotation_date) {
      return [{
        status: lead?.quotation_status,
        notes: lead?.quotation_notes,
        added_on: lead?.quotation_date
      }];
    }

    return [];
  }

  private normalizeLeadResponse(response: any) {
    const source = response?.data || response?.lead || response;

    if (Array.isArray(source)) {
      return source[0] || null;
    }

    return source && typeof source === 'object' ? source : null;
  }

  private normalizeListResponse(response: any): any[] {
    const source = response?.data || response?.activities || response;

    if (Array.isArray(source)) {
      return source;
    }

    return [];
  }

  private mergeServicePriceLists(listServices: any[], catalogServices: any[]): any[] {
    const catalogByKey = new Map<string, any>();

    catalogServices.forEach((service: any) => {
      this.getServiceKeys(service).forEach((key) => catalogByKey.set(key, service));
    });

    const merged = listServices.map((service: any) => {
      const catalogService = this.getServiceKeys(service)
        .map((key) => catalogByKey.get(key))
        .find(Boolean);

      return this.normalizeQuotationService({
        ...(catalogService || {}),
        ...service,
        price: this.getServicePrice(service, catalogService)
      });
    });

    if (merged.length) {
      return merged;
    }

    return catalogServices.map((service: any) => this.normalizeQuotationService(service));
  }

  private normalizeQuotationService(service: any) {
    const serviceName = service?.sName || service?.servicesName || service?.name || service?.serviceName || '';
    const serviceId = service?.sId || service?.servicesTblId || service?.id || service?.serviceId || '';

    return {
      ...service,
      sId: serviceId,
      servicesTblId: service?.servicesTblId || serviceId,
      sName: serviceName,
      servicesName: service?.servicesName || serviceName,
      price: this.getServicePrice(service)
    };
  }

  private getServiceKeys(service: any): string[] {
    return [
      service?.sId,
      service?.servicesTblId,
      service?.id,
      service?.serviceId,
      service?.sName,
      service?.servicesName,
      service?.name,
      service?.serviceName
    ]
      .map((value) => this.normalizeComparable(value))
      .filter(Boolean);
  }

  private getServicePrice(primary: any, fallback?: any): number {
    const rawPrice =
      primary?.price ??
      primary?.sPrice ??
      primary?.servicePrice ??
      primary?.servicesPrice ??
      primary?.default_price ??
      primary?.quotation_price ??
      primary?.rate ??
      primary?.amount ??
      fallback?.price ??
      fallback?.sPrice ??
      fallback?.servicePrice ??
      fallback?.servicesPrice ??
      fallback?.default_price ??
      fallback?.quotation_price ??
      fallback?.rate ??
      fallback?.amount ??
      0;

    const price = Number(rawPrice);
    return Number.isFinite(price) ? price : 0;
  }

  private normalizeQuotationHistory(response: any): any[] {
    const source = response?.data || response?.quotations || response;

    if (!Array.isArray(source)) {
      return [];
    }

    return [...source].sort((first: any, second: any) => {
      const firstDate = new Date(first?.sent_at || first?.quotation_date || first?.created_at || 0).getTime();
      const secondDate = new Date(second?.sent_at || second?.quotation_date || second?.created_at || 0).getTime();
      return secondDate - firstDate;
    });
  }

  private getServiceName(serviceValue: string): string {
    const normalizedValue = this.normalizeComparable(serviceValue);
    const service = this.services.find((item: any) =>
      this.normalizeComparable(item?.sId) === normalizedValue ||
      this.normalizeComparable(item?.id) === normalizedValue ||
      this.normalizeComparable(item?.servicesTblId) === normalizedValue ||
      this.normalizeComparable(item?.serviceId) === normalizedValue ||
      this.normalizeComparable(item?.sName) === normalizedValue ||
      this.normalizeComparable(item?.servicesName) === normalizedValue ||
      this.normalizeComparable(item?.name) === normalizedValue
    );

    return service?.sName || service?.servicesName || service?.name || serviceValue;
  }

  private resolveLeadServices(lead: any): string[] {
    const selectedServices = [
      ...this.serviceArray(lead?.lservices),
      ...this.serviceArray(lead?.services),
      ...this.serviceArray(lead?.service),
      ...this.serviceArray(lead?.service_ids),
      ...this.serviceArray(lead?.service_id),
      ...this.serviceArray(lead?.serviceIds),
      ...this.serviceArray(lead?.servicesName),
      ...this.serviceArray(lead?.serviceName),
      ...this.serviceArray(lead?.selected_services),
      ...this.serviceArray(lead?.selectedServices)
    ];
    const uniqueServices = Array.from(new Set(selectedServices));

    return uniqueServices.map((service) => this.getServiceName(service));
  }

  private normalizeServiceValue(value: any): string[] {
    if (value === null || value === undefined) {
      return [];
    }

    if (Array.isArray(value)) {
      return value.flatMap((item: any) => this.normalizeServiceValue(item));
    }

    if (typeof value === 'object') {
      return this.serviceArray(
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

  private normalizeComparable(value: any): string {
    return String(value ?? '').trim().toLowerCase();
  }

  private mergeLeadData(stateLead: any, apiLead: any) {
    const merged = {
      ...(stateLead || {}),
      ...(apiLead || {})
    };

    const serviceValue = this.firstFilledValue(
      apiLead?.lservices,
      apiLead?.services,
      apiLead?.service_ids,
      apiLead?.service_id,
      apiLead?.serviceIds,
      apiLead?.servicesName,
      apiLead?.serviceName,
      apiLead?.service,
      apiLead?.selected_services,
      apiLead?.selectedServices,
      stateLead?.lservices,
      stateLead?.services,
      stateLead?.service_ids,
      stateLead?.service_id,
      stateLead?.serviceIds,
      stateLead?.servicesName,
      stateLead?.serviceName,
      stateLead?.service,
      stateLead?.selected_services,
      stateLead?.selectedServices
    );

    if (serviceValue !== null) {
      merged.lservices = serviceValue;
      merged.services = serviceValue;
    }

    return merged;
  }

  private firstFilledValue(...values: any[]) {
    return values.find((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return value !== null && value !== undefined && String(value).trim() !== '';
    }) ?? null;
  }

  private normalizeQuotationLead(lead: any) {
    const leadId = lead?.shopacttblID || lead?.id || lead?.lead_id || this.leadId;

    return {
      ...(lead || {}),
      id: leadId,
      shopacttblID: leadId,
      lead_id: leadId
    };
  }
}
