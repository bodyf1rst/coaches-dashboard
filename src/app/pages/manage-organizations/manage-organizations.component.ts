import { Component, OnInit } from '@angular/core';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-manage-organizations',
  templateUrl: './manage-organizations.component.html',
  styleUrls: ['./manage-organizations.component.scss']
})
export class ManageOrganizationsComponent implements OnInit {
  public selectedItem: number = -1;
  public pageFilter: any = new pageFilter;
  public filterApplied: boolean = false;
  constructor(public dataService: DataService) {
    if (!this.dataService?.organizationsList?.organizations?.length) {
      this.getFreshData();
    }
  }

  ngOnInit(): void {
  }

  getFreshData() {
    this.dataService.fetchData(1, this.dataService.httpService.getOrganizationsApi, 'organizations', 'organizationsList')
  }

  onSearch() {
    let filterQuery = '';
    this.filterApplied = false;
    if (!this.dataService.stats.organizationsList.fieldText?.length) {
      ['status', 'assignment_status', 'department', 'employee_assignment'].forEach((filterKey) => {
        if (this.pageFilter[filterKey]) {
          filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
          this.filterApplied = true;
        }
      });
    }
    this.dataService.fetchData(
      1,
      this.dataService.httpService.getOrganizationsApi,
      'organizations',
      'organizationsList',
      this.dataService.stats.organizationsList.fieldText, filterQuery
    ).then(() => {

      var closeFilter = document.getElementById('closeFilter');
      closeFilter?.click();
    });
  }

  clearSearch() {
    this.getFreshData();
    this.dataService.stats.organizationsList.fieldText = null;
    this.dataService.stats.organizationsList.isSearched = false;
    this.pageFilter = new pageFilter;
    this.filterApplied = false;
  }

  getFilterFields() {
    this.dataService.stats.organizationsList.fieldText = null
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
