import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UtilsService } from '../service/utils.service';
import { DataService } from '../service/data.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  constructor(public dataService: DataService, public router: Router, public utils: UtilsService) {

  }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (localStorage.getItem('userToken')) {
      return true
    }
    this.router.navigateByUrl('/login');
    this.utils.showToast('danger', "Can't access this page without login.");
    return false
  }

}
