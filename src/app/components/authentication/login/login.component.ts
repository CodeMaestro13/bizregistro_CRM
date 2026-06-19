import { Component } from '@angular/core';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminsService } from '../../../admins.service';
import Swal from 'sweetalert2';
import { tap } from 'rxjs';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatCheckboxModule,FormsModule,ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {

    hide = true;

    constructor(
        public themeService: CustomizerSettingsService,
        private api:AdminsService,
        private router:Router
    ) {}

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    toggleCardBorderTheme() {
        this.themeService.toggleCardBorderTheme();
    }

    toggleCardBorderRadiusTheme() {
        this.themeService.toggleCardBorderRadiusTheme();
    }

    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }

    login = new FormGroup({
        username:new FormControl('',[Validators.required]),
        password:new FormControl('',[Validators.required]),
    })

    loginUser()
    {
        if(this.login.valid)
        {
            this.api.login(this.login.value).pipe(tap((r:any)=>{console.log(r)})).subscribe((res:any)=>{
                if(res?.data)
                {
                    localStorage.setItem('biz-user',JSON.stringify(res?.data));
                    localStorage.setItem('biz-token',res?.data?.token);
                    this.router.navigate(['/']).then(()=>{
                        window.location.reload();
                    })
                }else{
                    // alert(res.msg);
                    Swal.fire({
                        icon:'error',
                        title:'Login Failed',
                        text:res.msg
                    })
                }
            },
            (err:any)=>{
                console.log(err);
                Swal.fire({
                    icon:'error',
                    title:'Login Failed',
                    text:'Something went wrong'
                })
            });
        }else{
            Swal.fire({
                icon:'warning',
                title:'Invalid Data',
                text:'Please fill all required fields'
            })
        }
    }
}
