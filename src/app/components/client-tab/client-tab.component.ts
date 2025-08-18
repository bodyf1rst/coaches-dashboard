import { Component, Input, OnInit } from '@angular/core';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-client-tab',
  templateUrl: './client-tab.component.html',
  styleUrls: ['./client-tab.component.scss']
})
export class ClientTabComponent implements OnInit {
  @Input() item: any = {}
  @Input() showAssign: boolean = false;
  @Input() isRank: boolean = false;
  @Input() rLink: string = '';

  constructor(public dataService: DataService) { }

  ngOnInit(): void {
  }

}
