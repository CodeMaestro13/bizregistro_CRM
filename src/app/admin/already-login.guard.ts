import { Injectable } from '@angular/core';
import { CanActivateFn,CanActivate, ActivatedRouteSnapshot, GuardResult, MaybeAsync, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

// export const alreadyLoginGuard: CanActivateFn = (route, state) => {
//   return true;
// };
@Injectable({
    providedIn: 'root',  // This makes it available application-wide
  })

export class alreadyLoginGuard implements CanActivate{
    constructor(private router:Router){}
    // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        if(localStorage.getItem('biz-token'))
        {
            return true;
        }else{
            this.router.navigate(['/authentication']);
            return false;
        }
    }
}
