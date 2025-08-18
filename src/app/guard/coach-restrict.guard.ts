import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DataService } from '../service/data.service';

@Injectable({
  providedIn: 'root'
})
export class CoachRestrictGuard implements CanActivate {
  constructor(private dataService: DataService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.dataService.userFetched$.subscribe((isFetched) => {
        if (isFetched) {
          if (this.dataService.currentUserData.role === 'Admin') {
            observer.next(true);
          } else {
            this.router.navigateByUrl('/my-profile');
            this.dataService.utils.showToast('danger', "Can't access this page.");
            observer.next(false);
          }
        }
      });
    });
  }
}