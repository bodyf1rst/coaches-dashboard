import { Component, OnInit } from '@angular/core';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';
import { StatsService } from 'src/app/service/stats.service';

@Component({
  selector: 'app-manage-plans',
  templateUrl: './manage-plans.component.html',
  styleUrls: ['./manage-plans.component.scss']
})
export class ManagePlansComponent implements OnInit {
  public pageFilter: any = new pageFilter;
  public filterApplied: boolean = false;

  constructor(public dataService: DataService, public stats: StatsService) {
    if (!this.dataService?.plansList?.plans?.length) {
      this.getFreshData();
    }
  }

  ngOnInit(): void {
  }

  getFreshData() {
    this.dataService.fetchData(1, this.dataService.httpService.getPlansApi, 'plans', 'plansList')
  }

  onSearch() {
    let filterQuery = '';
    this.filterApplied = false;
    if (!this.dataService.stats.plansList.fieldText?.length) {
      ['status', 'uploaded_by', 'coach_id', 'organization_id', 'visibility_type'].forEach((filterKey) => {
        if (this.pageFilter[filterKey]) {
          filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
          this.filterApplied = true;
        }
      });
    }
    this.dataService.fetchData(
      1,
      this.dataService.httpService.getPlansApi,
      'plans',
      'plansList',
      this.dataService.stats.plansList.fieldText, filterQuery
    ).then(() => {

      document.getElementById('closeFilter')?.click();
    });
  }

  clearSearch() {
    this.getFreshData()
    this.dataService.stats.plansList.fieldText = null;
    this.dataService.stats.plansList.isSearched = false;
    this.pageFilter = new pageFilter;
    this.filterApplied = false;
  }

  getFilterFields() {
    if (!this.dataService.coachesDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getCoachesDropdown, 'coaches', 'coachesDropdown')
    }
    if (!this.dataService.organizationsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getOrganizationDropdown, 'organizations', 'organizationsDropdown')
    }
    this.dataService.stats.plansList.fieldText = null
  }

  ngOnDestroy() {
    if (this.filterApplied) {
      this.getFreshData()
    }
  }

}
