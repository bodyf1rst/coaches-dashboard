import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.scss']
})
export class AddClientComponent implements OnInit {
  weightUnits = ['LBS', 'KG'];
  weightCurrentUnitIndex = 0;
  lengthUnits = ['CM', 'FT'];
  lengthCurrentUnitIndex = 0;
  public summary: any = {
    weight: 0,
    height: 0,
    bmr: 0,
    tdee: 0,
    protein: 0,
    fat: 0,
    carb: 0,
    calorie: 0,
  };
  public age: any = 0;
  public isEdit: boolean = false;
  public isSubmitted: boolean = false;
  public userId: any = null;
  public uForm: any = null;
  public userData: any = {}
  public submitedData: any = {};
  public imageUrl: any = null;
  public imageObj: any = {};
  public departmentsDropdown: any = [];
  public formulaData: any = {}
  public calculateValues: boolean = true;
  public emailEditable: boolean = false;

  constructor(public dataService: DataService, public activeRoute: ActivatedRoute) {
    dataService.pageTabView = 'User Details';
  }

  ngOnInit(): void {
    this.uForm = new FormGroup({
      first_name: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(25)]),
      last_name: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(25)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('+1', [
        Validators.pattern(/^\+1(\s?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})?$/),
        Validators.maxLength(16)
      ]),
      department: new FormControl(null),
      organization_id: new FormControl(null),
      coach_id: new FormControl(null),
      accountability: new FormControl(null),
      gender: new FormControl(null),
      dob: new FormControl(null),
      age: new FormControl(null),
      weight: new FormControl(null),
      height: new FormControl(null),
      bmr: new FormControl(null),
      tdee: new FormControl(null),
      calorie: new FormControl(null),
      protein: new FormControl(null),
      carb: new FormControl(null),
      fat: new FormControl(null),
      activity_level: new FormControl(null),
      goal: new FormControl(null),
      daily_meal: new FormControl(null),
      dietary_restrictions: new FormControl([]),
      equipment_preferences: new FormControl([]),
      training_preferences: new FormControl([]),

    })
    if (this.dataService.nutritionsCalculations.status == "200") {
      this.formulaData = this.dataService.nutritionsCalculations.nutrition_calculations;
    } else {
      this.dataService.getNutritionCalculation();
    }

    this.dataService.dataUpdater.subscribe((res: any) => {

      if (res == 'nCalculationsFetched') {
        this.formulaData = this.dataService.nutritionsCalculations.nutrition_calculations;
      }
    })

    this.activeRoute.params.subscribe((res: any) => {
      this.userId = Number(res.id) || null;
      if (this.userId) {
        this.initializeData();
      } else {
        this.onEdit();
      }
    });
    this.subscribeToFormChanges();
  }

  getTabData(tabView: string) {
    this.dataService.pageTabView = tabView;
  }

  goBack() {
    if (this.isEdit && this.userId) { this.isEdit = false; this.emailEditable = false; } else {
      history.back()
    }
  }

  get f() {
    return this.uForm.controls;
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
    this.uForm.get('profile_image')?.reset();
  }

  get wightCurrentUnit() {
    return this.weightUnits[this.weightCurrentUnitIndex];
  }

  toggleWeightUnit(event: any) {
    event.stopPropagation();
    let prevIndex = this.weightCurrentUnitIndex;
    this.weightCurrentUnitIndex = (this.weightCurrentUnitIndex + 1) % this.weightUnits.length;
    const currentWeight = this.uForm.get('weight').value;
    let convertedWeight;

    if (this.weightCurrentUnitIndex === 0) {
      // Convert KG to LBS
      convertedWeight = (currentWeight * 2.20462).toFixed(2);
    } else {
      // Convert LBS to KG
      convertedWeight = (currentWeight / 2.20462).toFixed(2);
    }

    this.uForm.get('weight').setValue(parseFloat(convertedWeight));
    this.dataService.utils.showToast('success', `Weight changed ${this.weightUnits[prevIndex]} to ${this.weightUnits[this.weightCurrentUnitIndex]}`)
  }

  get lengthCurrentUnit() {
    return this.lengthUnits[this.lengthCurrentUnitIndex];
  }

  toggleLengthUnit(showToast: boolean = true) {
    debugger
    var prevIndex = this.lengthCurrentUnitIndex;
    this.lengthCurrentUnitIndex = (this.lengthCurrentUnitIndex + 1) % this.lengthUnits.length;
    const currentHeight = this.uForm.get('height').value;
    let convertedHeight;

    if (this.lengthCurrentUnitIndex === 0) {
      // Convert FT to CM
      convertedHeight = (currentHeight * 30.48).toFixed(2);
    } else {
      // Convert CM to FT
      convertedHeight = (currentHeight / 30.48).toFixed(1);
    }
    debugger
    this.uForm.get('height').setValue(parseFloat(convertedHeight));
    this.userData.height = convertedHeight;
    debugger
    this.submitedData = this.userData;
    if (showToast) {
      this.dataService.utils.showToast('success', `Length changed ${this.lengthUnits[prevIndex]} to ${this.lengthUnits[this.lengthCurrentUnitIndex]}`)
    }
  }

  calculateAge(dob: string) {
    if (dob) {
      const birthDate = moment(dob, 'YYYY-MM-DD');
      const today = moment();
      const years = today.diff(birthDate, 'years');
      birthDate.add(years, 'years');
      const months = today.diff(birthDate, 'months');
      const ageInYears = years + (months / 12);
      this.age = parseFloat(ageInYears.toFixed(1));
      // this.age = Math.floor(ageInYears);
    } else {
      this.age = null;
    }
  }

  calculateBMR(weight: number, height: number, age: number, gender: string) {
    if (weight > 0 && height > 0 && age > 0 && gender) {
      // Convert weight to KG if it's in LBS
      if (this.weightUnits[this.weightCurrentUnitIndex] === 'LBS') {
        weight = weight / 2.20462;
      }
      // Convert height to CM if it's in FT
      if (this.lengthUnits[this.lengthCurrentUnitIndex] === 'FT') {
        height = height * 30.48;
      }
      weight = Number(weight) || 0;
      height = Number(height) || 0;
      age = Number(age) || 0;
      let bmr: any = 0;
      if (gender?.toLowerCase() === 'male') {
        bmr = this.formulaData.bmr?.male.weight * weight + this.formulaData.bmr?.male.height * height - this.formulaData.bmr?.male.age * age + this.formulaData.bmr?.male.additional_value;
      } else if (gender?.toLowerCase() === 'female') {
        bmr = this.formulaData.bmr?.female.weight * weight + this.formulaData.bmr?.female.height * height - this.formulaData.bmr?.female.age * age - this.formulaData.bmr?.female.additional_value;
      }
      return bmr.toFixed(2) || 0;
    }
  }

  calculateTDEE(bmr: number, activityLevel: string) {
    let tdee: number;

    switch (activityLevel) {
      case 'Not Active':
        tdee = bmr * this.formulaData.tdee?.not_active;
        break;
      case 'Slightly Active':
        tdee = bmr * this.formulaData.tdee?.slightly_active;
        break;
      case 'Moderate Active':
        tdee = bmr * this.formulaData.tdee?.moderately_active;
        break;
      case 'Very Active':
        tdee = bmr * this.formulaData.tdee?.very_active;
        break;
      default:
        tdee = 0;
    }

    return tdee.toFixed(2) || 0;
  }

  calculateMacros(tdee: number, goal: string): { calories: number; protein: number; fat: number; carbs: number } {
    const goals = {
      'Weight Loss': { calorieDeficit: this.formulaData.macronutrients?.weight_loss.calories, carbs: this.formulaData.macronutrients?.weight_loss.carbs / 100, fat: this.formulaData.macronutrients?.weight_loss.fat / 100, protein: this.formulaData.macronutrients?.weight_loss.protein / 100 },
      'Tone & Tighten': { calorieDeficit: this.formulaData.macronutrients?.tone_tightness.calories, carbs: this.formulaData.macronutrients?.tone_tightness.carbs / 100, fat: this.formulaData.macronutrients?.tone_tightness.fat / 100, protein: this.formulaData.macronutrients?.tone_tightness.protein / 100 },
      // 'Build Muscle': { calorieSurplus: [250, 500], carbs: 0.5, fat: 0.2, protein: 0.3 },
      'Build Muscle': { calorieDeficit: this.formulaData.macronutrients?.build_muscle.calories, carbs: this.formulaData?.macronutrients?.build_muscle.carbs / 100, fat: this.formulaData.macronutrients?.build_muscle.fat / 100, protein: this.formulaData.macronutrients?.build_muscle.protein / 100 },
    };

    let calories: number;

    if (goal === 'Weight Loss' || goal === 'Tone & Tighten' || goal === 'Build Muscle') {
      calories = tdee - goals[goal].calorieDeficit;
    } else {
      return {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,

      }
    }

    const proteinCalories = goals[goal].protein * calories;
    const fatCalories = goals[goal].fat * calories;
    const carbsCalories = goals[goal].carbs * calories;
    calories = Number(calories.toFixed(2));
    const proteinGrams = Number((proteinCalories / 4).toFixed(2));
    const fatGrams = Number((fatCalories / 9).toFixed(2));
    const carbsGrams = Number((carbsCalories / 4).toFixed(2));
    return {
      calories: calories > 0 ? calories : 0,
      protein: proteinGrams > 0 ? proteinGrams : 0,
      fat: fatGrams > 0 ? fatGrams : 0,
      carbs: carbsGrams > 0 ? carbsGrams : 0,
    };
  }

  subscribeToFormChanges() {
    this.uForm.valueChanges.subscribe((val: any) => {
      const subscription = this.uForm.valueChanges.subscribe();
      if (this.calculateValues) {
        this.calculateAge(val.dob)
        const weight = val.weight || 0;
        const height = val.height || 0;
        const bmr = this.calculateBMR(weight, height, this.age, val.gender);
        const tdee = Number(this.calculateTDEE(bmr, val.activity_level));
        const macros = this.calculateMacros(tdee, val.goal);
        this.summary.weight = weight;
        this.summary.height = height;
        this.summary.bmr = bmr || 0;
        this.summary.tdee = tdee || 0;
        this.summary.protein = macros.protein || 0;
        this.summary.fat = macros.fat || 0;
        this.summary.carb = macros.carbs || 0;
        this.summary.calorie = macros.calories || 0;
      }
      this.uForm.patchValue({
        age: this.age,
        bmr: this.summary.bmr,
        tdee: this.summary.tdee,
        protein: this.summary.protein,
        fat: this.summary.fat,
        carb: this.summary.carb,
        calorie: this.summary.calorie,
      }, { emitEvent: false }); // Prevent triggering valueChanges again
      // Resubscribe if needed
      subscription.unsubscribe();
    });
  }

  checkField(fieldName: any) {
    if (fieldName) {
      this.uForm.get('coach_id')?.setValue(null);
    } else {
      this.uForm.get('organization_id')?.setValue(null);
      this.uForm.get('department')?.setValue(null);
    }
  }

  initializeData() {
    this.userData = this.dataService.employeesList?.employees?.find((x: any) => x.id == this.userId);
    if (!this.userData?.id) {
      this.userData = this.dataService.clientsList?.employees?.find((x: any) => x.id == this.userId)
    }
    this.submitedData = this.userData;
    if (this.userData?.id && this.userData.fitness_plans?.length) {
      this.patchData(this.userData);
    } else {
      this.getSingleUserData();
    }
  }

  getSingleUserData() {
    this.dataService.httpService.getApiData(this.dataService.httpService.getSingleEmployeeApi + this.userId).then((res: any) => {
      this.userData = res.employee;
      this.userData.fitnessPlans = res.fitness_plans || [];
      this.submitedData = this.userData;
      this.patchData(res.employee);
      var listName = res.employee.organization_id ? 'employeesList' : 'clientsList';
      let userIndex = this.dataService[listName]?.employees?.findIndex((c: any) => c.id == this.userData.id);
      if (userIndex > -1) {
        this.dataService[listName].employees[userIndex] = this.userData;
      }
    }).catch((errors: any) => {
      if (errors.error.message == "User Not Found") {
        this.dataService.utils.showToast('danger', errors.error.message);
        window.history.back();
        return
      }
      this.dataService.onApiError(errors);
    }).finally(() => {
      this.dataService.isLoading = false;
    });
  }

  patchData(Data: any, calculateHeight: boolean = true) {
    debugger
    this.uForm.patchValue({
      first_name: Data.first_name,
      last_name: Data.last_name,
      email: Data.email,
      phone: Data.phone,
      coach_id: Data.coach_id,
      organization_id: Data.organization_id,
      department: Data.department || null,
      accountability: Data.accountability || null,
      gender: Data.gender || null,
      dob: Data.dob || null,
      age: Data.age || null,
      weight: Data.weight || null,
      height: Data.height || null,
      calorie: Data.calorie || null,
      protein: Data.protein || null,
      carb: Data.carb || null,
      fat: Data.fat || null,
      activity_level: Data.activity_level || null,
      goal: Data.goal || null,
      daily_meal: Data.daily_meal || null,
      dietary_restrictions: Data.dietary_restrictions || null,
      equipment_preferences: Data.equipment_preferences || null,
      training_preferences: Data.training_preferences || null
    });
    if (calculateHeight) {
      // this.lengthCurrentUnitIndex = 0;
      this.toggleLengthUnit(false)
    }
    this.age = Data.age;
    this.imageUrl = Data.profile_image || '';
    this.summary = {
      weight: Data.weight || 0,
      height: Data.height || 0,
      bmr: Data.bmr || 0,
      tdee: Data.tdee || 0,
      calorie: Data.calorie || 0,
      protein: Data.protein || 0,
      fat: Data.fat || 0,
      carb: Data.carb || 0,
    }
  }

  onEdit() {
    debugger
    this.dataService.pageTabView = 'User Details';
    this.isEdit = !this.isEdit;
    if (!this.dataService.organizationsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getOrganizationDropdown, 'organizations', 'organizationsDropdown').then(() => {
        if (this.userData?.organization_id) {
          this.onOrganizationSelect(this.userData?.organization_id)
        }
      })
    }
    if (!this.dataService.coachesDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getCoachesDropdown, 'coaches', 'coachesDropdown')
    }
    if (!this.dataService.dietaryRestrictionsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getDietaryRestrictionsDropdownApi, 'dietary_restrictions', 'dietaryRestrictionsDropdown')
    }
    if (!this.dataService.trainingPreferencesDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getTrainingDropdown, 'training_preferences', 'trainingPreferencesDropdown')
    }
    if (!this.dataService.equipmentPreferencesDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getEquipmentDropdown, 'equipment_preferences', 'equipmentPreferencesDropdown')
    }

    if (this.userData?.organization_id) {
      this.onOrganizationSelect(this.userData?.organization_id)
    }
    if (this.isEdit || !this.userId) {
      this.lengthCurrentUnitIndex = 1;
    }
    if (this.isEdit || this.userId) {
      this.patchData(JSON.parse(JSON.stringify(this.submitedData)), false);
    }
  }

  onOrganizationSelect(organizationId: string) {
    if (organizationId) {
      let selectedOrganization: any = this.dataService?.organizationsDropdown.find((or: any) => or.id == organizationId);
      this.departmentsDropdown = [...selectedOrganization?.departments]
    } else {
      this.departmentsDropdown = [];
    }
  }

  onSubmitForm() {
    this.isSubmitted = true;
    if (this.uForm.valid) {
      this.calculateValues = true;
      if (this.imageObj?.size) {
        var imageSizeValid = this.dataService.utils.validateImageSize(this.imageObj)
        if (!imageSizeValid) {
          return
        }
      }
      this.dataService.isLoading = true;
      this.isSubmitted = false;
      this.uForm.get('phone').value = this.uForm.get('phone').value?.length > 2 ? this.uForm.get('phone').value : '';

      if (this.weightCurrentUnitIndex === 1) {
        this.calculateValues = false;
        const currentWeight = this.uForm.get('weight').value;
        var convertedWeight = (currentWeight * 2.20462).toFixed(2)
        this.uForm.get('weight').setValue(convertedWeight);
      }
      if (this.lengthCurrentUnitIndex === 1) {
        this.calculateValues = false;
        const currentHeight = this.uForm.get('height').value;
        var convertedHeight = (currentHeight * 30.48).toFixed(2)
        this.uForm.get('height').setValue(convertedHeight);
      }
      const appendedFormData: FormData = new FormData();
      Object.keys(this.uForm.controls).forEach(key => {
        const value = this.uForm.get(key)?.value;
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
      if (this.dataService.currentUserData.role == 'Coach') {
        appendedFormData.append('coach_id', this.dataService.currentUserData.id);
      }
      const apiName = this.userId
        ? this.dataService.httpService.updateEmployeeApi + this.userId
        : this.dataService.httpService.addEmployeeApi;

      this.dataService.httpService.postApiData(apiName, appendedFormData).then((res: any) => {
        this.calculateValues = true;
        this.imageObj = {};

        if (!this.userData.organization_id && res.employee.organization_id && this.userId) {
          var otherList = res.employee.organization_id ? 'clientsList' : 'employeesList';
          let uIndex = this.dataService[otherList]?.employees?.findIndex((c: any) => c.id == this.userData.id);
          if (uIndex > -1) {
            this.dataService[otherList].employees.splice(uIndex, 1);
          }
        }
        debugger
        this.userData = res.employee;
        if (this.userData.height) {
          this.lengthCurrentUnitIndex = 0;
          this.toggleLengthUnit(false)
        }
        this.userData.fitnessPlans = res.fitness_plans;
        this.submitedData = JSON.parse(JSON.stringify(this.userData));
        this.imageUrl = this.userData.profile_image || null;

        var listName = res.employee.organization_id ? 'employeesList' : 'clientsList';
        if (this.dataService[listName]?.employees?.length) {
          let userIndex = this.dataService[listName]?.employees?.findIndex((c: any) => c.id == this.userData.id);
          if (userIndex > -1) {
            this.dataService[listName].employees[userIndex] = this.userData;
          } else {
            this.dataService[listName].employees.unshift(this.userData)
            // this.dataService.router.navigateByUrl(res.employee.organization_id ? '/employees' : '/clients')
          }
        }
        this.dataService.router.navigateByUrl(res.employee.organization_id ? '/employees/user-detail/' + this.userData.id : '/clients/user-detail/' + this.userData.id)

        if (res.mail_sent == false) {
          document.getElementById('openEmailNModal')?.click();
        } else if (res.message == 'Employee added successfully, and email sent to the user.') {
          document.getElementById('opensuccessfullyModal')?.click();
        } else {
          this.dataService.utils.showToast('success', res.message)
        }
        this.isEdit = false;
        this.emailEditable = false;
        this.dataService.getDashboardData();
      }).catch((errors: any) => {
        this.dataService.utils.showToast('danger', errors.error.message);
        this.dataService.onApiError(errors);
      }).finally(() => {
        this.dataService.isLoading = false;
      });
    } else {
      this.dataService.utils.showToast('danger', 'Please Check Required Fields.');
    }
  }

  action() {
    if (this.userId) {
      this.dataService.isLoading = true;
      let data = { is_active: this.userData.is_active == 0 ? this.userData.is_active = 1 : this.userData.is_active = 0 };
      let path: any = this.dataService.httpService.updateEmployeeApi + this.userId;
      this.dataService.httpService.postApiData(path, data).then((res: any) => {

        this.userData = res.employee;
        this.userData.fitnessPlans = res.fitness_plans;
        var listName = res.employee.organization_id ? 'employeesList' : 'clientsList';
        if (this.dataService[listName]?.employees?.length) {
          let userIndex = this.dataService[listName]?.employees?.findIndex((c: any) => c.id == this.userData.id);
          if (userIndex > -1) {
            this.dataService[listName].employees[userIndex] = this.userData;
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
    if (this.userId) {
      this.dataService.isLoading = true;
      let path: any = this.dataService.httpService.deleteEmployeeApi + this.userId;
      this.dataService.httpService.deleteApiData(path).then((res: any) => {
        var listName = res?.type == "Employee" ? 'employeesList' : 'clientsList';
        if (this.dataService[listName]?.employees?.length) {
          let userIndex = this.dataService[listName]?.employees?.findIndex((c: any) => c.id == this.userData.id);
          if (userIndex > -1) {
            this.dataService[listName].employees.splice(userIndex, 1);
          }
        }
        this.userData = {}
        this.userData.fitnessPlans = [];
        this.userId = null;
        document.getElementById('closedModal')?.click();
        this.dataService.router.navigateByUrl(res?.type == "Employee" ? '/employees' : '/clients');
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

  sendEmail() {
    this.dataService.isLoading = true;
    var apiName = this.dataService.httpService.sendCredentialEmail + this.userId;
    this.dataService.httpService.getApiData(apiName).then((res: any) => {
      document.getElementById('closedCredentialsModal')?.click();
      this.dataService.utils.showToast('success', res.message);
      this.dataService.isLoading = false;
    }).catch((errors: any) => {
      this.dataService.onApiError(errors);
    }).finally(() => {
      this.dataService.isLoading = false;
    });
  }

  ngDestroy() {
    this.userData = JSON.parse(JSON.stringify(this.submitedData || {}));
  }
}
