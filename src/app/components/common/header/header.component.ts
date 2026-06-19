import { AfterViewInit, Component, HostListener } from '@angular/core';
import { ToggleService } from './toggle.service';
import { NgClass, DatePipe, CommonModule } from '@angular/common';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { Router, RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, pluck } from 'rxjs';
import { LoaderService } from '../../../shared/loader/loader.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, NgClass, MatMenuModule, MatIconModule, MatButtonModule, DatePipe],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

    isToggled = false;
    data:any;
    // img:string = 'data:image/jpeg;base64,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';
    constructor(
        private toggleService: ToggleService,
        public themeService: CustomizerSettingsService,
        private router:Router,
        private http:HttpClient,
        private loader:LoaderService
    ) {
        // Check you are online or not
        
        this.toggleService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
        this.currentDate = new Date();
        if(localStorage.getItem('biz-user'))
        {
            this.data = JSON.parse(localStorage.getItem('biz-user') || '');
        }
    }
    loading$ = this.loader.loading;
    isOffline: boolean = !navigator.onLine;

    @HostListener('window:offline')
    onOffline() {
        this.isOffline = true;
    }

    @HostListener('window:online')
    onOnline() {
        this.isOffline = false;
    }

    currentDate: Date;

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    toggle() {
        this.toggleService.toggle();
    }

    toggleSidebarTheme() {
        this.themeService.toggleSidebarTheme();
    }

    toggleHideSidebarTheme() {
        this.themeService.toggleHideSidebarTheme();
    }

    toggleCardBorderTheme() {
        this.themeService.toggleCardBorderTheme();
    }

    toggleHeaderTheme() {
        this.themeService.toggleHeaderTheme();
    }

    toggleCardBorderRadiusTheme() {
        this.themeService.toggleCardBorderRadiusTheme();
    }

    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }

    logout()
    {
        localStorage.clear();
        this.router.navigate(['/authentication'])
    }

    updateImage(){
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = (event: any) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64String = reader.result as string;
                    this.data.image = base64String;
                    localStorage.setItem('biz-user', JSON.stringify(this.data));
                };
                reader.readAsDataURL(file);
            }
        };
        fileInput.click();
    }
}
