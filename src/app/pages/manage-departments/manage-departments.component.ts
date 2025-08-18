import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/service/data.service';
import { StatsService } from 'src/app/service/stats.service';

@Component({
  selector: 'app-manage-departments',
  templateUrl: './manage-departments.component.html',
  styleUrls: ['./manage-departments.component.scss']
})
export class ManageDepartmentsComponent implements OnInit {
  public selectedItem: any = {};
  public formValue: string = '';
  public isEdit: boolean = false;
  public apiMapping: { [key: string]: string } = {
    'Departments': this.dataService.httpService.getDepartmentApi,
    'Rewards': this.dataService.httpService.getRewardsApi,
  };
  public pageTabMapping: any = {
    'Departments': { storage: 'departmentsList', key: 'departments' },
    'Rewards': { storage: 'rewardsList', key: 'rewards' },
  }

  constructor(public dataService: DataService, public stats: StatsService) {
    dataService.pageTabView = 'Departments';
    if (!this.dataService?.departmentsList?.departments?.length) {
      this.dataService.fetchData(1, this.dataService.httpService.getDepartmentApi, 'departments', 'departmentsList')
    }
  }

  ngOnInit(): void {
  }

  getTabData(tabView: string) {
    this.dataService.pageTabView = tabView;
    if (tabView == 'Departments') {
      if (!this.dataService?.departmentsList?.departments?.length) {
        this.dataService.fetchData(1, this.dataService.httpService.getDepartmentApi, 'departments', 'departmentsList')
      }
    } else if (tabView == 'Rewards') {
      if (!this.dataService?.rewardsList?.rewards?.length) {
        this.dataService.fetchData(1, this.dataService.httpService.getRewardsApi, 'rewards', 'rewardsList')
      }
    }
  }

  addItem() {
    this.formValue = '';
    this.isEdit = false;
  }

  onSearch() {
    const selectedApi = this.apiMapping[this.dataService.pageTabView];
    this.dataService.fetchData(1, selectedApi, this.pageTabMapping[this.dataService.pageTabView].key, this.pageTabMapping[this.dataService.pageTabView].storage, this.stats[this.pageTabMapping[this.dataService.pageTabView].storage].fieldText || '')
  }

  clearSearch() {
    const selectedApi = this.apiMapping[this.dataService.pageTabView];
    this.dataService.fetchData(1, selectedApi, this.pageTabMapping[this.dataService.pageTabView].key, this.pageTabMapping[this.dataService.pageTabView].storage);
    this.stats[this.pageTabMapping[this.dataService.pageTabView].storage].fieldText = null;
    this.stats[this.pageTabMapping[this.dataService.pageTabView].storage].isSearched = false;
  }

  create() {
    this.dataService.isFormSubmit = true;
    const apiMapping: { [key: string]: string } = {
      'Departments': this.dataService.httpService.addDepartmentApi,
      'Rewards': this.dataService.httpService.addRewardApi,
    };
    const selectedApi = apiMapping[this.dataService.pageTabView];
    if (!selectedApi) {
      this.dataService.utils.showToast('danger', 'Invalid Action');
      this.dataService.isFormSubmit = false;
      return;
    }
    const apiData = { name: this.formValue.trim() };
    this.dataService.httpService.postApiData(selectedApi, apiData).then((res: any) => {
      if (this.dataService.pageTabView == 'Departments') {
        this.dataService.departmentsList.departments.unshift(res.department);
      } else if (this.dataService.pageTabView == 'Rewards') {
        this.dataService.rewardsList.rewards.unshift(res.reward);
      }
      this.formValue = '';
      document.getElementById('closedRModal')?.click();
      this.dataService.isFormSubmit = false;
      this.dataService.utils.showToast('success', res.message);
    }).catch((errors: any) => {
      if (errors.error.message == "The name has already been taken.") {
        this.dataService.utils.showToast('warning', errors.error.message);
      }
      this.dataService.onApiError(errors);
      this.dataService.isFormSubmit = false;
    });
  }

  getValues(item: any) {
    this.isEdit = true;
    if (item) {
      this.selectedItem = item;
      this.formValue = item.name;
    }
  }

  update() {
    this.dataService.isFormSubmit = true;
    const apiMapping: { [key: string]: string } = {
      'Departments': this.dataService.httpService.updateDepartmentApi,
      'Rewards': this.dataService.httpService.updateRewardApi,
    };
    const selectedApi = apiMapping[this.dataService.pageTabView] + '/' + this.selectedItem.id;
    if (!selectedApi) {
      this.dataService.utils.showToast('danger', 'Invalid Action');
      this.dataService.isFormSubmit = false;
      return;
    }
    const apiData = { name: this.formValue.trim() };
    this.dataService.httpService.postApiData(selectedApi, apiData).then((res: any) => {
      if (this.dataService.pageTabView == 'Departments') {
        let itemIndex = this.dataService.departmentsList.departments.findIndex((i: any) => i.id == this.selectedItem.id);
        if (itemIndex > -1) {
          this.dataService.departmentsList.departments[itemIndex] = res.department;
        }
      } else if (this.dataService.pageTabView == 'Rewards') {
        let itemIndex = this.dataService.rewardsList.rewards.findIndex((i: any) => i.id == this.selectedItem.id);
        if (itemIndex > -1) {
          this.dataService.rewardsList.rewards[itemIndex] = res.reward;
        }
      }
      this.formValue = '';
      document.getElementById('closedRModal')?.click();
      this.dataService.isFormSubmit = false;
      this.dataService.utils.showToast('success', res.message);
    }).catch((errors: any) => {
      if (errors.error.message == "The name has already been taken.") {
        this.dataService.utils.showToast('warning', errors.error.message);
      }
      this.dataService.onApiError(errors);
      this.dataService.isFormSubmit = false;
    });
  }

  delete() {
    if (this.selectedItem.id) {
      const apiMapping: { [key: string]: string } = {
        'Departments': this.dataService.httpService.deleteDepartmentApi,
        'Rewards': this.dataService.httpService.deleteRewardApi,
      };
      const selectedApi = apiMapping[this.dataService.pageTabView] + this.selectedItem.id;
      if (!selectedApi) {
        this.dataService.utils.showToast('danger', 'Invalid Action');
        this.dataService.isFormSubmit = false;
        return;
      }
      this.dataService.httpService.deleteApiData(selectedApi).then((res: any) => {
        if (this.dataService.pageTabView == 'Departments') {
          let itemIndex = this.dataService.departmentsList.departments.findIndex((i: any) => i.id == this.selectedItem.id);
          if (itemIndex > -1) {
            this.dataService.departmentsList.departments.splice(itemIndex, 1);
          }
        } else if (this.dataService.pageTabView == 'Rewards') {
          let itemIndex = this.dataService.rewardsList.rewards.findIndex((i: any) => i.id == this.selectedItem.id);
          if (itemIndex > -1) {
            this.dataService.rewardsList.rewards.splice(itemIndex, 1);
          }
        }
        this.dataService.isFormSubmit = false;
        document.getElementById('closedModal')?.click();
        this.dataService.utils.showToast('success', res.message);
      }).catch((errors: any) => {
        this.dataService.utils.showToast('warning', errors.error.message);
        this.dataService.onApiError(errors);
        this.dataService.isFormSubmit = false;
      });
    }
  }
}
