import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-manage-nutritions',
  templateUrl: './manage-nutritions.component.html',
  styleUrls: ['./manage-nutritions.component.scss']
})
export class ManageNutritionsComponent implements OnInit {
  public bmr_form: any = {};
  public tdee_form: any = {};
  public macronutrients_form: any = {};
  public isSubmitted: boolean = false;
  public isTSubmitted: boolean = false;
  public isMSubmitted: boolean = false;

  constructor(public dataService: DataService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.bmr_form = this.fb.group({
      male_weight: ['', [Validators.required, Validators.min(0)]],
      male_height: ['', [Validators.required, Validators.min(0)]],
      male_age: ['', [Validators.required, Validators.min(0)]],
      male_additional_value: ['', [Validators.required, Validators.min(0)]],
      female_weight: ['', [Validators.required, Validators.min(0)]],
      female_height: ['', [Validators.required, Validators.min(0)]],
      female_age: ['', [Validators.required, Validators.min(0)]],
      female_additional_value: ['', [Validators.required, Validators.min(0)]],
    });

    this.tdee_form = this.fb.group({
      not_active: ['', [Validators.required, Validators.min(0)]],
      slightly_active: ['', [Validators.required, Validators.min(0)]],
      moderately_active: ['', [Validators.required, Validators.min(0)]],
      very_active: ['', [Validators.required, Validators.min(0)]]
    });

    this.macronutrients_form = this.fb.group({
      tone_carbs: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      tone_fats: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      tone_proteins: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      tone_proteins_per_lb: ['', [Validators.required, Validators.min(0)]],

      build_carbs: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      build_fats: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      build_proteins: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      build_proteins_per_lb: ['', [Validators.required, Validators.min(0)]],

      loss_carbs: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      loss_fats: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      loss_proteins: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      loss_proteins_per_lb: ['', [Validators.required, Validators.min(0)]]
    });

    if (this.dataService.nutritionsCalculations.status == "200") {
      this.patchData(this.dataService.nutritionsCalculations.nutrition_calculations);
    } else {
      this.dataService.getNutritionCalculation();
    }

    this.dataService.dataUpdater.subscribe((res: any) => {

      if (res == 'nCalculationsFetched') {
        this.patchData(this.dataService.nutritionsCalculations.nutrition_calculations);
      }
    })

  }

  patchData(nutritionCalculations: any) {
    if (nutritionCalculations?.tdee) {
      this.tdee_form.patchValue({
        not_active: nutritionCalculations.tdee.not_active || '',
        slightly_active: nutritionCalculations.tdee.slightly_active || '',
        moderately_active: nutritionCalculations.tdee.moderately_active || '',
        very_active: nutritionCalculations.tdee.very_active || ''
      });
    }
    if (nutritionCalculations?.macronutrients) {
      this.macronutrients_form.patchValue({
        loss_carbs: nutritionCalculations.macronutrients.weight_loss.carbs || '',
        loss_fats: nutritionCalculations.macronutrients.weight_loss.fat || '',
        loss_proteins: nutritionCalculations.macronutrients.weight_loss.protein || '',
        loss_proteins_per_lb: nutritionCalculations.macronutrients.weight_loss.calories || '',

        build_carbs: nutritionCalculations.macronutrients.build_muscle.carbs || '',
        build_fats: nutritionCalculations.macronutrients.build_muscle.fat || '',
        build_proteins: nutritionCalculations.macronutrients.build_muscle.protein || '',
        build_proteins_per_lb: nutritionCalculations.macronutrients.build_muscle.calories || '',

        tone_carbs: nutritionCalculations.macronutrients.tone_tightness.carbs || '',
        tone_fats: nutritionCalculations.macronutrients.tone_tightness.fat || '',
        tone_proteins: nutritionCalculations.macronutrients.tone_tightness.protein || '',
        tone_proteins_per_lb: nutritionCalculations.macronutrients.tone_tightness.calories || ''
      });
    }
    if (nutritionCalculations?.bmr) {
      this.bmr_form.patchValue({
        male_weight: nutritionCalculations.bmr.male.weight || '',
        male_height: nutritionCalculations.bmr.male.height || '',
        male_age: nutritionCalculations.bmr.male.age || '',
        male_additional_value: nutritionCalculations.bmr.male.additional_value || '',
        female_weight: nutritionCalculations.bmr.female.weight || '',
        female_height: nutritionCalculations.bmr.female.height || '',
        female_age: nutritionCalculations.bmr.female.age || '',
        female_additional_value: nutritionCalculations.bmr.female.additional_value || '',
      });
    }
  }

