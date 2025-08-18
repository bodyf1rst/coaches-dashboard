import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-coach-tab',
  templateUrl: './coach-tab.component.html',
  styleUrls: ['./coach-tab.component.scss']
})
export class CoachTabComponent implements OnInit {
  @Input() item: any = {}
  @Input() showStats:boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
