import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-add-coach',
  templateUrl: './add-coach.component.html',
  styleUrls: ['./add-coach.component.scss']
})
export class AddCoachComponent implements OnInit {
  public isEdit: boolean = false;
  public isSubmitted: boolean = false;
  public coachId: any = null;
  public cForm: any = null;
  public coachData: any = {}
  public imageUrl: any = null;
  public imageObj: any = {};
  constructor(public dataService: DataService, public activeRoute: ActivatedRoute) {
    dataService.pageTabView = 'Coach Details';
  }

  ngOnInit(): void {
    this.cForm = new FormGroup({
      first_name: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(25)]),
      last_name: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(25)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('+1', [
        Validators.pattern(/^\+1(\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})?$/),
        Validators.maxLength(16)
      ]),
      gender: new FormControl(null),
      organizations: new FormControl([]),
      users: new FormControl([]),
    });

    this.activeRoute.params.subscribe((res: any) => {
      this.coachId = Number(res.id) || null;
      if (this.coachId) {
        this.initializeData();
      } else {
        this.onEdit();
      }
    });
  }

  get f() {
    return this.cForm.controls;
  }

  goBack() {
    if (this.isEdit && this.coachId) { this.isEdit = false } else {
      history.back()
    }
  }

  getTabData(tabView: string) {
    this.dataService.pageTabView = tabView;
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file instanceof Blob) {
      this.imageObj = file;
      const reader = new FileReader();
      reader.onload = (e) => this.imageUrl = e.target?.result;
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imageUrl = null;
    this.cForm.get('profile_image')?.reset();
  }

  initializeData() {
    this.coachData = this.dataService.coachesList?.coaches?.find((x: any) => x.id == this.coachId);
    if (this.coachData?.id) {
      if (!this.coachData?.users?.length && !this.coachData?.organizations?.length) {
        this.getSingleCoachData();
        return
      }
      this.patchData(this.coachData);
    } else {
      this.getSingleCoachData();
    }
  }

  getSingleCoachData() {
    this.dataService.httpService.getApiData(this.dataService.httpService.getSingleCoachApi + this.coachId).then((res: any) => {

      this.coachData = res.coach;
      this.patchData(res.coach);
      let coachIndex = this.dataService.coachesList?.coaches?.findIndex((c: any) => c.id == this.coachData.id);
      if (coachIndex > -1) {
        this.dataService.coachesList.coaches[coachIndex] = this.coachData;
      }
    }).catch((errors: any) => {
      if (errors.error.message == "Coach Not Found") {
        this.dataService.utils.showToast('danger', errors.error.message);
        window.history.back();
        return
      }
      this.dataService.onApiError(errors);
    }).finally(() => {
      this.dataService.isLoading = false;
    });
  }

  patchData(Data: any) {
    let users: any = [];
    Data.users?.forEach((x: any) => {
      users.push(x.id)
    })
    let organizations: any = [];
    Data.organizations?.forEach((x: any) => {
      organizations.push(x.id)
    })
    this.cForm.patchValue({
      first_name: Data.first_name,
      last_name: Data.last_name,
      email: Data.email,
      phone: Data.phone,
      gender: Data.gender || null,
      users: users || null,
      organizations: organizations || null
    });

    this.imageUrl = Data.profile_image || '';
  }

  onEdit() {
    this.dataService.pageTabView = 'Coach Details';
    this.isEdit = !this.isEdit;
    if (!this.dataService.organizationsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getOrganizationDropdown, 'organizations', 'organizationsDropdown')
    }
    if (!this.dataService.usersDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getUsersDropdownApi, 'users', 'usersDropdown')
    }
    if (this.isEdit) {
      this.patchData(this.coachData);
    }
  }

  onSubmitForm() {
    this.isSubmitted = true;
    if (this.cForm.valid) {
      if (this.imageObj?.size) {
        var imageSizeValid = this.dataService.utils.validateImageSize(this.imageObj)
        if (!imageSizeValid) {
          return
        }
      }
      this.dataService.isLoading = true;
      this.isSubmitted = false;
      const appendedFormData: FormData = new FormData();
      Object.keys(this.cForm.controls).forEach(key => {
        const value = this.cForm.get(key)?.value;
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item, idx) => {
              appendedFormData.append(`${key}[${idx}]`, item);
            })
          } else {
            appendedFormData.append(key, value);
          }
        }
      });
      if (this.imageObj instanceof File || this.imageObj instanceof Blob) {
        appendedFormData.append('profile_image', this.imageObj);
      }
      const apiName = this.coachId
        ? this.dataService.httpService.updateCoachApi + this.coachId
        : this.dataService.httpService.addCoachApi;

      this.dataService.httpService.postApiData(apiName, appendedFormData).then((res: any) => {

        this.imageObj = {};

        this.coachData = res.coach;
        this.imageUrl = this.coachData.profile_image || null;
        if (this.dataService.coachesList?.coaches?.length) {
          let coachIndex = this.dataService.coachesList?.coaches?.findIndex((c: any) => c.id == this.coachData.id);
          if (coachIndex > -1) {
            this.dataService.coachesList.coaches[coachIndex] = this.coachData;
          } else {
            this.dataService.coachesList.coaches.unshift(this.coachData)
            this.dataService.router.navigateByUrl('/coaches')
          }
        } else {
          this.dataService.router.navigateByUrl('/coaches/coach-detail/' + this.coachData.id)
        }
        this.isEdit = false;
        this.dataService.utils.showToast('success', res.message);
        this.dataService.getDashboardData();
      }).catch((errors: any) => {
        this.dataService.utils.showToast('danger', errors.error.message);
        this.dataService.onApiError(errors);
      }).finally(() => {
        this.dataService.isLoading = false;
      });
    }
  }

  action() {
    if (this.coachId) {
      this.dataService.isLoading = true;
      let data = { is_active: this.coachData.is_active == 0 ? this.coachData.is_active = 1 : this.coachData.is_active = 0 };
      let path: any = this.dataService.httpService.updateCoachApi + this.coachId;
      this.dataService.httpService.postApiData(path, data).then((res: any) => {

        this.coachData = res.coach;
        if (this.dataService.coachesList?.coaches?.length) {
          let coachIndex = this.dataService.coachesList?.coaches?.findIndex((c: any) => c.id == this.coachData.id);
          if (coachIndex > -1) {
            this.dataService.coachesList.coaches[coachIndex] = this.coachData;
          }
        }
        document.getElementById('closeActionModal')?.click();
        this.dataService.utils.showToast('success', res.message);
        this.dataService.isLoading = false;
      }).catch((errors: any) => {
        this.dataService.onApiError(errors);
      }).finally(() => {
        this.dataService.isLoading = false;
      });
    }
  }

  delete() {
    if (this.coachId) {
      this.dataService.isLoading = true;
      let path: any = this.dataService.httpService.deleteCoachApi + this.coachId;
      this.dataService.httpService.deleteApiData(path).then((res: any) => {
        if (this.dataService.coachesList?.coaches?.length) {
          let coachIndex = this.dataService.coachesList?.coaches?.findIndex((c: any) => c.id == this.coachData.id);
          if (coachIndex > -1) {
            this.dataService.coachesList.coaches.splice(coachIndex, 1);
          }
        }
        this.coachData = {}
        this.coachId = null;
        document.getElementById('closedModal')?.click();
        this.dataService.router.navigateByUrl('/coaches');
        this.dataService.utils.showToast('success', res.message);
        this.dataService.isLoading = false;
        this.dataService.getDashboardData();
      }).catch((errors: any) => {
        this.dataService.onApiError(errors);
      }).finally(() => {
        this.dataService.isLoading = false;
      });
    }
  }

  getCustomOrganizations(event: any) {
    this.dataService.fetchDropdownData(10, this.dataService.httpService.getOrganizationDropdown, 'organizations', 'organizationsDropdown', event)
  }

}
