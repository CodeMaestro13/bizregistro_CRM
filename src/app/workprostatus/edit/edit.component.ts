import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AdminsService } from '../../admins.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule, MatCardActions } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [CommonModule,MatButtonModule,MatCardModule,MatCardActions,FormsModule,MatInputModule,ReactiveFormsModule,MatFormFieldModule,MatSelectModule,MatRadioModule],
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss','../../leads/add-activity/add-activity.component.scss']
})
export class EditComponent {
  @Output() closep = new EventEmitter<any>();
  @Input() visible:boolean = false;
  @Input() data:any;
  constructor(private api:AdminsService){}
  form = new FormGroup({
    id : new FormControl('',[Validators.required]),
    name: new FormControl('',[Validators.required]),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['data']){
      // alert(JSON.stringify(this.data));
      this.form.get('id')?.setValue(this.data?.id);
      this.form.get('name')?.setValue(this.data?.name);
    }
  }

  submit(){
    console.log(this.form.value);
    if(this.form.valid){
      this.api.updateWorkStatus(this.form.value).subscribe((res:any)=>{
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
    this.data = '';
    this.closep.emit({'closed': closed});
  }
}
