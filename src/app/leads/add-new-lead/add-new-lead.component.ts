import { pluck } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AdminsService } from '../../admins.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-new-lead',
  standalone: true,
  imports: [CommonModule,MatSelectModule,MatCardModule,MatDatepickerModule,MatNativeDateModule,FormsModule,ReactiveFormsModule,MatFormFieldModule,MatInputModule,MatButtonModule],
  templateUrl: './add-new-lead.component.html',
  styleUrls: ['./add-new-lead.component.scss','../add-activity/add-activity.component.scss','../convert-lead/convert-lead.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
  
})
export class AddNewLeadComponent  implements OnChanges{
  @Output() closedp= new EventEmitter<{saved:boolean; data:any}>();
  visible:boolean = false;
  @Input() services:any;
  bde:any = JSON.parse(<any>localStorage.getItem('bdeList'));
  source:any;
  @Input() statusList:any;
  constructor(private api:AdminsService)
  {
    this.api.source().pipe(pluck('data')).subscribe((res:any)=>{
      console.log(res);
      this.source = res;
    })
  }


  form = new FormGroup({
    name: new FormControl('',[Validators.required]),
    mobile: new FormControl('',[Validators.required]),
    email: new FormControl(''),
    city: new FormControl('',[Validators.required]),
    source: new FormControl('',[Validators.required]),
    // handled_by: new FormControl('',[Validators.required]),
    status: new FormControl('',[Validators.required]),
    description: new FormControl('',[Validators.required]),
    nextDate: new FormControl('',[Validators.required]),
    services: new FormControl([],[Validators.required]),
  })


  submit(){
    if(this.form.valid){
        this.api.addLead(this.form.value).subscribe((res:any)=>{
          this.sweetAlert('success',res.msg);
          this.visible= false;
          this.closedp.emit({saved:true,data:this.form.value});
          this.form.reset();
        },(err:any)=>{
          console.log(err);
          Swal.fire({
            icon:'error',
            title:err.error.msg
          })
        },()=>{
          console.log('Lead Add Function closed!');
        })
    }else{
      this.sweetAlert('warning','Please Fill All Feilds!');
    }
    console.log(this.form.value);
  }

  sweetAlert(status: any, msg: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: status,
      title: msg
    });
  }




  ngOnChanges(changes: SimpleChanges): void {
    if(changes['services']){
      console.log("Services:- ", this.services)
      console.log('bde:- ', this.bde)
      this.visible = true;
    }
  }



  onClose(){
    this.visible = false;
    this.closedp.emit({saved:false,data:null});
  }
}

