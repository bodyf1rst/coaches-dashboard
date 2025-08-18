import { Injectable } from '@angular/core';
import { UtilsService } from './utils.service';
import { HttpService } from './http.service';
import { Router } from '@angular/router';
import { StatsService } from './stats.service';
import { BehaviorSubject, Subject } from 'rxjs';
import * as moment from 'moment';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // public isLiveMode: boolean = true;
  public dVersion: number = 0.4;
  public items_per_page: any = 30;
  public pageTabView = '';
  public isLoading: boolean = false;
  public isFormSubmit: boolean = false;
  public dataNotFound: boolean = false;
  public isMenuOpen: boolean = false;
  public placeholderItems: number[] = Array(6).fill(0);
  public allowSearch = true;
  public dataUpdater = new Subject<any>();
  public userFetchedSubject = new BehaviorSubject<boolean>(false);
  userFetched$ = this.userFetchedSubject.asObservable();
  [key: string]: any;
  public currentUserData: any = {};
  public isAdminUser: boolean = false;
  public dashboardStats: any = {};
  public organizationsList: any = {};
  public organizationSubmitionsList: any = {};
  public employeesList: any = {};
  public clientsList: any = {};
  public nutritionsCalculations: any = {};
  public bodyPointsCalulation: any = {};
  public trainingPreferences: any = {};
  public equipmentPreferences: any = {};
  public dietaryRestrictions: any = {}
  public departmentsList: any = {}
  public rewardsList: any = {}
  public coachesList: any = {}
  public challengesList: any = {};
  public videosList: any = {};
  public exercisesList: any = {};
  public workoutsList: any = {};
  public plansList: any = {};
  public tagsDropdown: any = [];
  public organizationsDropdown: any = [];
  public plansDropdown: any = [];
  public usersDropdown: any = [];
  public allUsersDropdown: any = [];
  public departmentsDropdown: any = [];
  public rewardsDropdown: any = [];
  public coachesDropdown: any = [];
  public trainingPreferencesDropdown: any = [];
  public equipmentPreferencesDropdown: any = [];
  public dietaryRestrictionsDropdown: any = [];
  public challengeTypeDropdown: any = []
  public notificationsList: any = {}
  public allFaqs: any = {}
  public staticContent: any = {}
  public introVideos: any = {}

  constructor(public utils: UtilsService, public stats: StatsService, public httpService: HttpService, public router: Router) {
    this.getLoginData();
  }

  // This funciton for error handling from API
  onApiError(errors?: any) {
    console.error(errors);
    if (errors?.error?.message == "Unauthenticated." || errors?.error?.message == "Token Expired!" || errors?.error?.message == 'Only Admins and Coaches are authorized to perform these actions') {
      this.clearData();
    }
    this.isLoading = false;
  }
  // This funciton Toggle the menu
  menuClick(action: boolean) {
    this.isMenuOpen = action;
    var mainArea: any = document.getElementsByClassName('main-dashboard-area');
    if (action) {
      mainArea[0].classList.add('menu-open')
    } else {
      mainArea[0].classList.remove('menu-open')
    }
  }
  // This funciton for fetch data after login user 
  getLoginData() {
    if (localStorage.getItem('userToken') && !this.currentUserData.id) {
      this.getCurrentUserData();
      this.getDashboardData();
    }
  }
  // This funciton for quit this app
  logout() {
    this.httpService.getApiData(this.httpService.logoutApi).then(async (res: any) => {
      this.clearData();
    }).catch((errors: any) => { this.onApiError(errors) });
  }
  // This funciton for fetch current login user.
  getCurrentUserData() {
    if (!this.currentUserData.id) {
      this.httpService.getApiData(this.httpService.getProfileApi).then((res: any) => {
        this.currentUserData = res.user;
        this.isAdminUser = this.isAdmin();
        this.dataUpdater.next('profileFetched')
        this.userFetchedSubject.next(true);
      }).catch((errors: any) => {
        console.error(errors);
        this.userFetchedSubject.next(false);
      });
    } else {
      this.userFetchedSubject.next(true);
    }
  }
  // This funciton for error fetch data from Api through its url keys params etc.
  fetchData(page: number, apiUrl: string, dataKey: string, storageKey: string, search?: any, filterParams?: string, subStorageKey?: string) {
    return new Promise((resolve, reject) => {
      this.isLoading = true;
      this.dataNotFound = false;
      let apiUrlWithParams = `${apiUrl}?per_page=${this.items_per_page}&page=${page}`;
      if (search) {
        apiUrlWithParams += `&search=${encodeURIComponent(search)}`;
      }
      if (filterParams) {
        apiUrlWithParams += `${filterParams}`;
      }
      this.httpService.getApiData(apiUrlWithParams).then((res: any) => {
        let storage: any;
        if (subStorageKey) {
          storage = (this as any)[storageKey] || {};
          storage[subStorageKey] = storage[subStorageKey] || {};
          if (Array.isArray(storage[subStorageKey][dataKey]) && page !== 1) {
            storage[subStorageKey][dataKey] = [...storage[subStorageKey][dataKey], ...res[dataKey]];
          } else {
            storage[subStorageKey][dataKey] = res[dataKey];
          }
        } else {
          storage = (this as any)[storageKey] || {};
          if (Array.isArray(storage[dataKey]) && page !== 1) {
            storage[dataKey] = [...storage[dataKey], ...res[dataKey]];
          } else {
            storage[dataKey] = res[dataKey];
          }
        }
        if (search) {
          this.stats[storageKey].isSearched = true;
        } else {
          this.stats[storageKey].isSearched = false;
        }
        const paginationInfo = {
          page: res.page,
          per_page: res.per_page,
          total_page: res.total_page,
          total_records: res.total_records
        };

        if (subStorageKey) {
          storage[subStorageKey] = {
            ...storage[subStorageKey],
            ...paginationInfo
          };
        } else {
          storage = {
            ...storage,
            ...paginationInfo
          };
        }
        if (
          (subStorageKey && !storage[subStorageKey]?.[dataKey]?.length) ||
          (!subStorageKey && !storage[dataKey]?.length)
        ) {
          this.dataNotFound = true;
        }
        if (subStorageKey) {
          (this as any)[storageKey] = {
            ...(this as any)[storageKey],
            [subStorageKey]: storage[subStorageKey]
          };
        } else {
          (this as any)[storageKey] = storage;
        }
        this.isLoading = false;
        resolve((this as any)[storageKey]);
      }).catch((errors: any) => {
        this.onApiError(errors);
        this.isLoading = false;
        reject(errors);
      });
    });
  }
  // This funciton for fatch dropdowns data into the app with its url name key etc
  fetchDropdownData(limit: number, apiUrl: string, dataKey: string, storageKey: string, search?: any) {
    return new Promise((resolve: any, reject: any) => {
      this.isLoading = true;
      this.dataNotFound = false;
      let apiUrlWithParams = `${apiUrl}?limit=${limit}`;
      if (search) {
        apiUrlWithParams += `&search=${encodeURIComponent(search)}`;
      }
      this.httpService.getApiData(apiUrlWithParams).then((res: any) => {
        let storage = (this as any)[storageKey] || {};
        storage = res[dataKey];
        (this as any)[storageKey] = [...storage];
        if (!(this as any)[storageKey]?.length) {
          this.dataNotFound = true;
        }
        this.isLoading = false;
        resolve((this as any)[storageKey])
      }).catch((errors: any) => {
        this.onApiError(errors);
        this.isLoading = false;
        reject(errors)
      });
    })
  }
  // This funciton for fetching more data of exiting list.
  searchMore(event: any, ApiName: any, storageKey: any, storage: any) {
    if (event?.term && event?.term?.length > 1 && !event?.items?.length && this.allowSearch) {
      let apiUrlWithParams = `${ApiName}?limit=10`;
      apiUrlWithParams += `&search=${encodeURIComponent(event.term)}`;
      this.allowSearch = false;
      this.httpService.getApiData(apiUrlWithParams)
        .then((res: any) => {
          (this as any)[storage].unshift(...res[storageKey] || res);
          this.allowSearch = true;
        })
        .catch((errors: any) => {
          this.onApiError(errors);
        });
    }
  }
  // This funciton for add more value like tags into dp/bucket if its not existing now.
  addCustom(name: string) {
    return name;
  }
  // This funciton for trim data according to format as we need.
  // This function will remove spaces + Capital Start letter and other will be in lower
  // Formate: Enter "new tag" will change inot "NewTag" 
  addCustomWithTrim = (name: string) => {
    let trimName = name.trim();
    let formattedName = trimName
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLocaleLowerCase())
      .join('');
    if (formattedName.length > 20) {
      if (this.utils && typeof this.utils.showToast === 'function') {
        this.utils.showToast('danger', 'Length should not be greater than 20.');
      } else {
        console.error('utils.showToast is not defined');
      }
      return;
    }

    return formattedName;
  };
  // This funciton for Identify is this user is admin or not.
  isAdmin(): boolean {
    return this.currentUserData && this.currentUserData.role === 'Admin';
  }
  // This funciton handle that user can action on init or not.
  // isAllowed(id: any, type: string): boolean {
  //   if (!this.currentUserData) {
  //     return false;
  //   }
  //   if (type === 'main') {
  //     return this.currentUserData.id === id || this.currentUserData.role === 'Admin';
  //   } else {
  //     return this.currentUserData.id === id;
  //   }
  // }
  // This funciton for return its item id creator is same or not
  // idNotEqual(id: any) {
  //   return (this.currentUserData && this.currentUserData.id != id);
  // }
  // This funciton for get current present today date.
  getTodayDate() {
    return moment(new Date()).format('yyyy-MM-DD');
  }
  // This funciton for change seconds into formate we need like Hr:Min:Sec
  convertSecondsToTime(sec: number): string {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    const paddedHours = hours.toString().padStart(2, '0');
    const paddedMinutes = minutes.toString().padStart(2, '0');
    const paddedSeconds = seconds.toString().padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  }
  // This funciton for simple go back or url
  goBack(isEdit: any, url: any) {
    !isEdit ? history.back() : this.router.navigateByUrl(`${url}`)
  }
  // This funciton for clear value of field.
  clearSelectField(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = ''
  }
  // This funciton use for cloning this items in add through its id and type.
  cloneItem(itemId: any, itemType: 'exercise' | 'video' | 'workout' | 'plan') {
    return new Promise((resolve: any, reject: any) => {
      this.isLoading = true;
      const apiEndpoint = this.getApiEndpoint(itemId, itemType);
      this.httpService.getApiData(apiEndpoint).then((res: any) => {
        const itemList = this.getItemList(itemType);
        if (itemList?.length) {
          itemList.unshift(res[itemType]);
        }
        this.router.navigateByUrl(`/${itemType}-detail/${res[itemType].id}`);
        this.isLoading = false;
        this.utils.showToast('success', res.message);
        resolve(res)
        this.getDashboardData();
      }).catch((errors: any) => {

        this.utils.showToast('danger', errors.error.message);
        this.onApiError(errors);
        reject(errors)
      });
    })
  }
  // Helper function to get the API endpoint based on item type
  private getApiEndpoint(itemId: any, itemType: string) {
    switch (itemType) {
      case 'exercise':
        return this.httpService.closeExercise + itemId;
      case 'video':
        return this.httpService.closeVideo + itemId;
      case 'workout':
        return this.httpService.closeWorkout + itemId;
      case 'plan':
        return this.httpService.closePlan + itemId;
      default:
        throw new Error('Unknown item type');
    }
  }
  // Helper function to get the appropriate item list based on item type
  private getItemList(itemType: string) {
    switch (itemType) {
      case 'exercise':
        return this.exercisesList?.exercises;
      case 'video':
        return this.videosList?.videos;
      case 'workout':
        return this.workoutsList?.workouts;
      case 'plan':
        return this.plansList?.plans;
      default:
        throw new Error('Unknown item type');
    }
  }
  // This funciton for fetching dashboard data.
  getDashboardData() {
    this.isLoading = true;
    this.httpService.getApiData(this.httpService.getDashboardStats).then((res: any) => {
      this.dashboardStats = res;
      this.dataUpdater.next('statsFetched')
      this.isLoading = false;
    }).catch((errors: any) => {
      this.utils.showToast('danger', errors.error.message);
      this.onApiError(errors);
    });
  }
  // This funciton for fetching Nutrition Data
  getNutritionCalculation() {
    this.httpService.getApiData(this.httpService.getNuritionCalculation).then((res: any) => {
      this.nutritionsCalculations = res;
      this.dataUpdater.next('nCalculationsFetched')
    }).catch((errors: any) => {
      this.onApiError(errors);
    }).finally(() => {
      this.isLoading = false;
    });
  }
  // This funciton for clear all data form lists and local storage.
  clearData(msg?: string) {
    localStorage.clear();
    const propertiesToReset = [
      'currentUserData',
      'organizationsList',
      'employeesList',
      'clientsList',
      'trainingPreferences',
      'equipmentPreferences',
      'dietaryRestrictions',
      'departmentsList',
      'rewardsList',
      'coachesList',
      'challengesList',
      'videosList',
      'exercisesList',
      'workoutsList',
      'plansList',
      'tagsDropdown',
      'organizationsDropdown',
      'usersDropdown',
      'departmentsDropdown',
      'rewardsDropdown',
      'coachesDropdown',
      'trainingPreferencesDropdown',
      'equipmentPreferencesDropdown',
      'dietaryRestrictionsDropdown',
      'challengeTypeDropdown',
      'dashboardStats',
      'plansDropdown'
    ];
    propertiesToReset.forEach(prop => {
      (this as any)[prop] = Array.isArray((this as any)[prop]) ? [] : {};
    });

    this.router.navigateByUrl('/login');
    this.utils.showToast('success', msg || 'Logout Successfully!');
  }
  // This funciton for set limt of input field that user can add.
  digitLimit(event: any, limit: number) {
    const value = event.target.value;
    if (value.length > limit) {
      event.target.value = value.slice(0, limit);
    }
  }
  // This funciton haddle if user select value then add none value it will remove other all values form list.
  noneCheck(selectedValues: any, formGroup: FormGroup, controlName: string) {
    if (selectedValues.includes('None')) {
      if (selectedValues.length > 1) {
        if (selectedValues[0] == 'None') {
          selectedValues = selectedValues.filter((item: string) => item !== 'None');
          formGroup.get(controlName)?.setValue(selectedValues);
        } else {
          formGroup.get(controlName)?.setValue(['None']);
        }
      } else {
        formGroup.get(controlName)?.setValue(['None']);
      }
    } else {
      formGroup.get(controlName)?.setValue(selectedValues);
    }
  }
  // This funciton for check this item can be delete or it will attached with other items.
  checkDeletion(id: any, type: string) {
    return new Promise((resovle, reject) => {
      var path: any = this.httpService.checkDeletion + id + `?type=${type}`;
      this.httpService.getApiData(path).then((res: any) => {
        resovle(res)
      }).catch((errors: any) => {
        reject(errors)
      })
    })
  }
  // This function for compair current data.
  isCreatedToday(created_at: any) {
    const createdAtDate = moment(created_at);
    const today = moment().startOf('day');
    return createdAtDate.isSame(today, 'day');
  }

  // Leaderboard methods
  getLeaderboard(formData: FormData) {
    return new Promise((resolve, reject) => {
      const path = this.httpService.getLeaderboard;
      this.httpService.postApiData(path, formData).then((res: any) => {
        resolve(res);
      }).catch((errors: any) => {
        reject(errors);
      });
    });
  }

  getUserRank(formData: FormData) {
    return new Promise((resolve, reject) => {
      const path = this.httpService.getUserRank;
      this.httpService.postApiData(path, formData).then((res: any) => {
        resolve(res);
      }).catch((errors: any) => {
        reject(errors);
      });
    });
  }

  getOrganizations() {
    return new Promise((resolve, reject) => {
      const path = this.httpService.getOrganizations;
      this.httpService.getApiData(path).then((res: any) => {
        resolve(res);
      }).catch((errors: any) => {
        reject(errors);
      });
    });
  }
}
