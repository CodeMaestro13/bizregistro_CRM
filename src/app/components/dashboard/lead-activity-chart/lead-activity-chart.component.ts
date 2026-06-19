import { Component,OnChanges } from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexYAxis,
  ApexGrid,
  ApexLegend,
  NgApexchartsModule
} from "ng-apexcharts";
import { AdminsService } from '../../../admins.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  grid: ApexGrid;
  legend: ApexLegend;
  colors: string[];
};

export interface ReportGraphData {
  bde_name: string;
  total_leads: number;
  total_activities: number;
}

@Component({
  selector: 'app-lead-activity-chart',
  standalone: true,
  imports: [CommonModule,NgApexchartsModule,MatButtonModule,MatCardModule],
  templateUrl: './lead-activity-chart.component.html',
  styleUrl: './lead-activity-chart.component.scss'
})
export class LeadActivityChartComponent implements OnChanges {
  constructor(private api:AdminsService){}
  public chartOptions: Partial<ChartOptions>;

  ngOnInit(): void {
    this.takeReportGraphData();
  }

  ngOnChanges():void {
    console.log('Not in use')
  }


  takeReportGraphData(date:any= '')
  {
    this.api.takeReportGraphData(date).subscribe((res:any)=>{
      const data: ReportGraphData[] = res.data;
      
      const categories = data.map((d: ReportGraphData) => d.bde_name);
      const totalLeads = data.map((d: ReportGraphData) => d.total_leads);
      const totalActivities = data.map((d: ReportGraphData) => d.total_activities);

      // console.log(categories);
      // console.log(totalLeads);
      // console.log(totalActivities);

      this.chartOptions = {
        series: [
          {
            name: 'New Leads',
            data: totalLeads
          },
          {
            name: 'Total Activities',
            data: totalActivities
          }
        ],
        chart: {
          type: "bar",
          height: 350,
          stacked: false
        },
        xaxis: {
          categories: categories,
          labels: {
            style: {
              fontSize: '14px'
            }
          }
        },
        dataLabels: {
          enabled: false
        },
        yaxis: {
          title: {
            text: 'Count'
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'center'
        },
        grid: {
          borderColor: "#e0e0e0",
          strokeDashArray: 5
        },
        colors: ["#1c5da2", "#39cc07"]
      };
    })
    console.log(date);
  }
}
