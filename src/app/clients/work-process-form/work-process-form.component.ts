import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AdminsService } from '../../admins.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { pluck } from 'rxjs';

@Component({
  selector: 'app-work-process-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './work-process-form.component.html',
  styleUrls: ['./work-process-form.component.scss','../edit-details/edit-details.component.scss']
})
export class WorkProcessFormComponent implements OnInit, OnChanges {
  constructor(private api:AdminsService) {}
  visible: boolean = false;
  viewData:any;
  @Input() set data(d: any) {
    if (d) {
      this.visible = true;
      this.populateForm(d);
    }
  }
  @Output() closed = new EventEmitter<{ saved: boolean; data?: any }>();

  ngOnInit(): void {
    
  }
  workData:any;
  ngOnChanges(changes: SimpleChanges) : void{
    if(changes['data']){
      this.viewData = changes['data'].currentValue;
      this.api.getWorkProcess(this.viewData?.id).pipe(pluck('data')).subscribe((res:any) => {
        this.workData = res;
      })
      this.api.getWorkStatusList(this.viewData?.id).pipe(pluck('data')).subscribe((res:any) => {
        this.work_status = res || [];
      }, (err:any) => {
        alert('Failed to fetch work status list');
      },()=>{
        console.log('Work status list fetched');
      })
      console.log('Data changed:', changes['data'].currentValue);
      this.populateForm(changes['data'].currentValue);
    }
    console.log('res')
  }

  work_status:any;
  form = new FormGroup({
    note: new FormControl('', [Validators.required, Validators.minLength(3)]),
    client_id: new FormControl('',[Validators.required]),
    work_status_id: new FormControl('',[Validators.required])
  })

  populateForm(data: any) {
    this.form.patchValue({
      client_id: data?.id
    });
  }


  cancel(status:any = false){
    this.closed.emit({ saved: status });
  }

  save(){
    if(this.form.valid){
      this.api.addWorkProcess(this.form.value).subscribe({
        next: (res) => {
          this.closed.emit({ saved: true, data: res });
        },
        error: (err) => {
          console.error('Error saving work process:', err);
          this.closed.emit({ saved: false });
        }
      });
      console.log(this.form.value);
    } else {
      console.log('Form is invalid', this.form.errors, this.form.value);
      this.form.markAllAsTouched();
    }
  }
}
