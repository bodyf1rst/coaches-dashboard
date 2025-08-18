import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-short-profile',
  templateUrl: './short-profile.component.html',
  styleUrls: ['./short-profile.component.scss']
})
export class ShortProfileComponent implements OnInit {

  constructor(public dataService: DataService) { }

  ngOnInit(): void {
  }

}
