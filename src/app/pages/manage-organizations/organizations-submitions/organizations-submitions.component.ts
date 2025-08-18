import { Component, OnInit } from '@angular/core';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-organizations-submitions',
  templateUrl: './organizations-submitions.component.html',
  styleUrls: ['./organizations-submitions.component.scss']
})
export class OrganizationsSubmitionsComponent implements OnInit {
  public selectedItem: number = -1;
  public pageFilter: any = new pageFilter;
  public filterApplied: boolean = false;
  constructor(public dataService: DataService) {
    if (!this.dataService?.organizationSubmitionsList?.organization_submissions?.length) {
      this.getFreshData();
    }
  }

  ngOnInit(): void {
    this.dataService.dataUpdater.subscribe((res: any) => {
      if (res == 'employeesUpdated') {
        this.getFreshData();
      }
    })
  }

  getFreshData() {
    this.dataService.fetchData(1, this.dataService.httpService.getOrganizationSubmitions, 'organization_submissions', 'organizationSubmitionsList')
  }

  onSearch() {
    let filterQuery = '';
    this.filterApplied = false;
    if (!this.dataService.stats.organizationSubmitionsList.fieldText?.length) {
      if (this.pageFilter.status) {
        filterQuery += `&status=${this.pageFilter.status}`;
        this.filterApplied = true;
      }
    }
    this.dataService.fetchData(
      1,
      this.dataService.httpService.getOrganizationSubmitions,
      'organization_submissions',
      'organizationSubmitionsList',
      this.dataService.stats.organizationSubmitionsList.fieldText, filterQuery
    ).then(() => {

      var closeFilter = document.getElementById('closeFilter');
      closeFilter?.click();
    });
  }

  clearSearch() {
    this.getFreshData();
    this.dataService.stats.organizationSubmitionsList.fieldText = null;
    this.dataService.stats.organizationSubmitionsList.isSearched = false;
    this.pageFilter = new pageFilter;
    this.filterApplied = false;
    var closeFilter = document.getElementById('closeFilter');
    closeFilter?.click();
  }

  getFilterFields() {
    this.dataService.stats.organizationSubmitionsList.fieldText = null
    if (!this.dataService.departmentsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getDepartmentsDropdownApi, 'departments', 'departmentsDropdown')
    }

  }

  ngOnDestroy() {
    if (this.filterApplied) {
      this.getFreshData()
    }
  }
}
