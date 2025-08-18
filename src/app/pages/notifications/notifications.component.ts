import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';
import { StatsService } from 'src/app/service/stats.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  public pageFilter: any = new pageFilter;
  public filterApplied: boolean = false;
  public actionSelect: any = '';
  public searchQuery: any = '';
  public notificaionList: any = []
  public form: any = {}
  public isSubmited: boolean = false;
  public selectedItem: any = {}

  constructor(public dataService: DataService, public stats: StatsService, private fb: FormBuilder) {
    dataService.pageTabView = 'All Users';
    if (!this.dataService?.notificationsList?.allUsersNotifications?.notifications.length) {
      this.getFreshData(this.dataService.pageTabView)
    }
    if (!this.dataService.organizationsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getOrganizationDropdown, 'organizations', 'organizationsDropdown')
    }
    if (!this.dataService.usersDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getAllUsersDropdownApi, 'users', 'allUsersDropdown')
    }
  }

  ngOnInit() {
    this.form = this.fb.group({
      user_type: [null, Validators.required],
      users: [[], Validators.required],
      organizations: [[], Validators.required],
      title: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(25)]],
    });

  }

  onchange(event: any) {
    this.clearSearch();
    this.actionSelect = event.target.value;
    const usersControl = this.form.get('users');
    const organizationsControl = this.form.get('organizations');
    usersControl?.clearValidators();
    organizationsControl?.clearValidators();
    if (this.actionSelect === 'All Users') {
      usersControl?.clearValidators();
      organizationsControl?.clearValidators();
    } else if (this.actionSelect === 'Individual Users') {
      usersControl?.setValidators([Validators.required]);
      organizationsControl?.clearValidators();
    } else if (this.actionSelect === 'Organizations') {
      organizationsControl?.setValidators([Validators.required]);
      usersControl?.clearValidators();
    }
    usersControl?.updateValueAndValidity();
    organizationsControl?.updateValueAndValidity();
  }

  onSubmit() {
    this.isSubmited = true;
    if (this.form.valid) {
      this.dataService.isLoading = true;
      const formData = this.form.value;

      if (formData.user_type == 'All Users') {
        delete formData.users;
        delete formData.organizations;
      } else if (formData.user_type == 'Individual Users') {
        delete formData.organizations;
      } else if (formData.user_type == 'Organizations') {
        delete formData.users;
      }
      this.dataService.httpService.postApiData(this.dataService.httpService.sendNotifications, formData).then((res: any) => {

        if (formData.user_type === 'All Users' && this.dataService.notificationsList?.allUsersNotifications?.notifications?.length) {
          this.dataService.notificationsList.allUsersNotifications.notifications.unshift(res.notification);
        } else if (formData.user_type === 'Organizations' && this.dataService.notificationsList?.organizationNotifications?.notifications?.length) {
          this.dataService.notificationsList.organizationNotifications.notifications.unshift(res.notification);

        } else if (formData.user_type === 'Individual Users' && this.dataService.notificationsList?.IndividualUsersNotifications?.notifications?.length) {
          this.dataService.notificationsList.IndividualUsersNotifications.notifications.unshift(res.notification);

        } else {
          this.getFreshData(formData.user_type)
        }
        this.dataService.utils.showToast('success', res.message)
        document.getElementById('closedRModal')?.click();
        this.isSubmited = false;
        this.dataService.isLoading = false;
        this.resetForm();
      }).catch((errors: any) => {
        this.dataService.onApiError(errors)
      })
    } else {
      console.log('Form is not valid');
    }
  }

  resetForm() {
    this.form.reset();
    this.isSubmited = false;
    this.actionSelect = 'All Users'
  }

  getFreshData(tabView: any) {
    this.dataService.pageTabView = tabView;
    const subStorageKey = tabView === 'All Users' ? 'allUsersNotifications' : tabView === 'Organizations' ? 'organizationNotifications' : 'IndividualUsersNotifications';
    const notificationsExist = this.dataService.notificationsList?.[subStorageKey]?.notifications?.length > 0;

    if (notificationsExist) {
      this.clearSearch();
      return;
    }
    this.dataService.fetchData(
      1,
      this.dataService.httpService.getNotificaitons,
      'notifications',
      'notificationsList',
      '',
      `&user_type=${tabView}`,
      subStorageKey);
  }


  loadMoreNotifications(tabView: any) {
    const currentPage = this.getNotifications()?.page;
    const totalPage = this.getNotifications()?.total_page;
    const subStorageKey = tabView === 'All Users' ? 'allUsersNotifications' : tabView === 'Organizations' ? 'organizationNotifications' : 'IndividualUsersNotifications';
    if (currentPage !== undefined && totalPage !== undefined && currentPage < totalPage) {
      this.dataService.fetchData(
        currentPage + 1,
        this.dataService.httpService.getNotificaitons,
        'notifications',
        'notificationsList',
        this.stats.notificationsList.fieldText,
        `&user_type=${tabView}`,
        subStorageKey);
    }
  }

  getNotifications() {
    switch (this.dataService.pageTabView) {
      case 'All Users':
        return this.dataService.notificationsList?.allUsersNotifications ?? [];
      case 'Organizations':
        return this.dataService.notificationsList?.organizationNotifications ?? [];
      case 'Individual Users':
        return this.dataService.notificationsList?.IndividualUsersNotifications ?? [];
      default:
        return [];
    }
  }

  onSearch() {
    let filterQuery = '';
    this.filterApplied = false;
    if (!this.dataService.stats.notificationsList.fieldText?.length) {
      ['status', 'user_type', 'organization_id'].forEach((filterKey) => {
        if (this.pageFilter[filterKey]) {
          filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
          this.filterApplied = true;
        }
      });
    }
    filterQuery = `&user_type=${this.dataService.pageTabView}`
    const subStorageKey = this.dataService.pageTabView === 'All Users' ? 'allUsersNotifications' : 'IndividualUsersNotifications';
    this.dataService.fetchData(
      1,
      this.dataService.httpService.getNotificaitons,
      'notifications',
      'notificationsList',
      this.dataService.stats.notificationsList.fieldText,
      filterQuery,
      subStorageKey
    ).then(() => {
      document.getElementById('closeFilter')?.click();
    }).catch((error) => {
      console.error('Error fetching notifications data:', error);
    });
    this.dataService.stats.notificationsList.isSearched = true;
  }

  clearSearch() {
    this.dataService.stats.notificationsList.fieldText = null;
    this.dataService.stats.notificationsList.isSearched = false;
    this.pageFilter = new pageFilter;
    this.filterApplied = false;
  }

  delete() {
    if (this.selectedItem.id) {
      this.dataService.isLoading = true;
      let path: any = this.dataService.httpService.deleteNotification + this.selectedItem.id;

      this.dataService.httpService.deleteApiData(path).then((res: any) => {
        if (this.dataService.pageTabView === 'All Users') {
          if (this.dataService.notificationsList?.allUsersNotifications?.notifications?.length) {
            let notificationIndex = this.dataService.notificationsList.allUsersNotifications.notifications.findIndex((n: any) => n.id == this.selectedItem.id);
            if (notificationIndex > -1) {
              this.dataService.notificationsList.allUsersNotifications.notifications.splice(notificationIndex, 1);
            }
          }
        } else if (this.dataService.pageTabView === 'Organizations') {
          if (this.dataService.notificationsList?.organizationNotifications?.notifications?.length) {
            let notificationIndex = this.dataService.notificationsList.organizationNotifications.notifications.findIndex((n: any) => n.id == this.selectedItem.id);
            if (notificationIndex > -1) {
              this.dataService.notificationsList.organizationNotifications.notifications.splice(notificationIndex, 1);
            }
          }
        } else {
          if (this.dataService.notificationsList?.IndividualUsersNotifications?.notifications?.length) {
            let notificationIndex = this.dataService.notificationsList.IndividualUsersNotifications.notifications.findIndex((n: any) => n.id == this.selectedItem.id);
            if (notificationIndex > -1) {
              this.dataService.notificationsList.IndividualUsersNotifications.notifications.splice(notificationIndex, 1);
            }
          }
        }
        this.selectedItem = {};
        document.getElementById('closedModal')?.click();
        this.dataService.utils.showToast('success', res.message);
        this.dataService.isLoading = false;

      }).catch((errors: any) => {
        this.dataService.onApiError(errors);
      }).finally(() => {
        this.dataService.isLoading = false;
      });
    }
  }

  toggleRead(item: any) {
    item.isRead = !item.isRead;
  }

  ngOnDestroy() {
    if (this.filterApplied) {
      this.getFreshData(this.dataService.pageTabView)
    }
  }
}
