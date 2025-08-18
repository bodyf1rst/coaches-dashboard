import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-exercise-tab',
  templateUrl: './exercise-tab.component.html',
  styleUrls: ['./exercise-tab.component.scss']
})
export class ExerciseTabComponent implements OnInit {
  @Input() item: any = {}

  constructor() { }

  ngOnInit(): void {
  }

}
