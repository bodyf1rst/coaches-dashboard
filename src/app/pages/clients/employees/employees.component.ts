import { Component, OnInit } from '@angular/core';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit {
  public pageFilter: any = new pageFilter;
  public filterApplied: boolean = false;

  constructor(public dataService: DataService) {
    if (!this.dataService?.employeesList?.employees?.length) {
      this.getFreshData();
    }
  }

  ngOnInit(): void {
  }

  getFreshData() {
    this.dataService.fetchData(1, this.dataService.httpService.getEmployeesApi, 'employees', 'employeesList', '', `&user_type=Employee`)
  }

  onSearch() {
    let filterQuery = '';
    this.filterApplied = false;
    if (!this.dataService.stats.employeesList.fieldText?.length) {
      ['department', 'status', 'assignment_status', 'user_type', 'organization_id', 'signup_status', 'plan_id', 'coach_id'].forEach((filterKey) => {
        if (this.pageFilter[filterKey]) {
          filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
          this.filterApplied = true;
        }
      });
    }
    this.dataService
      .fetchData(1, this.dataService.httpService.getEmployeesApi, 'employees', 'employeesList', this.dataService.stats.employeesList.fieldText, filterQuery + `&user_type=Employee`).then(() => {
        document.getElementById('closeFilter')?.click();
      });
  }

  clearSearch() {
    this.getFreshData();
    this.dataService.stats.employeesList.fieldText = null;
    this.dataService.stats.employeesList.isSearched = false;
    this.pageFilter = new pageFilter;
    this.filterApplied = false;
  }

  getFilterFields() {
    if (!this.dataService.coachesDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getCoachesDropdown, 'coaches', 'coachesDropdown')
    }
    if (!this.dataService.organizationsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getOrganizationDropdown, 'organizations', 'organizationsDropdown').then(() => {
      })
    }
    if (!this.dataService.plansDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getPlansDropdown, 'plans', 'plansDropdown').then(() => {
      })
    }
    this.dataService.stats.employeesList.fieldText = null
    if (!this.dataService.departmentsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getDepartmentsDropdownApi, 'departments', 'departmentsDropdown')
    }

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