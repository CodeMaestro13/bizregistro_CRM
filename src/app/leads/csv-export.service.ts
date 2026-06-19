// csv-export.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { endpoints } from './../shared/endpoints';

@Injectable({ providedIn: 'root' })
export class CsvExportService {
    private http = inject(HttpClient);

  exportToCsv(filename: string, rows: Record<string, unknown>[]): void {
    if (!rows?.length) return;

    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        headers.map(h => this.escapeValue(row[h])).join(',')
      )
    ].join('\r\n');

    this.downloadFile(csvContent, filename);
  }

  private escapeValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Wrap in quotes if contains comma, quote, or newline
    if (/[",\r\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private downloadFile(content: string, filename: string): void {
    // BOM ensures Excel opens UTF-8 correctly
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    anchor.click();

    // Cleanup
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  getLeadsForCsv(filters: { status: string, bde: string, start_date: string, end_date: string}) {
    return this.http.post(`${endpoints.leads}/csv`, filters);
  }
}