import { Component } from '@angular/core';
import { AdminsService } from '../../admins.service';
import { CustomizerSettingsService } from '../../components/customizer-settings/customizer-settings.service';
import { pluck } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddComponent } from '../add/add.component';
import { EditComponent } from '../edit/edit.component';

@Component({
  selector: 'app-work-status',
  standalone: true,
  imports: [CommonModule,MatCardModule,MatIconModule,MatButtonModule,MatTooltipModule,AddComponent,EditComponent],
  templateUrl: './work-status.component.html',
  styleUrls: ['./work-status.component.scss','../../themecomponent/tables/basic-table/basic-table.component.scss']
})
export class WorkStatusComponent {
  workStatusList:any;
  constructor(private api:AdminsService,public themeService: CustomizerSettingsService){}

  ngOnInit(): void {
    this.getService();    
  }

  getService(){
    this.api.getWorkStatus().pipe(pluck('data')).subscribe((res:any)=>{
      this.workStatusList = res;
      // alert(JSON.stringify(this.workStatusList))
    })
  }

  sweetAlert(status: any, msg: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
    });
    Toast.fire({
      icon: status,
      title: msg,
    });
  }

  toggleService(item:any){
    // confirmation before toggling service
    Swal.fire({
      title: 'Are you sure?',
      text: 'This service status will be changed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, proceed!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.api.toggleService(item.servicesTblId).subscribe({
          next: () => {
            // console.log(res);
            this.sweetAlert('success', 'Service updated successfully');
            this.getService();
          },
          error: (err: any) => {
            this.sweetAlert('error', err.error?.msg || 'Failed to update service');
          }
        });
      }
    });
  }

  addVisible:boolean = false
  closeAdd(elmt:any)
  {
    this.addVisible = false;
    if(elmt.closed == true){
      this.getService();
    }
  }

  editvisible:boolean = false;
  editData:any;

  closeedit(elmt:any){
    this.editvisible = false;
    if(elmt.closed == true){
      this.getService();
    }
  }
}
