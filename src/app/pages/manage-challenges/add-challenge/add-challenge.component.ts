import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-add-challenge',
  templateUrl: './add-challenge.component.html',
  styleUrls: ['./add-challenge.component.scss']
})
export class AddChallengeComponent implements OnInit {
  public isEdit: boolean = false;
  public isSubmitted: boolean = false;
  public challengeId: any = null;
  public cForm: any = null;
  public challengeData: any = {}
  public imageUrl: any = null;
  public imageObj: any = {};
  public organizationCoaches: any = []

  constructor(public dataService: DataService, public activeRoute: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.cForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      organizations: new FormControl([]),
      coaches: new FormControl([]),
      type: new FormControl('Threshold', [Validators.required]),
      prize: new FormControl('', [Validators.required, Validators.min(1)]),
      challenge_type: new FormControl('', [Validators.required]),
      challenge_description: new FormControl('', [Validators.required, Validators.min(1)]),
      start_date: new FormControl('', [Validators.required]),
      duration: new FormControl('', [Validators.required]),
      end_date: new FormControl(''),
      description: new FormControl('', [Validators.required]),
    });

    this.activeRoute.params.subscribe((res: any) => {
      this.challengeId = Number(res.id) || null;
      if (this.challengeId) {
        this.initializeData();
      } else {
        this.onEdit();
      }
    });

    this.cForm.get('organizations')?.valueChanges.subscribe((organizationId: any) => {
      this.updateCoachesBasedOnOrganization(organizationId);
    });
    this.updateCoachesBasedOnOrganization(this.cForm.get('organizations')?.value);
  }

  get f() {
    return this.cForm.controls;
  }

  updateCoachesBasedOnOrganization(organizationId: string | string[]) {
    const selectedOrganizations = this.dataService.organizationsDropdown.filter((org: { id: string; coaches: any[] }) => {
      return this.isEdit ? org.id === organizationId : organizationId?.includes(org.id);
    });
    const coaches = selectedOrganizations.flatMap((org: { coaches: any[] }) => org.coaches || []);
    if (coaches.length > 0) {
      this.organizationCoaches = coaches;
      const selectedCoachIds = coaches.map((coach: { id: string }) => coach.id);
      this.cForm.get('coaches')?.setValue(selectedCoachIds);
    } else {
      this.organizationCoaches = [];
      this.cForm.get('coaches')?.setValue(null);
    }
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
    this.cForm.get('cover_image')?.reset();
  }

  initializeData() {
    this.challengeData = this.dataService.challengesList?.challenges?.find((x: any) => x.id == this.challengeId);
    if (this.challengeData?.id) {
      this.onEdit();
    } else {
      this.getSingleChallengeData();
    }
  }

  getSingleChallengeData() {
    let path = this.challengeId;
    let finalPath = this.dataService.httpService.getSingleChallengeApi + path;
    this.dataService.httpService.getApiData(finalPath).then((res: any) => {
      this.challengeData = res.challenge;
      this.onEdit();
      let challengeIndex = this.dataService.challengesList?.challenges?.findIndex((c: any) => c.id == this.challengeData.id);
      if (challengeIndex > -1) {
        this.dataService.challengesList.challenges[challengeIndex] = this.challengeData;
      }
    }).catch((errors: any) => {
      if (errors.error.message == "Challenge Not Found") {
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
    let coaches: any = [];
    Data.coaches?.forEach((x: any) => {
      coaches.push(x.id)
    })
    this.cForm.patchValue({
      title: Data.title || null,
      organizations: Data.organization_id || null,
      coaches: coaches || null,
      type: Data.type || null,
      prize: Data.prize || null,
      challenge_type: Data.challenge_type || null,
      challenge_description: Data.challenge_description || null,
      start_date: Data.start_date || null,
      duration: Data.duration || null,
      end_date: Data.end_date || null,
      description: Data.description || null,
    });

    this.imageUrl = Data.cover_image || '';
  }

  onEdit() {
    if (this.challengeData?.id) {
      this.isEdit = true;
    }
    const promises: Promise<any>[] = [];
    if (!this.dataService.challengeTypeDropdown?.length) {
      promises.push(
        this.dataService.fetchDropdownData(
          50,
          this.dataService.httpService.getChallengeTypeDropdown,
          'challenge_types',
          'challengeTypeDropdown'
        )
      );
    }
    if (!this.dataService.organizationsDropdown?.length) {
      promises.push(
        this.dataService.fetchDropdownData(
          50,
          this.dataService.httpService.getOrganizationDropdown,
          'organizations',
          'organizationsDropdown'
        )
      );
    }
    Promise.all(promises)
      .then(() => {
        if (this.isEdit && this.challengeData) {
          this.patchData(this.challengeData);
        }
      })
      .catch((error) => {
        console.error('Error loading dropdown data:', error);
      });
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
            });
          } else {
            appendedFormData.append(key, value);
          }
        }
      });
      if (this.isEdit) {
        let orgValue: any[] = [];
        let orgData = appendedFormData.get('organizations');

        if (orgData) {
          appendedFormData.delete('organizations');
          orgValue.push(orgData);
          orgValue.forEach((item, idx) => {
            appendedFormData.append(`organizations[${idx}]`, item);
          });
        }

        let coachValue: any[] = [];
        let coachData = appendedFormData.get('coaches');
        if (coachData) {
          appendedFormData.delete('coaches');
          coachValue.push(coachData);
          coachValue.forEach((item, idx) => {

            appendedFormData.append(`coaches[${idx}]`, item);
          });
        }
      } else {
        let orgIds = this.cForm.get('organizations').value;
        if (orgIds.length) {
          orgIds.forEach((orgId: any, oidx: any) => {
            appendedFormData.delete(`coaches[${oidx}]`);
            const selectedOrganization = this.dataService.organizationsDropdown.find((org: any) => org.id === orgId);
            let key = `coaches[${oidx}]`, value = selectedOrganization?.coach_id?.toString() || '';
            appendedFormData.append(key, value || '');
          });
        }

      }
      if (this.imageObj instanceof File || this.imageObj instanceof Blob) {
        appendedFormData.append('cover_image', this.imageObj);
      }
      const apiName = this.challengeId
        ? this.dataService.httpService.updateChallengeApi + this.challengeId
        : this.dataService.httpService.addChallengeApi;

      this.dataService.httpService.postApiData(apiName, appendedFormData).then((res: any) => {

        if (this.isEdit) {
          this.challengeData = res.challenge;
          this.imageUrl = this.challengeData.cover_image || null;
        } else {
          this.challengeData = res.challenges;
        }
        this.imageObj = {};
        if (this.isEdit) {
          if (this.dataService.challengesList?.challenges?.length) {
            let challengeIndex = this.dataService.challengesList?.challenges?.findIndex((c: any) => c.id == this.challengeData.id);
            if (challengeIndex > -1) {
              this.dataService.challengesList.challenges[challengeIndex] = this.challengeData;
              this.dataService.router.navigateByUrl('/challenge-detail/' + this.challengeData.id)
            } else {
              this.dataService.challengesList.challenges.unshift(this.challengeData)
              this.dataService.router.navigateByUrl('/manage-challenges')
            }
          } else {
            this.dataService.router.navigateByUrl('/challenge-detail/' + this.challengeData.id)
          }
        } else {
          if (this.dataService.challengesList?.challenges?.length) {
            this.dataService.challengesList.challenges.unshift(...this.challengeData)
          }
          this.dataService.router.navigateByUrl('/manage-challenges')
        }
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
    if (this.challengeId) {
      this.dataService.isLoading = true;
      let data = { is_active: this.challengeData.is_active == 0 ? this.challengeData.is_active = 1 : this.challengeData.is_active = 0 };
      let path: any = this.dataService.httpService.updateChallengeApi + this.challengeId;
      this.dataService.httpService.postApiData(path, data).then((res: any) => {

        this.challengeData = res.coach;
        if (this.dataService.challengesList?.challenges?.length) {
          let challengeIndex = this.dataService.challengesList?.challenges?.findIndex((c: any) => c.id == this.challengeData.id);
          if (challengeIndex > -1) {
            this.dataService.challengesList.challenges[challengeIndex] = this.challengeData;
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
    if (this.challengeId) {
      this.dataService.isLoading = true;
      let path: any = this.dataService.httpService.deleteChallengeApi + this.challengeId;
      this.dataService.httpService.deleteApiData(path).then((res: any) => {
        if (this.dataService.challengesList?.challenges?.length) {
          let challengeIndex = this.dataService.challengesList?.challenges?.findIndex((c: any) => c.id == this.challengeData.id);
          if (challengeIndex > -1) {
            this.dataService.challengesList.challenges.splice(challengeIndex, 1);
          }
        }
        this.challengeData = {}
        this.challengeId = null;
        document.getElementById('closedModal')?.click();
        this.dataService.router.navigateByUrl('/manage-challenges');
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

}
