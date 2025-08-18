import { Component, OnInit } from '@angular/core';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-manage-videos',
  templateUrl: './manage-videos.component.html',
  styleUrls: ['./manage-videos.component.scss']
})
export class ManageVideosComponent implements OnInit {
  public pageFilter: any = new pageFilter;
  public filterApplied: boolean = false;

  constructor(public dataService: DataService) {
    if (!this.dataService?.videosList?.videos?.length) {
      this.getFreshData();
    }
  }

  ngOnInit(): void {
  }

  getFreshData() {
    this.dataService.fetchData(1, this.dataService.httpService.getVideosApi, 'videos', 'videosList')
  }

  onSearch() {
    let filterQuery = '';
    this.filterApplied = false;
    if (!this.dataService.stats.videosList.fieldText?.length) {
      ['status', 'uploaded_by', 'coach_id', 'video_type'].forEach((filterKey) => {
        if (this.pageFilter[filterKey]) {
          filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
          this.filterApplied = true;
        }
      });
    }
    this.dataService
      .fetchData(1, this.dataService.httpService.getVideosApi, 'videos', 'videosList', this.dataService.stats.videosList.fieldText, filterQuery).then(() => {
        document.getElementById('closeFilter')?.click();
      });
  }

  clearSearch() {
    this.getFreshData();
    this.dataService.stats.videosList.fieldText = null;
    this.dataService.stats.videosList.isSearched = false;
    this.pageFilter = new pageFilter;
    this.filterApplied = false;
  }

  getFilterFields() {
    if (!this.dataService.coachesDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getCoachesDropdown, 'coaches', 'coachesDropdown')
    }
  }

  ngOnDestroy() {
    if (this.filterApplied) {
      this.getFreshData()
    }
  }
}
