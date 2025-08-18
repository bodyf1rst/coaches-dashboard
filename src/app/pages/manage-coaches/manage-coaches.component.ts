import { Component, OnDestroy, OnInit } from '@angular/core';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';
import { StatsService } from 'src/app/service/stats.service';

@Component({
  selector: 'app-manage-coaches',
  templateUrl: './manage-coaches.component.html',
  styleUrls: ['./manage-coaches.component.scss']
})
export class ManageCoachesComponent implements OnInit, OnDestroy {
  public pageFilter: any = new pageFilter;
  public filterApplied: boolean = false;

  constructor(public dataService: DataService, public stats: StatsService) {
    if (!this.dataService?.coachesList?.coaches?.length) {
      this.getFreshData();
    }
  }

  ngOnInit(): void {
  }

  getFreshData() {
    this.dataService.fetchData(1, this.dataService.httpService.getCoachesApi, 'coaches', 'coachesList')
  }

  onSearch() {
    let filterQuery = '';
    this.filterApplied = false;
    if (!this.dataService.stats.coachesList.fieldText?.length) {
      ['status', 'assignment_status', 'organization_id'].forEach((filterKey) => {
        if (this.pageFilter[filterKey]) {
          filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
          this.filterApplied = true;
        }
      });
    }
    this.dataService.fetchData(
      1,
      this.dataService.httpService.getCoachesApi,
      'coaches',
      'coachesList',
      this.dataService.stats.coachesList.fieldText, filterQuery
    ).then(() => {
      document.getElementById('closeFilter')?.click();
    });
  }

  clearSearch() {
    this.getFreshData()
    this.dataService.stats.coachesList.fieldText = null;
    this.dataService.stats.coachesList.isSearched = false;
    this.pageFilter = new pageFilter;
    this.filterApplied = false;
  }

  getFilterFields() {
    if (!this.dataService.organizationsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getOrganizationDropdown, 'organizations', 'organizationsDropdown').then(() => {
      })
    }
    this.dataService.stats.coachesList.fieldText = null

  }

  ngOnDestroy() {
    if (this.filterApplied) {
      this.getFreshData()
    }
  }

}