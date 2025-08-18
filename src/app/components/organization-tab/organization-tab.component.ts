import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-organization-tab',
  templateUrl: './organization-tab.component.html',
  styleUrls: ['./organization-tab.component.scss']
})
export class OrganizationTabComponent implements OnInit {
  @Input() item: any = {}
  @Input() showAssign: boolean = true;
  constructor() { }

  ngOnInit(): void {
  }

}
