import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-left-sidebar',
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.scss']
})
export class LeftSidebarComponent implements OnInit {

  constructor(public dataService: DataService) { }

  ngOnInit(): void {
  }


  isDropdownActive(rla: any): boolean {
    return rla.isActive;
  }

  // This funciton will toggle class into main area to mange menu.
  menuClick(action: boolean) {
    this.dataService.isMenuOpen = action;
    var mainArea: any = document.getElementsByClassName('main-dashboard-area');
    if (action) {
      mainArea[0].classList.add('menu-open')
    } else {
      mainArea[0].classList.remove('menu-open')
    }
  }
}
