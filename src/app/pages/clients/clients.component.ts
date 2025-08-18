import { Component, OnInit } from '@angular/core';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  public pageFilter: any = new pageFilter;
  public filterApplied: boolean = false;

  constructor(public dataService: DataService) {
    if (!this.dataService?.clientsList?.employees?.length) {
      this.getFreshData();
    }
  }

  ngOnInit(): void {
  }

  getFreshData() {
    this.dataService.fetchData(1, this.dataService.httpService.getEmployeesApi, 'employees', 'clientsList', '', `&user_type=Client`)
  }

  onSearch() {
    let filterQuery = '';
    this.filterApplied = false;
    if (!this.dataService.stats.clientsList.fieldText?.length) {
      ['department', 'status', 'assignment_status', 'user_type', 'organization_id', 'signup_status', 'plan_id', 'coach_id', 'uploader'].forEach((filterKey) => {
        if (this.pageFilter[filterKey]) {
          filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
          this.filterApplied = true;
        }
      });
    }
    this.dataService
      .fetchData(1, this.dataService.httpService.getEmployeesApi, 'employees', 'clientsList', this.dataService.stats.clientsList.fieldText, filterQuery + `&user_type=Client`).then(() => {
        document.getElementById('closeFilter')?.click();
      });
  }

  clearSearch() {
    this.getFreshData();
    this.dataService.stats.clientsList.fieldText = null;
    this.dataService.stats.clientsList.isSearched = false;
    this.pageFilter = new pageFilter;
    this.filterApplied = false;
  }

  getFilterFields() {
    if (!this.dataService.plansDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getPlansDropdown, 'plans', 'plansDropdown').then(() => {
      })
    }
    if (!this.dataService.coachesDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getCoachesDropdown, 'coaches', 'coachesDropdown')
    }
    this.dataService.stats.clientsList.fieldText = null
  }

  ngOnDestroy() {
    if (this.filterApplied) {
      this.getFreshData()
    }
  }

  getDepartments() {
    if (this.pageFilter.organization_id) {
      const selectedOrganization = this.dataService.organizationsDropdown.find(
        (o: any) => o.id === Number(this.pageFilter.organization_id)
      );
      return selectedOrganization?.departments || [];
    } else {
      return this.dataService.departmentsDropdown;
    }
  }

}
