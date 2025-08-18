import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-challenge-tab',
  templateUrl: './challenge-tab.component.html',
  styleUrls: ['./challenge-tab.component.scss']
})
export class ChallengeTabComponent implements OnInit {
  @Input() item: any = {}

  constructor() { }

  ngOnInit(): void {
  }

}
