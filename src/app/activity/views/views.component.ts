import { map, Observable } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AdminsService } from '../../admins.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-views',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.scss','../../leads/add-activity/add-activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewsComponent implements OnChanges {
  @Input() elementData:any; 
  @Output() closed = new EventEmitter<any>()
  dataSource:any;
  visible:boolean = false;
  displayedColumns: string[] = ['SN', 'Lead Details', 'Activity', 'Created Date'];
  constructor(private api:AdminsService, private cdr: ChangeDetectorRef){}

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['elementData']){
      this.visible = true;
      this.api.getAct(this.elementData.lead_id).pipe(map((res:any)=> res.data )).subscribe((res:any)=>{
        this.dataSource = res;
        this.cdr.markForCheck();
      })
    }
  }

  close(closed:boolean = false){
    this.elementData = '';
    this.visible = false;
    this.closed.emit({'closed': closed});
    this.cdr.markForCheck();
  }
}

