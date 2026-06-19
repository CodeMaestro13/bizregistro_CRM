import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApexChart, ApexFill, ApexGrid, ApexLegend, ApexNonAxisChartSeries, ApexResponsive, ApexStroke, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';

export type ChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: any;
    legend: ApexLegend;
    grid: ApexGrid;
    stroke: ApexStroke;
    fill: ApexFill;
};

@Component({
  selector: 'app-filler-graph',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    NgApexchartsModule
  ],
  templateUrl: './filler-graph.component.html',
  styleUrls: ['./filler-graph.component.scss',
    '../dashboard/dashboard.component.scss',
    '../../../themecomponent/charts/apexcharts/basic-polar-chart/basic-polar-chart.component.scss'
  ]
})
export class FillerGraphComponent implements OnChanges {
  @Input() graphData:any;
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  constructor()
  {
    console.log(this.graphData);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if( changes['graphData'] && changes['graphData'].currentValue != undefined ){
      console.log(changes['graphData'].currentValue.filler_work_today)
      this.chartOptions = {
            series: this.graphData?.filler_work_today?.map((q: any) =>{  return Number(q.total_work); }),
            labels: this.graphData?.filler_work_today?.map((q: any) => { return String(q.filler_name) }),
            chart: {
                type: "pie"
            },
            stroke: {
                colors: ["#ffffff"]
            },
            fill: {
                opacity: 0.8
            },
            grid: {
                show: true,
                strokeDashArray: 5,
                borderColor: "#EDEFF5"
            },
            legend: {
                fontSize: "14px",
                labels: {
                    colors: '#5B5B98'
                }
            }
          };

    }
    
  }

}
