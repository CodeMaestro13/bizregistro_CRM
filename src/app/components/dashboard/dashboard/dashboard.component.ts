import { Component, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { AdminsService } from '../../../admins.service';
import { interval, Subscription } from 'rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import {
    ChartComponent,
    ApexNonAxisChartSeries,
    ApexResponsive,
    ApexChart,
    ApexStroke,
    ApexGrid,
    ApexLegend,
    ApexFill,
    NgApexchartsModule
} from "ng-apexcharts";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { LoaderService } from '../../../shared/loader/loader.service';
import { LeadActivityChartComponent } from '../lead-activity-chart/lead-activity-chart.component';
import { FillerGraphComponent } from '../filler-graph/filler-graph.component';

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
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,
    MatCardModule,
    MatProgressBarModule,
    NgApexchartsModule,
    MatButtonModule,
    RouterModule,
    LeadActivityChartComponent,
    FillerGraphComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss',
            '../../../themecomponent/ui-kit/cards/cards.component.scss',
            '../../../themecomponent/charts/apexcharts/basic-polar-chart/basic-polar-chart.component.scss',
            '../../../themecomponent/tables/basic-table/basic-table.component.scss']
})
export class DashboardComponent {
  @ViewChild("chart") chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  subs:Subscription = new Subscription();
  data:any = null;
  adminData:any = null;

  constructor(public themeService: CustomizerSettingsService,private loader:LoaderService,private api:AdminsService){
    this.adminData = JSON.parse(localStorage.getItem('biz-user')!);
    console.log(this.adminData);
    
  }

  query:any = [];
  newLeads:any = [];

  ngOnInit(){
    this.takeData();
    this.subs.add( interval(60000).subscribe(() => {
        this.takeData();
      })
    )
  }

  takeData(){
    this.loader.show()
    this.subs.add(
      this.api.getDashboardData().subscribe((res:any)=>{
        if(res.status == 'success'){
          this.data = res?.data;
          this.newLeads = res?.data?.new_leads || [];
          // build chart options using the returned query array
          this.query = [];
          for(let key in res?.data?.query){
            let item = res?.data?.query[key];
            if (Number(item.total_leads) > 0) {
              this.query.push(item);
            }
            // if(res?.data?.query[key].total_leads > 0)
            //   this.query.push(res?.data?.query[key]);
            
          }
          this.chartOptions = {
            series: this.query.map((q: any) =>{  return Number(q.total_leads); }),
            labels: this.query.map((q: any) => { return String(q.bde_name) }),
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
      },
      (error)=>{
        console.warn(error);
      },
      ()=>{
        this.loader.hide()
      })
    );
  }

  ngOnDestroy(){
    this.subs.unsubscribe();
  }
}
