import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-plan-tab',
  templateUrl: './plan-tab.component.html',
  styleUrls: ['./plan-tab.component.scss']
})
export class PlanTabComponent implements OnInit {
  @Input() item: any = {}
  constructor() { }

  ngOnInit(): void {
  }

}
