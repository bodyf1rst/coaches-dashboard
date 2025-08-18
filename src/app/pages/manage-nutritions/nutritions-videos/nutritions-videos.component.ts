import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';
import { StatsService } from 'src/app/service/stats.service';

@Component({
  selector: 'app-nutritions-videos',
  templateUrl: './nutritions-videos.component.html',
  styleUrls: ['./nutritions-videos.component.scss']
})
export class NutritionsVideosComponent implements OnInit {
  public pageFilter: any = new pageFilter;
  public filterApplied: boolean = false;
  public searchQuery: any = '';
  public form: any = {}
  public isSubmited: boolean = false;
  public selectedItem: any = {}
  public isEdit: boolean = false;
  public imageUrl: any = ''

  constructor(public dataService: DataService, public stats: StatsService, private fb: FormBuilder) {
    if (!this.dataService?.introVideos?.nutritionVideos?.videos.length) {
      this.getFreshData()
    }

  }

  ngOnInit() {
  }

  getFreshData() {
    const videoExits = this.dataService.introVideos?.['nutritionVideos']?.videos?.length > 0;
    if (videoExits) {
      this.clearSearch();
      return;
    }
    this.dataService.fetchData(
      1,
      this.dataService.httpService.introVideos,
      'videos',
      'introVideos',
      '',
      `&type=Nutrition`,
      'nutritionVideos');
  }

  loadMoreVideos(tabView: any) {
    const currentPage = this.dataService.introVideos?.nutritionVideos?.page;
    const totalPage = this.dataService.introVideos?.nutritionVideos?.total_page;
    if (currentPage !== undefined && totalPage !== undefined && currentPage < totalPage) {
      this.dataService.fetchData(
        currentPage + 1,
        this.dataService.httpService.introVideos,
        'videos',
        'introVideos',
        this.stats.introVideos.fieldText,
        `&type=${tabView}`,
        'nutritionVideos');
    }
  }

  onSearch() {
    let filterQuery = '';
    this.filterApplied = false;
    if (!this.dataService.stats.introVideos.fieldText?.length) {
      ['status', 'user_type', 'organization_id'].forEach((filterKey) => {
        if (this.pageFilter[filterKey]) {
          filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
          this.filterApplied = true;
        }
      });
    }
    filterQuery = `&type=Nutrition`
    this.dataService.fetchData(
      1,
      this.dataService.httpService.introVideos,
      'videos',
      'introVideos',
      this.dataService.stats.introVideos.fieldText,
      filterQuery,
      'nutritionVideos'
    ).then(() => {
      document.getElementById('closeFilter')?.click();
    }).catch((error) => {
      console.error('Error fetching notifications data:', error);
    });
    this.dataService.stats.introVideos.isSearched = true;
  }

  clearSearch() {
    this.dataService.stats.introVideos.fieldText = null;
    this.dataService.stats.introVideos.isSearched = false;
    this.pageFilter = new pageFilter;
    this.filterApplied = false;
  }

  ngOnDestroy() {
    if (this.filterApplied) {
      this.getFreshData()
    }
  }
}
