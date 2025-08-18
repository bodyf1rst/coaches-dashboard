import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-manage-body-points',
  templateUrl: './manage-body-points.component.html',
  styleUrls: ['./manage-body-points.component.scss']
})
export class ManageBodyPointsComponent implements OnInit {
  public isSubmitted: boolean = false;
  public bpForm: any = {}

  constructor(public dataService: DataService, public fb: FormBuilder) { }

  ngOnInit(): void {
    this.bpForm = this.fb.group({
      profileComplete: ['', [Validators.required, Validators.min(1)]],
      accountabilityNone1: ['', [Validators.required, Validators.min(1)]],
      accountabilityLow1: ['', [Validators.required, Validators.min(1)]],
      accountabilityMedium1: ['', [Validators.required, Validators.min(1)]],
      accountabilityHigh1: ['', [Validators.required, Validators.min(1)]],
      accountabilityNone2: ['', [Validators.required, Validators.min(1)]],
      accountabilityLow2: ['', [Validators.required, Validators.min(1)]],
      accountabilityMedium2: ['', [Validators.required, Validators.min(1)]],
      accountabilityHigh2: ['', [Validators.required, Validators.min(1)]]
    });

    if (this.dataService.bodyPointsCalulation.status == "200") {
      this.patchData(this.dataService.bodyPointsCalulation.body_points);
    } else {
      this.getBodyPointsCalculation();
    }

    this.dataService.dataUpdater.subscribe((res: any) => {

      if (res == 'bodyPointsFetched') {
        this.patchData(this.dataService.bodyPointsCalulation.body_points);
      }
    })
  }

  get f() {
    return this.bpForm.controls;
  }

  getBodyPointsCalculation() {
    this.dataService.httpService.getApiData(this.dataService.httpService.getBodyPoints).then((res: any) => {
      this.dataService.bodyPointsCalulation = res;
      this.dataService.dataUpdater.next('bodyPointsFetched')
    }).catch((errors: any) => {
      this.dataService.onApiError(errors);
    }).finally(() => {
      this.dataService.isLoading = false;
    });
  }

  patchData(bodyPoints: any) {
    this.bpForm.patchValue({
      profileComplete: bodyPoints.points?.signup_compeletion?.profile || 0,
      accountabilityLow1: bodyPoints.points?.workout_and_exercise?.acccountability_low || 0,
      accountabilityHigh1: bodyPoints.points?.workout_and_exercise?.acccountability_high || 0,
      accountabilityNone1: bodyPoints.points?.workout_and_exercise?.acccountability_none || 0,
      accountabilityMedium1: bodyPoints.points?.workout_and_exercise?.acccountability_medium || 0,
      accountabilityLow2: bodyPoints.points?.daily_meal?.acccountability_low || 0,
      accountabilityHigh2: bodyPoints.points?.daily_meal?.acccountability_high || 0,
      accountabilityNone2: bodyPoints.points?.daily_meal?.acccountability_none || 0,
      accountabilityMedium2: bodyPoints.points?.daily_meal?.acccountability_medium || 0
    });
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.bpForm.valid) {
      this.dataService.isLoading = true;
      var formData = this.bpForm.value;
      const bodyPoints = {
        meta_key: "points",
        meta_value: {
          signup_compeletion: {
            profile: formData.profileComplete
          },
          workout_and_exercise: {
            acccountability_low: formData.accountabilityLow1,
            acccountability_high: formData.accountabilityHigh1,
            acccountability_none: formData.accountabilityNone1,
            acccountability_medium: formData.accountabilityMedium1
          },
          daily_meal: {
            acccountability_low: formData.accountabilityLow2,
            acccountability_high: formData.accountabilityHigh2,
            acccountability_none: formData.accountabilityNone2,
            acccountability_medium: formData.accountabilityMedium2
          },
        }
      }

      this.dataService.httpService.postApiData(this.dataService.httpService.updateBodyPoints, bodyPoints).then((res: any) => {
        this.dataService.bodyPointsCalulation.body_points = res.body_points;
        this.dataService.utils.showToast('success', res.message)
        this.isSubmitted = false;
        this.dataService.isLoading = false;
      }).catch((errors: any) => {
        this.dataService.onApiError(errors)
      })
    }
  }
}
