import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-workout-tab',
  templateUrl: './workout-tab.component.html',
  styleUrls: ['./workout-tab.component.scss']
})
export class WorkoutTabComponent implements OnInit {
  @Input() item: any = {}

  constructor() { }

  ngOnInit(): void {
  }

}
