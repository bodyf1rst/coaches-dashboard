import { Component, OnInit } from '@angular/core';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';
import { StatsService } from 'src/app/service/stats.service';

@Component({
  selector: 'app-manage-workout',
  templateUrl: './manage-workout.component.html',
  styleUrls: ['./manage-workout.component.scss']
})
export class ManageWorkoutComponent implements OnInit {
  public pageFilter: any = new pageFilter;
  public filterApplied: boolean = false;

  constructor(public dataService: DataService, public stats: StatsService) {
    if (!this.dataService?.workoutsList?.workouts?.length) {
      this.getFreshData();
    }
  }

  ngOnInit(): void {
  }

  getFreshData() {
    this.dataService.fetchData(1, this.dataService.httpService.getWorkoutsApi, 'workouts', 'workoutsList')
  }

  onSearch() {
    let filterQuery = '';
    this.filterApplied = false;
    if (!this.dataService.stats.workoutsList.fieldText?.length) {
      ['status', 'uploaded_by', 'coach_id', 'visibility_type'].forEach((filterKey) => {
        if (this.pageFilter[filterKey]) {
          filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
          this.filterApplied = true;
        }
      });
    }
    this.dataService.fetchData(
      1,
      this.dataService.httpService.getWorkoutsApi,
      'workouts',
      'workoutsList',
      this.dataService.stats.workoutsList.fieldText, filterQuery
    ).then(() => {

      document.getElementById('closeFilter')?.click();
    });
  }

  clearSearch() {
    this.getFreshData()
    this.dataService.stats.workoutsList.fieldText = null;
    this.dataService.stats.workoutsList.isSearched = false;
    this.pageFilter = new pageFilter;
    this.filterApplied = false;
  }

  getFilterFields() {
    if (!this.dataService.coachesDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getCoachesDropdown, 'coaches', 'coachesDropdown')
    }
    this.dataService.stats.workoutsList.fieldText = null
  }

  ngOnDestroy() {
    if (this.filterApplied) {
      this.getFreshData()
    }
  }

  getCoaches() {
    if (this.pageFilter.organization_id) {
      const selectedOrganization = this.dataService.organizationsDropdown.find(
        (o: any) => o.id === Number(this.pageFilter.organization_id)
      );
      return [selectedOrganization?.coach] || [];
    } else {
      return this.dataService.coachesDropdown;
    }
  }

}
