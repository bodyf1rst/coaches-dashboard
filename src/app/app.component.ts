import { Component } from '@angular/core';
import { UtilsService } from './service/utils.service';
import { DataService } from './service/data.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'BodyF1RST';

  constructor(public dataService: DataService, public utils: UtilsService) {
  }

  pageActive() {
    this.dataService.isMenuOpen = false;
  }
}


