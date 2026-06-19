import { Routes } from '@angular/router';
import { NotFoundComponent } from './components/common/not-found/not-found.component';
import { EcommerceComponent } from './components/dashboard/ecommerce/ecommerce.component';
import { AnalyticsComponent } from './components/dashboard/analytics/analytics.component';
import { ProjectManagementComponent } from './components/dashboard/project-management/project-management.component';
import { LmsCoursesComponent } from './components/dashboard/lms-courses/lms-courses.component';
import { CryptoComponent } from './components/dashboard/crypto/crypto.component';
import { HelpDeskComponent } from './components/dashboard/help-desk/help-desk.component';
import { SaasAppComponent } from './components/dashboard/saas-app/saas-app.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';
import { LoginComponent } from './components/authentication/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { alreadyLoginGuard } from './admin/already-login.guard';
import { notLoginGuard } from './admin/not-login.guard';
import { LogoutComponent } from './components/authentication/logout/logout.component';
export const routes: Routes = [
    {path: '',component:DashboardComponent, canActivate:[alreadyLoginGuard]},
    {path: 'ecomerce', component: EcommerceComponent},
    {path: 'analytics', component: AnalyticsComponent},
    {path: 'project-management', component: ProjectManagementComponent},
    {path: 'lms-courses', component: LmsCoursesComponent},
    {path: 'crypto', component: CryptoComponent},
    {path: 'help-desk', component: HelpDeskComponent},
    {path: 'saas-app', component: SaasAppComponent},
    {
        path: 'authentication',
        component: AuthenticationComponent,
        children: [
            {path: '', component: LoginComponent,canActivate:[notLoginGuard]},
            {path: 'logout', component: LogoutComponent,canActivate:[alreadyLoginGuard]}
        ]
    },
    { path: 'leads', loadChildren: () => import('./leads/leads-routing.module').then(m => m.LeadsRoutingModule), canActivate:[alreadyLoginGuard] },
    { path: 'clients', loadChildren: () => import('./clients/clients-routing.module').then(m => m.ClientsRoutingModule), canActivate:[alreadyLoginGuard] },
    { path: 'receipt', loadChildren:() => import('./receipt/receipt-routing.module').then(m => m.ReceiptRoutingModule ), canActivate:[alreadyLoginGuard]},
    { path: 'pending', loadChildren:() => import('./pending/pending-routing.module').then(m => m.PendingRoutingModule), canActivate:[alreadyLoginGuard] },
    { path: 'services', loadChildren:()=> import('./service/service-routing.module').then(m => m.ServiceRoutingModule), canActivate:[alreadyLoginGuard]},
    { path: 'work-status', loadChildren:()=> import('./workprostatus/workprostatus-routing.module').then(m => m.WorkprostatusRoutingModule), canActivate:[alreadyLoginGuard]},
    { path: 'activities', loadChildren:()=> import('./activity/activity-routing.module').then(m => m.ActivityRoutingModule), canActivate:[alreadyLoginGuard] },
    {path: '**', component: NotFoundComponent, canActivate:[alreadyLoginGuard] }
];
