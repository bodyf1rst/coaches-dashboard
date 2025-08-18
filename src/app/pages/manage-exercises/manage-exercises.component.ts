import { Component, OnInit } from '@angular/core';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';
import { StatsService } from 'src/app/service/stats.service';

@Component({
  selector: 'app-manage-exercises',
  templateUrl: './manage-exercises.component.html',
  styleUrls: ['./manage-exercises.component.scss']
})
export class ManageExercisesComponent implements OnInit {
  public pageFilter: any = new pageFilter;
  public filterApplied: boolean = false;

  constructor(public dataService: DataService, public stats: StatsService) {
    if (!this.dataService?.exercisesList?.exercises?.length) {
      this.getFreshData();
    }
  }

  ngOnInit(): void {
  }

  getFreshData() {
    debugger
    this.dataService.fetchData(1, this.dataService.httpService.getExercisesApi, 'exercises', 'exercisesList');
    document.getElementById('closeFilter')?.click();
  }

  onSearch() {
    let filterQuery = '';
    this.filterApplied = false;
    if (!this.dataService.stats.exercisesList.fieldText?.length) {
      ['status', 'uploaded_by', 'coach_id', 'visibility_type'].forEach((filterKey) => {
        if (this.pageFilter[filterKey]) {
          filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
          this.filterApplied = true;
        }
      });
    }
    this.dataService.fetchData(
      1,
      this.dataService.httpService.getExercisesApi,
      'exercises',
      'exercisesList',
      this.dataService.stats.exercisesList.fieldText, filterQuery
    ).then(() => {

      document.getElementById('closeFilter')?.click();
    });
  }

  clearSearch() {
    this.getFreshData()
    this.dataService.stats.exercisesList.fieldText = null;
    this.dataService.stats.exercisesList.isSearched = false;
    this.pageFilter = new pageFilter;
    this.filterApplied = false;
  }

  getFilterFields() {
    if (!this.dataService.coachesDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getCoachesDropdown, 'coaches', 'coachesDropdown')
    }
    this.dataService.stats.exercisesList.fieldText = null
  }

  ngOnDestroy() {
    if (this.filterApplied) {
      this.getFreshData()
    }
  }

  getCoaches() {
    if (this.pageFilter.organization_id) {
      const selectedOrganization = this.dataService.coachesDropdown.find(
        (o: any) => o.id === Number(this.pageFilter.organization_id)
      );
      return [selectedOrganization?.coach] || [];
    } else {
      return this.dataService.coachesDropdown;
    }
  }

}
