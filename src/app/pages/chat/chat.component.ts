import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/service/data.service';
import { HttpService } from 'src/app/service/http.service';
import { UtilsService } from 'src/app/service/utils.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  constructor(
    public dataService: DataService) {
      
  }

  ngOnInit() {


  }
}