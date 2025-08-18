import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { DataService } from '../service/data.service';

@Injectable({
  providedIn: 'root'
})

export class StopNavigateGuard implements CanActivate {
  constructor(public route: Router, public dataService: DataService) {

  }

  canActivate(): boolean {
    const userToken = localStorage.getItem('userToken');
    const userId = this.dataService.currentUserData?.id;
    if (userToken || userId) {
      this.dataService.utils.showToast('danger', "Please Logout to access this page.");
      if (!userId) {
        this.route.navigateByUrl('/my-profile');
      }
      return false;
    }

    return true;
  }

}
