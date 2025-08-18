import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/service/data.service';
import { urlValidator } from 'src/app/validations/urlValidator';

@Component({
  selector: 'app-organization-request-form',
  templateUrl: './organization-request-form.component.html',
  styleUrls: ['./organization-request-form.component.scss']
})
export class OrganizationRequestFormComponent implements OnInit {
  public isEdit: boolean = true;
  public editEmployees: boolean = false;
  public isSubmitted: boolean = false;
  public orToken: any = null;
  public orId: any = null;
  public oForm: any = null;
  public orData: any = {}
  public imageUrl: any = null;
  public imageObj: any = {};
  public csvFileObj: any = {}
  public newDepartments: any = [];
  public selectAllEmployees: boolean = false;
  public orStep: Number = 0;
  public errorFileObj: any = {};


  constructor(public dataService: DataService, public activeRoute: ActivatedRoute, private sanitizer: DomSanitizer) {

  }

  ngOnInit(): void {
    this.oForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      address: new FormControl(''),
      website: new FormControl(null, [Validators.required, urlValidator()]),
      poc_name: new FormControl(null, [Validators.required]),
      poc_email: new FormControl('', [Validators.required, Validators.email]),
      poc_phone: new FormControl('+1', [Validators.required,
      Validators.pattern(/^\+1\s?(\(?[0-9]{3}\)?[-.\s]?)([0-9]{3})[-.\s]?([0-9]{4})$/),
      Validators.maxLength(16)
      ]),
      poc_title: new FormControl(null, [Validators.required]),
      departments: new FormControl([]),

    })
    this.activeRoute.params.subscribe((res: any) => {
      this.orToken = res.token || null;
      if (this.orToken) {
        this.initializeData();
      } else {
        this.dataService.utils.showToast('danger', 'Invalid Request.')
      }
    });
    if (!this.dataService.departmentsDropdown?.length) {
      this.dataService.fetchDropdownData(5, this.dataService.httpService.getDepartmentsDropdownApi, 'departments', 'departmentsDropdown')
    }
  }

  get f() {
    return this.oForm.controls;
  }

  onFileSelected(event: Event, type?: any): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file instanceof Blob) {
      const reader = new FileReader();
      if (type) {
        this.csvFileObj = file;
      } else {
        this.imageObj = file;
        reader.onload = (e) => this.imageUrl = e.target?.result;
      }
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imageUrl = null;
    this.imageObj = null;
    this.oForm.get('logo').value = '';
  }

  initializeData() {
    this.dataService.httpService.getApiData(this.dataService.httpService.getOrganizationByToken + this.orToken).then((res: any) => {
      this.orData = res.organization;
      this.orId = this.orData.id;
      this.orStep = 1;
      this.patchData(this.orData)
    }).catch((errors: any) => {
      this.dataService.onApiError(errors)
      if (errors.error.message != 'Token Expired') {
        this.dataService.utils.showToast('danger', errors.error.message)
      } else {
        this.orStep = 3;
      }
    })
  }

  async patchData(Data: any) {
    Data = JSON.parse(JSON.stringify(Data));
    this.oForm.patchValue({
      name: Data.name,
      address: Data.address,
      website: Data.website,
      poc_name: Data.poc_name,
      poc_email: Data.poc_email,
      poc_phone: Data.poc_phone,
      poc_title: Data.poc_title,
      departments: Data.departments,
    });
    this.imageUrl = Data.logo || '';
  }

  onSubmitForm() {
    this.isSubmitted = true;
    this.errorFileObj = {};
    if (this.oForm.valid) {
      if (!this.imageObj || !this.imageUrl) {
        this.dataService.utils.showToast('danger', 'Please Check Required Fields.')
        return
      }
      if (this.imageObj?.size) {
        var imageSizeValid = this.dataService.utils.validateImageSize(this.imageObj)
        if (!imageSizeValid) {
          return
        }
      }
      this.dataService.isLoading = true;
      const appendedFormData: FormData = new FormData();
      Object.keys(this.oForm.controls).forEach(key => {
        const value = this.oForm.get(key)?.value;
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
        appendedFormData.append('logo', this.imageObj);
      }
      if (this.csvFileObj instanceof File || this.csvFileObj instanceof Blob) {
        appendedFormData.append('file', this.csvFileObj);
      } else {
        this.dataService.utils.showToast('danger', 'Please Check Required Fields.')
        this.dataService.isLoading = false;
        return
      }
      if (this.orToken.length) {
        appendedFormData.append('token', this.orToken)
      }
      this.isSubmitted = false;
      const apiName = this.dataService.httpService.updateOrganizationApi + this.orId;
      this.dataService.httpService.postApiData(apiName, appendedFormData).then((res: any) => {
        this.imageObj = {};
        this.csvFileObj = {};
        this.errorFileObj = {};
        this.orData = res.organization;
        this.imageUrl = this.orData.logo || null;
        this.orStep = 2;
      }).catch(async (errors: any) => {
        if (errors?.error?.file) {
          if (!this.orId) {
            this.orId = errors.error.organization.id;
          }
          this.downloadFile(errors?.error?.file);
        }
        if (!errors?.error?.file) {
          this.dataService.utils.showToast('danger', errors.error.message, errors?.error?.file ? false : true, errors?.error?.file ? 1200000 : 5000);
        } else {
          this.errorFileObj = {
            file: errors?.error?.file,
            message: errors.error.message
          }
        }
        this.dataService.onApiError(errors);
      }).finally(() => {
        this.dataService.isLoading = false;
      });
    } else {
      this.dataService.utils.showToast('danger', 'Please Check Required Fields.');
    }
  }

  downloadFile(fileUrl: string): void {
    if (fileUrl) {
      const sanitizedUrl: SafeUrl = this.sanitizer.bypassSecurityTrustUrl(fileUrl);
      if (sanitizedUrl) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error('Sanitization failed or URL is invalid.');
      }
    } else {
      console.error('Invalid file URL');
    }
  }

  action() {
    if (this.orId) {
      this.dataService.isLoading = true;
      let data = { is_active: this.orData.is_active == 0 ? this.orData.is_active = 1 : this.orData.is_active = 0 };
      let path: any = this.dataService.httpService.updateOrganizationApi + this.orId;
      this.dataService.httpService.postApiData(path, data).then((res: any) => {
        this.orData = res.organization;
        if (this.dataService.organizationsList?.organizations?.length) {
          let organizationIndex = this.dataService.organizationsList?.organizations?.findIndex((c: any) => c.id == this.orData.id);
          if (organizationIndex > -1) {
            this.dataService.organizationsList.organizations[organizationIndex] = this.orData;
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
    if (this.orId) {
      this.dataService.isLoading = true;
      let path: any = this.dataService.httpService.deleteOrganizationApi + this.orId;
      this.dataService.httpService.deleteApiData(path).then((res: any) => {
        if (this.dataService.organizationsList?.organizations?.length) {
          let organizationIndex = this.dataService.organizationsList?.organizations?.findIndex((c: any) => c.id == this.orData.id);
          if (organizationIndex > -1) {
            this.dataService.organizationsList.organizations.splice(organizationIndex, 1);
          }
        }
        this.orData = {}
        this.orId = null;
        document.getElementById('closedModal')?.click();
        this.dataService.router.navigateByUrl('/manage-organizations');
        this.dataService.utils.showToast('success', res.message);
        this.dataService.isLoading = false;
      }).catch((errors: any) => {
        this.dataService.onApiError(errors);
      }).finally(() => {
        this.dataService.isLoading = false;
      });
    }
  }

  showDepartmentsPopup(departmentsList: any) {
    this.newDepartments = departmentsList;
    if (this.newDepartments?.length > 0) {
      var modal = document.getElementById('openerDepartmentModal')
      modal?.click();
    }
  }

  addDepartments() {
    this.isEdit = !this.isEdit;
    var departments = {
      departments: this.newDepartments
    }
    this.dataService.httpService.postApiData(this.dataService.httpService.addBulkDepartmentApi, departments).then((res: any) => {
      this.dataService.departmentsDropdown.push(...res.departments);
      this.dataService.fetchData(1, this.dataService.httpService.getOrganizationsApi, 'organizations', 'organizationsList')
    }).catch((errors: any) => {
      this.dataService.utils.showToast('danger', errors.error.message);
      this.dataService.onApiError(errors);
    })
  }

  toggleAllCheckboxes() {
    this.orData.employees.forEach((e: any) => {
      e.selected = this.selectAllEmployees;
    });
  }

  resetAllCheckbox() {
    this.orData.employees.forEach((e: any) => {
      e.selected = false;
    });
    this.selectAllEmployees = false;
  }

  updateSelectAllState() {
    this.selectAllEmployees = this.orData.employees.every((e: any) => e.selected);
  }

  deleteSelectedUsers() {
    this.dataService.isLoading = true;
    let tempIds: any = [];
    this.orData.employees.forEach((ei: any) => {
      ei.selected ? tempIds.push(ei.id) : null;
    })
    let deleteUsersIds = {
      organization_id: this.orData.id,
      deleted_ids: tempIds
    }
    this.dataService.httpService.postApiData(this.dataService.httpService.deleteBulkEmployeesApi, deleteUsersIds).then((res: any) => {
      this.orData.employees = this.orData.employees?.filter((e: any) => !e.selected);
      this.selectAllEmployees = false;
      document.getElementById('closedBulkDeleteModal')?.click();
      this.dataService.utils.showToast('success', res.message);
      this.dataService.isLoading = false;
      this.dataService.fetchData(1, this.dataService.httpService.getEmployeesApi, 'employees', 'usersList')
    }).catch((errors) => {
      this.dataService.onApiError(errors);
    });
  }

  isAnyItemSelected() {
    return this.orData?.employees?.some((exercise: any) => exercise.selected);
  }
}