  on_apply_bmr() {
    this.isSubmitted = true;
    if (this.bmr_form.valid) {
      this.on_apply_data('bmr')
    }
  }

  get bf() {
    return this.bmr_form.controls;
  }

  on_apply_tdee() {
    this.isTSubmitted = true;
    if (this.tdee_form.valid) {
      this.on_apply_data('tdee')
    }
  }

  get tf() {
    return this.tdee_form.controls;
  }

  on_apply_macronutrients() {
    this.isMSubmitted = true;
    if (this.macronutrients_form.valid) {
      this.on_apply_data('macronutrients')
    }
  }

  get mf() {
    return this.macronutrients_form.controls;
  }

  on_apply_data(metaKey: string) {
    this.dataService.isLoading = true;
    let dataToSend: any = {};
    let apiName = this.dataService.httpService.updateNuritionCalculation;
    if (metaKey === 'tdee' && this.tdee_form.valid) {
      const tdeeData = this.tdee_form.value;
      dataToSend = {
        meta_key: "tdee",
        meta_value: {
          not_active: tdeeData.not_active || null,
          slightly_active: tdeeData.slightly_active || null,
          moderately_active: tdeeData.moderately_active || null,
          very_active: tdeeData.very_active || null
        }
      };
    }
    else if (metaKey === 'macronutrients' && this.macronutrients_form.valid) {
      const macronutrientsData = this.macronutrients_form.value;
      dataToSend = {
        meta_key: "macronutrients",
        meta_value: {
          weight_loss: {
            fat: macronutrientsData.loss_fats || null,
            carbs: macronutrientsData.loss_carbs || null,
            protein: macronutrientsData.loss_proteins || null,
            calories: macronutrientsData.loss_proteins_per_lb || null
          },
          build_muscle: {
            fat: macronutrientsData.build_fats || null,
            carbs: macronutrientsData.build_carbs || null,
            protein: macronutrientsData.build_proteins || null,
            calories: macronutrientsData.build_proteins_per_lb || null
          },
          tone_tightness: {
            fat: macronutrientsData.tone_fats || null,
            carbs: macronutrientsData.tone_carbs || null,
            protein: macronutrientsData.tone_proteins || null,
            calories: macronutrientsData.tone_proteins_per_lb || null
          }
        }
      };
    }
    else if (metaKey === 'bmr' && this.bmr_form.valid) {
      const bmrData = this.bmr_form.value;
      dataToSend = {
        meta_key: "bmr",
        meta_value: {
          male: {
            age: bmrData.male_age || null,
            height: bmrData.male_height || null,
            weight: bmrData.male_weight || null,
            additional_value: bmrData.male_additional_value || null
          },
          female: {
            age: bmrData.female_age || null,
            height: bmrData.female_height || null,
            weight: bmrData.female_weight || null,
            additional_value: bmrData.female_additional_value || null
          }
        }
      };
    } else {
      console.log('Form is invalid or metaKey is not recognized.');
      return;
    }

    this.dataService.httpService.postApiData(apiName, dataToSend).then((res: any) => {

      this.dataService.nutritionsCalculations.nutrition_calculations[metaKey] = res.nutrition_calculations[metaKey];
      this.patchData(this.dataService.nutritionsCalculations.nutrition_calculations)
      this.dataService.utils.showToast('success', res.message)
      this.isSubmitted = false;
      this.isTSubmitted = false;
      this.isMSubmitted = false;
      this.dataService.isLoading = false;
    }).catch((errors: any) => {
      this.dataService.onApiError(errors)
    })
  }

  on_restore_defaults(restoreType: string) {
    this.dataService.isLoading = true;
    let apiName: string = this.dataService.httpService.resetNuritionCalculation + restoreType;
    this.dataService.httpService.getApiData(apiName).then((res: any) => {

      this.dataService.nutritionsCalculations.nutrition_calculations[restoreType] = res.nutrition_calculations[restoreType];
      this.patchData(this.dataService.nutritionsCalculations.nutrition_calculations)
      this.dataService.utils.showToast('success', res.message)
      this.dataService.isLoading = false;
    }).catch((errors: any) => {
      this.dataService.onApiError(errors)
    })
  }

}
