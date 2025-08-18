import { Component, Input, OnInit } from '@angular/core';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-video-tab',
  templateUrl: './video-tab.component.html',
  styleUrls: ['./video-tab.component.scss']
})
export class VideoTabComponent implements OnInit {

  @Input() item: any = {}
  @Input() link: any = ''

  constructor(public dataService: DataService) { }

  ngOnInit(): void {
  }

}
