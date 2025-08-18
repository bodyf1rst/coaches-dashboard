import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public pForm: any = {}
  public isSubmitted: boolean = false;
  public isPSubmitted: boolean = false;
  public imageObj: any = {}
  public imageUrl: any = '';
  public passForm: any = {}
  oldPasswordVisible: boolean = false;
  newPasswordVisible: boolean = false;
  newPasswordConfirmVisible: boolean = false;

  constructor(public dataService: DataService) {
    this.dataService.pageTabView = 'My Profile'
  }

  ngOnInit(): void {
    this.pForm = new FormGroup({
      first_name: new FormControl('', [Validators.required]),
      last_name: new FormControl('', [Validators.required]),
      phone: new FormControl('+1', [
        Validators.pattern(this.dataService.utils.phonePattern),
        Validators.maxLength(16)
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
    });

    this.passForm = new FormGroup({
      old_password: new FormControl('', [Validators.required]),
      new_password: new FormControl('', [
        Validators.minLength(8),
        Validators.maxLength(25),
        Validators.required,
        Validators.pattern(this.dataService.utils.passwordPattern)
      ]),
      new_password_confirmation: new FormControl('', [
        Validators.minLength(8),
        Validators.maxLength(25),
        Validators.required,
        Validators.pattern(this.dataService.utils.passwordPattern)
      ]),

    });

    if (this.dataService.currentUserData.id) {
      this.patchData(this.dataService.currentUserData)
    }

    this.dataService.dataUpdater.subscribe((res: any) => {
      if (res == 'profileFetched') {
        this.patchData(this.dataService.currentUserData)
      }
    })

  }

  get f() {
    return this.pForm.controls;
  }

  get pf() {
    return this.passForm.controls;
  }

  getTabData(tabView: string) {
    this.dataService.pageTabView = tabView;
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file instanceof Blob) {
      const reader = new FileReader();
      this.imageObj = file;
      reader.onload = (e) => this.imageUrl = e.target?.result;
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imageUrl = null;
    this.pForm.get('profile_image')?.reset();
  }


  patchData(Data: any) {
    this.pForm.patchValue({
      first_name: Data.first_name,
      last_name: Data.last_name,
      phone: Data.phone,
      email: Data.email,
    });

    this.imageUrl = Data.profile_image || '';
  }

  onSubmitForm() {
    this.isSubmitted = true;
    if (this.pForm.valid) {
      if (this.imageObj?.size) {
        var imageSizeValid = this.dataService.utils.validateImageSize(this.imageObj)
        if (!imageSizeValid) {
          return
        }
      }
      this.dataService.isLoading = true;
      this.isSubmitted = false;
      const appendedFormData: FormData = new FormData();
      Object.keys(this.pForm.controls).forEach(key => {
        const value = this.pForm.get(key)?.value;
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
      this.dataService.httpService.postApiData(this.dataService.httpService.updateProfileApi, appendedFormData).then((res: any) => {
        this.imageObj = {};
        this.dataService.currentUserData = res.user;
        this.dataService.isAdminUser = this.dataService.isAdmin();
        this.imageUrl = this.dataService.currentUserData.profile_image || null;
        this.dataService.utils.showToast('success', res.message);
      }).catch((errors: any) => {
        this.dataService.utils.showToast('danger', errors.error.message);
        this.dataService.onApiError(errors);
      }).finally(() => {
        this.dataService.isLoading = false;
      });
    }
  }

  changePassword() {
    this.isPSubmitted = true;
    if (this.passForm.valid) {
      var formData = this.passForm.value;
      this.dataService.isLoading = true;
      this.isPSubmitted = false;
      this.dataService.httpService.postApiData(this.dataService.httpService.changePassApi, formData).then((res: any) => {

        this.dataService.utils.showToast('success', res.message);
      }).catch((errors: any) => {
        this.dataService.utils.showToast('danger', errors.error.message);
        this.dataService.onApiError(errors);
      }).finally(() => {
        this.dataService.isLoading = false;
      });
    }
  }

  togglePasswordVisibility(field: string) {
    if (field === 'old') {
      this.oldPasswordVisible = !this.oldPasswordVisible;
    } else if (field === 'new') {
      this.newPasswordVisible = !this.newPasswordVisible;
    } else if (field === 'confirm') {
      this.newPasswordConfirmVisible = !this.newPasswordConfirmVisible;
    }
  }

}
