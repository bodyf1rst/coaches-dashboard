import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/service/data.service';
import { urlValidator } from 'src/app/validations/urlValidator';

@Component({
  selector: 'app-add-organization',
  templateUrl: './add-organization.component.html',
  styleUrls: ['./add-organization.component.scss']
})
export class AddOrganizationComponent implements OnInit {
  public isEdit: boolean = false;
  public editEmployees: boolean = false;
  public isSubmitted: boolean = false;
  public orId: any = null;
  public oForm: any = null;
  public orData: any = {}
  public imageUrl: any = null;
  public imageObj: any = {};
  public csvFileObj: any = {}
  public newDepartments: any = [];
  public selectAllEmployees: boolean = false;

  constructor(public dataService: DataService, public activeRoute: ActivatedRoute, private sanitizer: DomSanitizer) {
    dataService.pageTabView = 'Org Details';
  }

  ngOnInit(): void {
    this.oForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      address: new FormControl(''),
      website: new FormControl(null, [urlValidator()]),
      poc_name: new FormControl(null, [Validators.required]),
      poc_email: new FormControl('', [Validators.required, Validators.email]),
      poc_phone: new FormControl('+1', [
        Validators.pattern(/^\+1(\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})?$/),
        Validators.maxLength(16)
      ]),
      poc_title: new FormControl(null),
      departments: new FormControl([]),
      rewards: new FormControl([]),
      coaches: new FormControl(null),
      contract_start_date: new FormControl(null, [Validators.required]),
      contract_end_date: new FormControl(null, [Validators.required])

    })
    this.activeRoute.params.subscribe((res: any) => {
      this.orId = Number(res.id) || null;
      if (this.orId) {
        this.initializeData();
      } else {
        this.onEdit();
      }
    });
  }

  get f() {
    return this.oForm.controls;
  }

  goBack() {
    if (this.isEdit && this.orId) { this.isEdit = false } else {
      history.back()
    }
  }

  getTabData(tabView: string) {
    this.dataService.pageTabView = tabView;
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
    this.oForm.get('logo')?.reset();
  }

  initializeData() {
    this.orData = this.dataService.organizationsList?.organizations?.find((x: any) => x.id == this.orId);
    if (this.orData?.id) {
      if (!this.orData?.employees?.employees?.length) {
        this.getSingleorData();
        return
      }
      this.patchData(this.orData);
    } else {
      this.getSingleorData();
    }
  }

  getSingleorData(pageNumber?: number) {
    var apiName = this.dataService.httpService.getSingleOrganizationsApi + this.orId;
    if (pageNumber) {
      pageNumber = pageNumber + 1
      apiName += `?per_page=${10}&page=${pageNumber}`
    }
    this.dataService.httpService.getApiData(apiName).then((res: any) => {
      if (!this.orData?.id || !this.orData?.employees?.employees?.length) {
        this.orData = res.organization;
        let organizationIndex = this.dataService.organizationsList?.organizations?.findIndex((c: any) => c.id == this.orData.id);
        if (organizationIndex > -1) {
          this.dataService.organizationsList.organizations[organizationIndex] = this.orData;
        }
      } else if (this.orData?.id && this.orData?.employees?.employees?.length && pageNumber) {
        const oldEmployees: any = JSON.parse(JSON.stringify(this.orData.employees.employees));
        if (res.organization?.employees?.employees) {
          this.orData.employees = res.organization.employees;
          this.orData.employees.employees = oldEmployees.concat(res.organization.employees.employees);
        } else {
          console.error('Employee data is missing in the response');
        }
      }

      this.patchData(res.organization);
    }).catch((errors: any) => {
      if (errors.error.message == "Organization Not Found") {
        this.dataService.utils.showToast('danger', errors.error.message);
        window.history.back();
        return
      }
      this.dataService.onApiError(errors);
    }).finally(() => {
      this.dataService.isLoading = false;
    });
  }

  async patchData(Data: any) {
    Data = JSON.parse(JSON.stringify(Data));
    if (Data.coaches?.length) {
      var coachesIds: any = [];
      Data.coaches.forEach((x: any) => {
        coachesIds.push(x.id)
      });
      Data.coaches = coachesIds;
    }
    this.oForm.patchValue({
      name: Data.name,
      address: Data.address,
      website: Data.website,
      poc_name: Data.poc_name,
      poc_email: Data.poc_email,
      poc_phone: Data.poc_phone,
      poc_title: Data.poc_title,
      departments: Data.departments,
      rewards: Data.rewards,
      coaches: Data.coaches,
      contract_start_date: Data.contract_start_date,
      contract_end_date: Data.contract_end_date
    });
    this.imageUrl = Data.logo || '';
  }

  onEdit() {
    this.dataService.pageTabView = 'Org Details'
    this.isEdit = !this.isEdit;
    if (!this.dataService.departmentsDropdown?.length) {
      this.dataService.fetchDropdownData(5, this.dataService.httpService.getDepartmentsDropdownApi, 'departments', 'departmentsDropdown')
    }
    if (!this.dataService.rewardsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getRewardsDropdownApi, 'rewards', 'rewardsDropdown')
    }
    if (!this.dataService.coachesDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getCoachesDropdown, 'coaches', 'coachesDropdown')
    }
    if (this.isEdit) {
      this.patchData(this.orData);
    }
  }

  onSubmitForm(allowImport: boolean) {
    this.isSubmitted = true;
    if (this.oForm.valid) {
      if (this.imageObj?.size) {
        var imageSizeValid = this.dataService.utils.validateImageSize(this.imageObj)
        if (!imageSizeValid) {
          return
        }
      }
      this.oForm.get('poc_phone').value = this.oForm.get('poc_phone').value?.length > 2 ? this.oForm.get('poc_phone').value : '';
      this.dataService.isLoading = true;
      this.isSubmitted = false;
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
      } else if (this.orData?.submission?.status == 'Not Uploaded' && this.orData.submission.file && allowImport) {
        appendedFormData.append('file', this.orData.submission.file);
      }
      
      const apiName = this.orId
        ? this.dataService.httpService.updateOrganizationApi + this.orId
        : this.dataService.httpService.addOrganizationApi;

      this.dataService.httpService.postApiData(apiName, appendedFormData).then((res: any) => {
        
        this.imageObj = {};
        this.csvFileObj = {};

        this.orData = res.organization;
        this.patchData(res.organization);
        this.imageUrl = this.orData.logo || null;
        if (this.dataService.organizationsList?.organizations?.length) {
          let organizationIndex = this.dataService.organizationsList?.organizations?.findIndex((c: any) => c.id == this.orData.id);
          if (organizationIndex > -1) {
            this.dataService.organizationsList.organizations[organizationIndex] = this.orData;
          } else {
            this.dataService.organizationsList.organizations.unshift(this.orData);
          }
          if (res.departments?.length > 0) {
            this.showDepartmentsPopup(res.departments);
          } else {
            this.redirectOnPage(null, res.organization);
          }
        } else {
          if (res.departments?.length > 0) {
            this.showDepartmentsPopup(res.departments);
          } else {
            this.redirectOnPage(null, res.organization);
          }
        }
        document.getElementById('closeImportModalModal')?.click();
        this.dataService.utils.showToast('success', res.message);
        this.dataService.getDashboardData();
        if (res.message == 'Employees Imported Successfully.') {
          document.getElementById('openAfterImportedModal')?.click();
          this.dataService.dataUpdater.next('employeesUpdated')
        }

        if (res.organization.is_user_added > 0) {
          this.dataService.fetchData(1, this.dataService.httpService.getEmployeesApi, 'employees', 'usersList')
        }
      }).catch(async (errors: any) => {
        
        if (errors?.error?.file) {
          if (!this.orId) {
            this.orId = errors.error.organization.id;
          }
          if (errors?.error?.is_mailed == false) {
            
            document.getElementById('closeImportModalModal')?.click();
            document.getElementById('openEmailNModal')?.click();
            this.getSingleorData();
          }
          this.downloadFile(errors?.error?.file);
          if (errors?.error.departments?.length == 0) {
            this.redirectOnPage();
          }
          if (errors.error.organization.is_user_added > 0) {
            this.dataService.fetchData(1, this.dataService.httpService.getEmployeesApi, 'employees', 'usersList', '', `&user_type=Employee`)
          }
          if (errors.error.organization.id) {
            this.dataService.fetchData(1, this.dataService.httpService.getOrganizationsApi, 'organizations', 'organizationsList')
          }
          this.dataService.getDashboardData();
        }

        if (errors?.error.departments?.length > 0) {

          this.showDepartmentsPopup(errors?.error.departments);
        }
        
        if (errors?.error?.is_mailed == false) {
          
          document.getElementById('closeImportModalModal')?.click();
          document.getElementById('openEmailNModal')?.click();
        }
        this.dataService.utils.showToast('danger', errors.error.message, errors?.error?.file ? false : true, errors?.error?.file ? 1200000 : 5000);
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
        this.dataService.getDashboardData();
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
      this.redirectOnPage();
      this.dataService.fetchData(1, this.dataService.httpService.getOrganizationsApi, 'organizations', 'organizationsList')
    }).catch((errors: any) => {
      this.dataService.utils.showToast('danger', errors.error.message);
      this.dataService.onApiError(errors);
    })
  }

  redirectOnPage(onclick?: any, orgData?: any) {
    
    if (onclick || true) {
      document.getElementById('closedDepartmentModal')?.click();
    }
    this.isEdit = false;
    this.dataService.router.navigateByUrl('/manage-organizations/organization-detail/' + (this.orId ? this.orId : orgData.id));
    if (!this.orId && orgData?.id) {
      document.getElementById('openOrgCreatedModal')?.click();
    }
  }

  toggleAllCheckboxes() {
    this.orData?.employees?.employees.forEach((e: any) => {
      e.selected = this.selectAllEmployees;
    });
  }

  resetAllCheckbox() {
    this.orData?.employees?.employees.forEach((e: any) => {
      e.selected = false;
    });
    this.selectAllEmployees = false;
  }

  updateSelectAllState() {
    this.selectAllEmployees = this.orData?.employees?.employees.every((e: any) => e.selected);
  }

  deleteSelectedUsers() {
    this.dataService.isLoading = true;
    let tempIds: any = [];
    this.orData?.employees?.employees.forEach((ei: any) => {
      ei.selected ? tempIds.push(ei.id) : null;
    })
    let deleteUsersIds = {
      organization_id: this.orData.id,
      deleted_ids: tempIds
    }

    this.dataService.httpService.postApiData(this.dataService.httpService.deleteBulkEmployeesApi, deleteUsersIds).then((res: any) => {

      this.orData.employees.employees = this.orData?.employees?.employees?.filter((e: any) => !e.selected);
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
    return Array.isArray(this.orData?.employees?.employees) && this.orData?.employees?.employees.some((exercise: any) => exercise.selected);
  }

  ngOnDestroy() {
    this.orData = {}
  }

}
