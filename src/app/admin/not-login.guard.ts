import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',  // This makes it available application-wide
  })
export class notLoginGuard implements CanActivate {
    constructor(private router:Router){}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        if(!localStorage.getItem('biz-token'))
        {
            return true;
        }else{
            this.router.navigate(['/']);
            return false;
        }
    }
};
