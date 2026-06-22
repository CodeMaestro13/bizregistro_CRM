import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardActions, MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';
import { AdminsService } from '../../admins.service';

@Component({
  selector: 'app-add',
  standalone: true,
  imports: [CommonModule,MatButtonModule,MatCardModule,MatCardActions,FormsModule,MatInputModule,ReactiveFormsModule,MatFormFieldModule,MatSelectModule,MatRadioModule],
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss','../../leads/add-activity/add-activity.component.scss']
})
export class AddComponent {
  @Output() closep = new EventEmitter<any>();
  @Input() visible:boolean = false;
  constructor(private api:AdminsService){}
  form = new FormGroup({
    sName: new FormControl('',[Validators.required]),
    price: new FormControl('',[Validators.required, Validators.min(0)]),
    webShow : new FormControl('',[Validators.required])
  });

  submit(){
    if(this.form.valid){
      // console.log(this.form.value);
      this.api.addService(this.form.value).subscribe((res:any)=>{
        // console.log(res);
        this.sweetAlert('success',res.msg);
        this.onClose(true);
      },(err:any)=>{
        console.warn(err);
        this.sweetAlert('error',"Something Wen't Wrong..");
      },()=>{
        console.log('closed add service function');
      });
    }else{
      this.sweetAlert('warning','Fill All Feilds!');
    }
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

  
  onClose(closed:boolean = false){
    this.form.reset();
    this.visible = false;
    this.closep.emit({'closed': closed});
  }
}
