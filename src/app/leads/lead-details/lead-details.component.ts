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

@Component({
  selector: 'app-lead-details',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './lead-details.component.html',
  styleUrl: './lead-details.component.scss'
})
export class LeadDetailsComponent implements OnInit, OnDestroy {
  leadId = '';
  lead: any = history.state?.lead || null;
  activities: any[] = [];
  quotations: any[] = [];
  bdeList: any[] = localStorage.getItem('bdeList') ? JSON.parse(localStorage.getItem('bdeList')!) : [];
  private sub?: Subscription;

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

    this.loader.show();
    this.sub = forkJoin({
      lead: this.api.lead(this.leadId).pipe(catchError(() => of(null))),
      activities: this.api.getAct(this.leadId).pipe(catchError(() => of(null)))
    }).subscribe({
      next: (res: any) => {
        const leadData = this.normalizeLeadResponse(res?.lead);
        this.lead = {
          ...(leadData || {}),
          ...(this.lead || {})
        };
        this.activities = this.normalizeListResponse(res?.activities);
        this.quotations = this.getQuotationList(this.lead, res?.lead);
      },
      complete: () => this.loader.hide(),
      error: () => this.loader.hide()
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  serviceArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value;
    }

    return value ? String(value).split(',').map((item: string) => item.trim()).filter(Boolean) : [];
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
}
