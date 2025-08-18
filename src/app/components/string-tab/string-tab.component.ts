import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-string-tab',
  templateUrl: './string-tab.component.html',
  styleUrls: ['./string-tab.component.scss']
})
export class StringTabComponent implements OnInit {
  @Input() item: any = {}
  constructor() { }

  ngOnInit(): void {
  }

}
