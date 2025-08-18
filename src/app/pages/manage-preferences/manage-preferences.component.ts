import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/service/data.service';
import { StatsService } from 'src/app/service/stats.service';

@Component({
  selector: 'app-manage-preferences',
  templateUrl: './manage-preferences.component.html',
  styleUrls: ['./manage-preferences.component.scss']
})
export class ManagePreferencesComponent implements OnInit {
  public selectedItem: any = {};
  public formValue: string = '';
  public isEdit: boolean = false;
  public apiMapping: { [key: string]: string } = {
    'Training Preferences': this.dataService.httpService.getTrainingApi,
    'Equipment Preferences': this.dataService.httpService.getEquipmentsApi,
    'Dietary Restrictions': this.dataService.httpService.getDietaryRestrictionsApi,
  };

  public pageTabMapping: any = {
    'Training Preferences': { storage: 'trainingPreferences', key: 'training_preferences' },
    'Equipment Preferences': { storage: 'equipmentPreferences', key: 'equipment_preferences' },
    'Dietary Restrictions': { storage: 'dietaryRestrictions', key: 'dietary_restrictions' },
  }

  constructor(public dataService: DataService, public stats: StatsService) {
    dataService.pageTabView = 'Training Preferences';
    if (!this.dataService?.trainingPreferences?.training_preferences?.length) {
      this.dataService.fetchData(1, this.dataService.httpService.getTrainingApi, 'training_preferences', 'trainingPreferences')
    }
  }

  ngOnInit(): void {
  }

  getTabData(tabView: string) {
    this.dataService.pageTabView = tabView;
    if (tabView == 'Training Preferences') {
      if (!this.dataService?.trainingPreferences?.training_preferences?.length) {
        this.dataService.fetchData(1, this.dataService.httpService.getTrainingApi, 'training_preferences', 'trainingPreferences')
      }
    } else if (tabView == 'Equipment Preferences') {
      if (!this.dataService?.equipmentPreferences?.equipment_preferences?.length) {
        this.dataService.fetchData(1, this.dataService.httpService.getEquipmentsApi, 'equipment_preferences', 'equipmentPreferences')
      }
    } else {
      if (!this.dataService?.dietaryRestrictions?.dietary_restrictions?.length) {
        this.dataService.fetchData(1, this.dataService.httpService.getDietaryRestrictionsApi, 'dietary_restrictions', 'dietaryRestrictions')
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
      'Training Preferences': this.dataService.httpService.addTrainingApi,
      'Equipment Preferences': this.dataService.httpService.addEquipmentApi,
      'Dietary Restrictions': this.dataService.httpService.addDietaryRestrictionApi,
    };
    const selectedApi = apiMapping[this.dataService.pageTabView];
    if (!selectedApi) {
      this.dataService.utils.showToast('danger', 'Invalid Action');
      this.dataService.isFormSubmit = false;
      return;
    }
    const apiData = { name: this.formValue.trim() };
    this.dataService.httpService.postApiData(selectedApi, apiData).then((res: any) => {
      if (this.dataService.pageTabView == 'Training Preferences') {
        this.dataService.trainingPreferences.training_preferences.unshift(res.training_preference);
      } else if (this.dataService.pageTabView == 'Equipment Preferences') {
        this.dataService.equipmentPreferences.equipment_preferences.unshift(res.equipment_preference);
      } else if (this.dataService.pageTabView == 'Dietary Restrictions') {
        this.dataService.dietaryRestrictions.dietary_restrictions.unshift(res.dietary_restriction);
      }
      this.formValue = '';
      document.getElementById('closedRModal')?.click();
      this.dataService.isFormSubmit = false;
      this.dataService.utils.showToast('success', res.message);
    })
      .catch((errors: any) => {
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
      'Training Preferences': this.dataService.httpService.updateTrainingApi,
      'Equipment Preferences': this.dataService.httpService.updateEquipmentApi,
      'Dietary Restrictions': this.dataService.httpService.updateDietaryRestrictionApi,
    };
    const selectedApi = apiMapping[this.dataService.pageTabView] + '/' + this.selectedItem.id;
    if (!selectedApi) {
      this.dataService.utils.showToast('danger', 'Invalid Action');
      this.dataService.isFormSubmit = false;
      return;
    }
    const apiData = { name: this.formValue.trim() };
    this.dataService.httpService.postApiData(selectedApi, apiData)
      .then((res: any) => {
        if (this.dataService.pageTabView == 'Training Preferences') {
          let itemIndex = this.dataService.trainingPreferences.training_preferences.findIndex((i: any) => i.id == this.selectedItem.id);
          if (itemIndex > -1) {
            this.dataService.trainingPreferences.training_preferences[itemIndex] = res.training_preference;
          }
        } else if (this.dataService.pageTabView == 'Equipment Preferences') {
          let itemIndex = this.dataService.equipmentPreferences.equipment_preferences.findIndex((i: any) => i.id == this.selectedItem.id);
          if (itemIndex > -1) {
            this.dataService.equipmentPreferences.equipment_preferences[itemIndex] = res.equipment_preference;
          }
        } else if (this.dataService.pageTabView == 'Dietary Restrictions') {
          let itemIndex = this.dataService.dietaryRestrictions.dietary_restrictions.findIndex((i: any) => i.id == this.selectedItem.id);
          if (itemIndex > -1) {
            this.dataService.dietaryRestrictions.dietary_restrictions[itemIndex] = res.dietary_restriction;
          }
        }
        this.formValue = '';
        document.getElementById('closedRModal')?.click();
        this.dataService.isFormSubmit = false;
        this.dataService.utils.showToast('success', res.message);
      })
      .catch((errors: any) => {
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
        'Training Preferences': this.dataService.httpService.deleteTrainingApi,
        'Equipment Preferences': this.dataService.httpService.deleteEquipmentApi,
        'Dietary Restrictions': this.dataService.httpService.deleteDietaryRestrictionApi,
      };
      const selectedApi = apiMapping[this.dataService.pageTabView] + this.selectedItem.id;
      if (!selectedApi) {
        this.dataService.utils.showToast('danger', 'Invalid Action');
        this.dataService.isFormSubmit = false;
        return;
      }
      this.dataService.httpService.deleteApiData(selectedApi).then((res: any) => {
        if (this.dataService.pageTabView == 'Training Preferences') {
          let itemIndex = this.dataService.trainingPreferences.training_preferences.findIndex((i: any) => i.id == this.selectedItem.id);
          if (itemIndex > -1) {
            this.dataService.trainingPreferences.training_preferences.splice(itemIndex, 1);
          }
        } else if (this.dataService.pageTabView == 'Equipment Preferences') {
          let itemIndex = this.dataService.equipmentPreferences.equipment_preferences.findIndex((i: any) => i.id == this.selectedItem.id);
          if (itemIndex > -1) {
            this.dataService.equipmentPreferences.equipment_preferences.splice(itemIndex, 1);
          }
        } else if (this.dataService.pageTabView == 'Dietary Restrictions') {
          let itemIndex = this.dataService.dietaryRestrictions.dietary_restrictions.findIndex((i: any) => i.id == this.selectedItem.id);
          if (itemIndex > -1) {
            this.dataService.dietaryRestrictions.dietary_restrictions.splice(itemIndex, 1)
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
