import { Component, OnInit } from '@angular/core';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-manage-challenges',
  templateUrl: './manage-challenges.component.html',
  styleUrls: ['./manage-challenges.component.scss']
})
export class ManageChallengesComponent implements OnInit {
  public pageFilter: any = new pageFilter;
  public filterApplied: boolean = false;

  constructor(public dataService: DataService) {
    if (!this.dataService?.challengesList?.challenges?.length) {
      this.getFreshData();
    }
  }

  ngOnInit(): void {
  }

  getFreshData() {
    this.dataService.fetchData(1, this.dataService.httpService.getChallengesApi, 'challenges', 'challengesList')
  }

  onSearch() {
    let filterQuery = '';
    this.filterApplied = false;
    if (!this.dataService.stats.challengesList.fieldText?.length) {
      ['status', 'organization_id', 'coach_id'].forEach((filterKey) => {
        if (this.pageFilter[filterKey]) {
          filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
          this.filterApplied = true;
        }
      });
    }
    this.dataService
      .fetchData(1, this.dataService.httpService.getChallengesApi, 'challenges', 'challengesList', this.dataService.stats.challengesList.fieldText, filterQuery).then(() => {
        document.getElementById('closeFilter')?.click();
      });
  }

  clearSearch() {
    this.getFreshData();
    this.dataService.stats.challengesList.fieldText = null;
    this.dataService.stats.challengesList.isSearched = false;
    this.pageFilter = new pageFilter;
    this.filterApplied = false;
  }

  getFilterFields() {
    this.dataService.stats.challengesList.fieldText = null
    if (!this.dataService.organizationsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getOrganizationDropdown, 'organizations', 'organizationsDropdown').then(() => {
      })
    }
    if (!this.dataService.coachesDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getCoachesDropdown, 'coaches', 'coachesDropdown')
    }

  }

  getOrgCoaches() {
    if (this.pageFilter.organization_id) {
      const selectedOrganization = this.dataService.organizationsDropdown.find(
        (o: any) => o.id === Number(this.pageFilter.organization_id)
      );
      return [selectedOrganization?.coach] || [];
    } else {
      return this.dataService.coachesDropdown;
    }
  }

  ngOnDestroy() {
    if (this.filterApplied) {
      this.getFreshData()
    }
  }
}
