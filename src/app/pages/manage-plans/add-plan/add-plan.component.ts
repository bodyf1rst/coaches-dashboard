import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { DragulaService } from 'ng2-dragula';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';
import { urlValidator } from 'src/app/validations/urlValidator';
@Component({
  selector: 'app-add-plan',
  templateUrl: './add-plan.component.html',
  styleUrls: ['./add-plan.component.scss']
})
export class AddPlanComponent implements OnInit {
  @ViewChild('scrollContainer') scrollingContainer!: ElementRef;
  @ViewChildren('weekElement') weekElements!: QueryList<ElementRef>;
  public selectedPhase: any = 0;
  public selectedPhaseWeek: any = 0;
  public selectedType: 'phase' | 'week' | null = null;
  public daysLength: any = 1;
  public pForm: any = {};
  public fieldText: any = null;
  public isSearched: boolean = false;
  public pageFilter: any = new pageFilter;
  public planData: any = {};
  public submitPlanData: any = {};
  public isEdit: boolean = false;
  public planId: any = null;
  public isSubmitted: boolean = false;
  public selectedItem: any = {};
  public selectedIndex: any = {};
  public listStyle: any = { height: '250px', dropZoneHeight: '100px' }
  public count: any = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  public minArray: any[] = [0, 1, 5, 10, 15, 20, 25, 30]
  public secArray: any[] = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  public assignedOrgList: any = [];
  public assignedClientList: any = [];
  public showAssignedOrg: boolean = true;
  public showAssignedClients: boolean = true;
  public assignmentType: any = '';
  public aForm: any = {}
  public selectedAssignment: any = {}
  public deletedIds: any = [];

  constructor(public dataService: DataService, public dragulaService: DragulaService, public activeRoute: ActivatedRoute, public router: Router) { }

  ngOnInit(): void {
    this.pForm = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]),
      type: new FormControl('Program', Validators.required),
      phase: new FormControl(1),
      week: new FormControl(1),
      total_weeks: new FormControl(''),
      visibility_type: new FormControl('Public', [Validators.required])
    })

    this.aForm = new FormGroup({
      users: new FormControl(null, [Validators.required]),
      organizations: new FormControl(null, [Validators.required]),
      start_date: new FormControl(null, [Validators.required]),
      end_date: new FormControl(null, [Validators.required]),
    })

    this.dragulaService.createGroup('mainGroup', {
      moves: (el, source, handle: any) => {
        return handle.className === 'handle';
      },
    });
    this.activeRoute.paramMap.subscribe((res: any) => {
      debugger
      this.planId = Number(res.get('id')) || null;
      if (this.planId) {
        this.initializeData();
      } else {
        this.onEdit();
      }
    });
  }

  get f() {
    return this.pForm.controls;
  }

  get af() {
    return this.aForm.controls;
  }

  goBack() {
    if (this.isEdit && this.planId) { this.isEdit = false } else {
      history.back()
    }
  }

  changeRequiredByType() {
    const usersControl = this.aForm.get('users');
    const organizationsControl = this.aForm.get('organizations');
    if (this.assignmentType == 'Org') {
      usersControl.clearValidators();
      organizationsControl?.setValidators([Validators.required]);
    } else {
      organizationsControl.clearValidators();
      usersControl?.setValidators([Validators.required]);
    }
    usersControl?.updateValueAndValidity();
    organizationsControl?.updateValueAndValidity();
  }

  initializeData() {
    var pDataIndex = this.dataService.plansList?.plans?.findIndex((x: any) => x.id == this.planId);
    if (pDataIndex > -1) {
      this.planData = this.dataService.plansList?.plans[pDataIndex];
      this.submitPlanData = this.dataService.plansList?.plans[pDataIndex];
    } else {
      this.planData = {};
    }
    if (!this.planData?.id || !this.planData.workouts?.length) {
      this.getSingleWorkout();
    } else {
      this.selectedItem = this.planData.workouts[0];
      this.selectedIndex = 0;
      this.patchData();
    }
  }

  countDays() {
    const total_weeks = this.pForm.get('phase').value * this.pForm.get('week').value;
    this.pForm.get('total_weeks').setValue(total_weeks || '');
  }

  getFormData() {
    if (this.pForm.value.type == 'Program') {
      const phaseCount = 1
      const weekCount = 1
      this.planData = { ...this.pForm.value, workouts: [] };
      for (let phaseIndex = 0; phaseIndex < phaseCount; phaseIndex++) {
        const phase: any = { weeks: [] };

        for (let weekIndex = 0; weekIndex < weekCount; weekIndex++) {
          const week: any = { days: [], isOpen: true };
          phase.weeks.push(week);
        }
        this.planData.workouts.push(phase);
      }
      ;
    } else {
      this.pForm.value.phase = null;
      this.pForm.value.week = null;
      this.pForm.value.total_weeks = null;
      this.planData = { ...this.pForm.value, workouts: [] };
    }
  }

  addPhaseToForm() {
    const currentPhaseCount = this.pForm.value.phase || 0;
    const weekCount = 1;
    const newPhase: { weeks: { days: any[], isOpen: boolean }[] } = { weeks: [] };
    for (let i = 0; i < weekCount; i++) {
      let week: any = { days: [], isOpen: true };
      newPhase.weeks.push(week);
    }
    this.planData.workouts.push(newPhase);
    let newCount = Number(currentPhaseCount) + 1;
    this.pForm.patchValue({ phase: newCount });
    this.dataService.utils.showToast('success', 'Phase has been added.')
    setTimeout(() => {
      const container = this.scrollingContainer.nativeElement;
      const lastPhase = container.lastElementChild;
      if (lastPhase) {
        container.scrollTo({
          top: lastPhase.offsetTop,
          behavior: 'smooth'
        });
      }
    }, 0);

  }

  addWeekToForm() {
    const currentWeekCount = this.pForm.value.week || 0;
    if (typeof this.selectedPhase === 'number' && this.selectedPhase >= 0) {
      const selectedPhaseData = this.planData.workouts[this.selectedPhase];
      const newWeek = { days: [], isOpen: true };
      selectedPhaseData.weeks.push(newWeek);
      let totalWeeks = Number(this.pForm.value.week) + 1;

      this.pForm.patchValue({ total_weeks: totalWeeks });
      setTimeout(() => {
        const container = this.scrollingContainer.nativeElement;
        const weekElementsArray = this.weekElements.toArray();
        const lastWeekElement = weekElementsArray[weekElementsArray.length - 1];
        if (lastWeekElement) {
          container.scrollTo({
            top: lastWeekElement.nativeElement.offsetTop,
            behavior: 'smooth'
          });
        }
      }, 0);
      this.dataService.utils.showToast('success', 'Week has been added to the selected phase.');
    } else {
      console.error('No valid phase is selected.');
      this.dataService.utils.showToast('error', 'Please select a valid phase to add a week.');
    }
  }

  toggleTabs(phaseIndex: number, type: string, weekIndex?: number): void {
    if (type === 'phase') {
      // Check if the current phase is complete before allowing selection of the next phase
      if (this.selectedPhase !== -1 && this.selectedPhase < phaseIndex) {
        const currentPhase = this.planData.workouts[this.selectedPhase];
        const allWeeksComplete = currentPhase?.weeks?.every((week: any) => week.days.length >= this.daysLength);

        if (!allWeeksComplete) {
          this.dataService.utils.showToast('danger', 'Please complete all weeks of the current phase before proceeding.');
          return;
        }
        this.selectedPhase = 0;
      }
      // If all weeks are complete or it's the first phase selection, allow phase change
      if (this.selectedPhase === phaseIndex) {
        this.selectedPhase = -1;
        this.selectedPhaseWeek = -1;
      } else {
        const currentPhase = this.planData.workouts[phaseIndex > 0 ? phaseIndex - 1 : 0];
        const allWeeksComplete = currentPhase?.weeks?.every((week: any) => week.days.length >= this.daysLength);

        if (!allWeeksComplete) {
          this.dataService.utils.showToast('danger', 'Please complete all weeks of the current phase before proceeding.');
          this.selectedPhase = 0;
          return;
        }
        this.selectedPhase = phaseIndex;
        this.selectedPhaseWeek = 0;
      }
    } else if (type === 'week') {
      const preWeek = weekIndex ? weekIndex - 1 : 0;
      if (this.planData.workouts[phaseIndex]?.weeks[preWeek]?.days?.length < this.daysLength) {
        if (weekIndex && weekIndex > 0) {
          this.dataService.utils.showToast('danger', 'Please complete the previous week first.');
        }
        this.selectedPhaseWeek = 0;
        return;
      }
      if (this.selectedPhaseWeek === weekIndex) {
        this.selectedPhaseWeek = -1;
      } else {
        this.selectedPhaseWeek = weekIndex;
        this.planData.workouts[phaseIndex].weeks[weekIndex || 0].isOpen = true;
      }
    }
    this.deselectAll();
  }

  isAnySelected(): boolean {
    // Check if any phase is selected
    return this.planData?.workouts?.some((phase: any) =>
      phase.selected || phase.weeks?.some((week: any) =>
        week.selected
      )
    );
  }

  repeatSelected() {
    if (this.selectedPhase === null) {
      this.dataService.utils.showToast('danger', 'No phase selected to duplicate.');
      return;
    }
    if (this.selectedType === 'phase') {
      // Check if the selected phase is the last phase
      if (this.selectedPhase >= this.planData.workouts.length - 1) {
        this.dataService.utils.showToast('danger', 'Cannot duplicate. No more phases available.');
        return;
      }

      // Ensure that the number of days is correct according to the daysCount
      const isValidDaysCount = this.planData.workouts[this.selectedPhase].weeks.every((week: any) =>
        week.days.length >= this.daysLength // Check if the number of days matches the daysCount
      );

      if (!isValidDaysCount) {
        this.dataService.utils.showToast('danger', `Cannot repeat please complete all weeks first.`);
        return;
      }

      // Clone and insert the duplicated phase at the next index
      const duplicatedPhase = JSON.parse(JSON.stringify(this.planData.workouts[this.selectedPhase]));
      duplicatedPhase.weeks.forEach((week: any) => {
        week.days.forEach((day: any) => {
          delete day.plan_workout_id;
        })
      })
      debugger
      this.planData.workouts.splice(this.selectedPhase + 1, 1, duplicatedPhase); // Insert at next index
      this.resetSelection();

      // Scroll to the duplicated phase
      setTimeout(() => {

        const container = this.scrollingContainer.nativeElement;
        const duplicatedPhaseElement = container.children[this.selectedPhase + 1];
        if (duplicatedPhaseElement) {
          container.scrollTo({
            top: duplicatedPhaseElement.offsetTop - 10,
            behavior: 'smooth'
          });
        }
      }, 0);
    }

    // Handle week duplication
    if (this.selectedType === 'week') {

      // Check if multiple weeks are selected in the current phase
      const selectedWeeks = this.planData.workouts[this.selectedPhase].weeks.filter((week: any) => week.selected);
      if (selectedWeeks.length > 1) {
        this.dataService.utils.showToast('danger', 'You cannot duplicate multiple weeks at a time.');
        return;
      }

      const isValidDaysCount =
        this.planData.workouts[this.selectedPhase].weeks[this.selectedPhaseWeek].days.length >= this.daysLength;

      if (!isValidDaysCount) {
        this.dataService.utils.showToast('danger', `Cannot repeat please complete this week first.`);
        return;
      }

      // Check if the selected week is the last week in the current phase
      if (this.selectedPhaseWeek !== null) {
        if (this.selectedPhaseWeek >= this.planData.workouts[this.selectedPhase].weeks.length - 1) {
          // Check if the current phase is the last phase
          if (this.selectedPhase >= this.planData.workouts.length - 1) {
            this.dataService.utils.showToast('danger', 'Cannot duplicate. No more weeks or phases available.');
            return;
          }

          // Clone and insert the duplicated week at the beginning of the next phase
          const duplicatedWeek = JSON.parse(JSON.stringify(this.planData.workouts[this.selectedPhase].weeks[this.selectedPhaseWeek]));
          this.planData.workouts[this.selectedPhase + 1].weeks.splice(0, 0, duplicatedWeek); // Insert at the beginning of the next phase
          this.resetSelection();

          // Scroll to the duplicated week
          setTimeout(() => {

            const container = this.scrollingContainer.nativeElement;
            const nextPhaseElement = container.children[this.selectedPhase + 1];
            const duplicatedWeekElement = nextPhaseElement.children[0];
            if (duplicatedWeekElement) {
              container.scrollTo({
                top: duplicatedWeekElement.offsetTop - 20,
                behavior: 'smooth'
              });
            }
          }, 0);
        } else {
          // Clone and insert the duplicated week at the next index in the same phase
          const duplicatedWeek = JSON.parse(JSON.stringify(this.planData.workouts[this.selectedPhase].weeks[this.selectedPhaseWeek]));
          duplicatedWeek.days.forEach((day: any) => {
            delete day.plan_workout_id;
          })
          this.planData.workouts[this.selectedPhase].weeks.splice(this.selectedPhaseWeek + 1, 1, duplicatedWeek); // Insert at the next index
          this.resetSelection();

          // Scroll to the duplicated week
          setTimeout(() => {
            const container = this.scrollingContainer.nativeElement;
            const duplicatedWeekElement = container.children[0].children[this.selectedPhase].children[0].children[this.selectedPhaseWeek];
            if (duplicatedWeekElement) {
              container.scrollTo({
                top: duplicatedWeekElement.offsetTop - 20,
                behavior: 'smooth'
              });
            }
          }, 0);
        }
      }
    }
  }

  resetSelection() {

    if (this.selectedType == 'phase') {
      this.selectedPhase = this.selectedPhase + 1;
      this.selectedPhaseWeek = 0;
    } else if (this.selectedType == 'week') {
      if (this.selectedPhaseWeek == this.planData.workouts[this.selectedPhase]?.weeks?.length - 1) {
        this.selectedPhase = this.selectedPhase + 1;
        this.selectedPhaseWeek = 0;
      } else {
        this.selectedPhaseWeek = this.selectedPhaseWeek + 1;
      }
    }
    this.selectedType = null;
    this.deselectAll();
  }

  deselectAll() {
    if (this.planData.type == 'Program') {
      this.planData.workouts?.forEach((phase: any) => {
        phase.selected = false;
        phase.weeks?.forEach((week: any) => {
          week.selected = false; // Deselect the week
          // Uncheck all days inside the week
          week.days.forEach((day: any) => {
            day.selected = false; // Uncheck the day
          });
        });
      });
    } else {

      this.planData.workouts.forEach((workout: any) => {
        workout.selected = false;
      })
    }
  }

  isAnyItemSelected(): boolean {
    if (this.planData.type == 'Program') {
      return this.planData?.workouts?.some((phase: any) =>
        phase?.selected || // Check if the phase itself is selected
        phase?.weeks?.some((week: any) =>
          week?.selected || // Check if the week itself is selected
          week?.days?.some((day: any) => day?.selected) // Check if any day is selected
        )
      );
    } else {
      return this.planData.workouts?.some((workout: any) => workout.selected);
    }
  }

  onPhaseCheckChange(phaseIndex: number): void {
    this.selectedPhase = phaseIndex;
    const phase = this.planData.workouts[phaseIndex];
    // If phase is selected, select all weeks and days within that phase
    if (phase.selected) {
      this.selectedType = 'phase';
      this.selectAllWeeksAndDays(phaseIndex, true);
    } else {
      this.selectedType = null;
      this.selectAllWeeksAndDays(phaseIndex, false);
    }
  }

  selectAllWeeksAndDays(phaseIndex: number, isSelected: boolean): void {
    const phase = this.planData.workouts[phaseIndex];
    phase.weeks.forEach((week: any) => {
      week.selected = isSelected;
      week.days.forEach((day: any) => {
        day.selected = isSelected;
      });
    });
  }

  onWeekCheckChange(phaseIndex: number, weekIndex: number): void {
    this.selectedPhaseWeek = phaseIndex;
    this.selectedPhaseWeek = weekIndex;
    // this.deselectAll();
    const week = this.planData.workouts[phaseIndex]?.weeks[weekIndex];
    // If week is selected, select/deselect all days within that week
    if (week.selected) {
      this.selectedType = 'week';
      this.selectAllDays(phaseIndex, weekIndex, true);
    } else {
      this.selectedType = null;
      this.selectAllDays(phaseIndex, weekIndex, false);
    }
  }

  selectAllDays(phaseIndex: number, weekIndex: number, isSelected: boolean): void {
    const week = this.planData.workouts[phaseIndex]?.weeks[weekIndex];
    week.days.forEach((day: any) => {
      day.selected = isSelected;
    });
  }

  addWorkout(workout: any): void {

    if (this.planData.type == 'Program') {
      workout.selected = false;
      workout.phase = this.selectedPhase;
      workout.week = this.selectedPhaseWeek;
      workout.is_rest = workout.is_rest || 0;

      if (!this.planData.workouts?.length) {
        this.planData.workouts = [];
      }

      const currentPhase = this.planData.workouts[this.selectedPhase];
      const currentWeek = currentPhase?.weeks[this.selectedPhaseWeek];

      const addWorkoutToWeek = (week: any) => {
        if (week?.days?.length < 7) {
          week.days.push(JSON.parse(JSON.stringify(workout)));
          this.scrollToWorkout(this.selectedPhase, this.selectedPhaseWeek, week.days.length - 1); // Scroll to the newly added workout
          return true;
        }
        return false;
      };

      if (currentWeek && addWorkoutToWeek(currentWeek)) {
        // Workout added to the current week
      } else if (this.selectedPhaseWeek < currentPhase?.weeks?.length - 1) {
        this.selectedPhaseWeek++;
        const nextWeek = currentPhase.weeks[this.selectedPhaseWeek];
        if (addWorkoutToWeek(nextWeek)) {
          // Workout added to the next week
          this.scrollToWorkout(this.selectedPhase, this.selectedPhaseWeek, nextWeek.days.length - 1); // Scroll to the newly added workout
        }
      } else if (this.selectedPhase < this.planData.workouts?.length - 1) {
        this.selectedPhase++;
        this.selectedPhaseWeek = 0;
        const nextPhaseWeek = this.planData.workouts[this.selectedPhase].weeks[this.selectedPhaseWeek];
        if (addWorkoutToWeek(nextPhaseWeek)) {
          // Workout added to the next phase's first week
          this.scrollToWorkout(this.selectedPhase, this.selectedPhaseWeek, nextPhaseWeek.days.length - 1); // Scroll to the newly added workout
        }
      } else {
        this.dataService.utils.showToast('danger', 'All phases and weeks are full. Cannot add more workouts.');
        return;
      }

      this.listSorted(JSON.parse(JSON.stringify(this.planData.workouts[this.selectedPhase].weeks[this.selectedPhaseWeek].days)), this.selectedPhase, this.selectedPhaseWeek);
      this.updatePhaseAndWeekCounts();
    } else {
      if (!this.planData?.workouts?.length) {
        this.planData.workouts = [];
      }
      this.planData.workouts.push(JSON.parse(JSON.stringify(workout)))
    }
    this.deselectAll();
  }

  scrollToWorkout(phaseIndex: number, weekIndex: number, dayIndex: number): void {
    setTimeout(() => {

      const container = this.scrollingContainer.nativeElement;
      const element = document.querySelector(`#dayCheck${phaseIndex}${weekIndex}${dayIndex}`) as HTMLElement;;
      if (element) {
        container.scrollTo({
          top: element.offsetTop,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  listSorted(event: any, phaseIndex: number, weekIndex: number) {
    this.planData.workouts[phaseIndex].weeks[weekIndex].days = event;
  }

  addRest() {
    var rest = {
      is_rest: 1,
      selected: false
    }
    this.addWorkout(rest)
  }

  getSingleWorkout() {
    this.dataService.httpService.getApiData(this.dataService.httpService.getSinglePlanApi + this.planId).then((res: any) => {

      this.planData = this.formatPlanData(res.plan);
      this.submitPlanData = this.planData;
      this.patchData();
      let planIndex = this.dataService.plansList?.plans?.findIndex((c: any) => c.id == this.planData.id);
      if (planIndex > -1) {
        this.dataService.plansList.plans[planIndex] = this.planData;
      }
    }).catch((errors: any) => {
      if (errors.error.message === "Workout Not Found!") {
        this.dataService.utils.showToast('danger', errors.error.message);
        window.history.back();
        return;
      }
      this.dataService.onApiError(errors);
    }).finally(() => {
      this.dataService.isLoading = false;
    });
  }

  formatPlanData(plan: any) {
    const planData = JSON.parse(JSON.stringify(plan));
    planData.workouts = [];
    if (planData.type === 'Program') {
      // Initialize phases in planData
      plan.workouts.forEach((workout: any) => {
        const phaseIndex = workout.phase - 1;  // Convert phase to zero-based index
        const weekIndex = workout.week - 1;    // Convert week to zero-based index
        const dayIndex = workout.day - 1;      // Convert day to zero-based index

        // Ensure the phase array exists
        if (!planData.workouts[phaseIndex]) {
          planData.workouts[phaseIndex] = { weeks: [] };
        }

        // Ensure the week array exists
        if (!planData.workouts[phaseIndex].weeks[weekIndex]) {
          planData.workouts[phaseIndex].weeks[weekIndex] = { days: [], isOpen: true };
        }

        // Ensure the days array exists
        if (!planData.workouts[phaseIndex].weeks[weekIndex].days[dayIndex]) {
          planData.workouts[phaseIndex].weeks[weekIndex].days[dayIndex] = [];  // Initialize as an array
        }

        // Assign the plan_workout_id to the workout inside the days array
        const workoutCopy = { ...workout.workout, plan_workout_id: workout.id };  // Add the plan_workout_id
        planData.workouts[phaseIndex].weeks[weekIndex].days[dayIndex].push(workoutCopy);
      });

      // Transform days to either an array or a single object
      planData.workouts.forEach((phase: any) => {
        phase.weeks.forEach((week: any) => {
          week.days.forEach((day: any, index: any) => {
            if (day.length > 1) {
              week.days[index] = day;
            } else if (day.length === 1) {
              week.days[index] = day[0];
            } else {
              week.days[index] = null;
            }
          });
        });
      });
    } else {
      // Non-'Program' case: Assign plan_workout_id directly for each workout
      plan.workouts.forEach((workout: any) => {
        const workoutCopy = { ...workout.workout, plan_workout_id: workout.id };  // Add the plan_workout_id
        planData.workouts.push(workoutCopy);
      });
    }

    return planData;
  }

  patchData() {

    if (this.planData.type == 'Program') {
      const firstWorkout = this.planData.workouts?.[0]?.weeks?.[0]?.days?.[0];

      if (firstWorkout) {
        this.pForm.patchValue({
          title: this.planData.title,
          type: this.planData.type,
          phase: this.planData.phase,
          week: this.planData.week,
          total_weeks: this.planData.total_weeks || this.planData.phase * this.planData.week || '',
          visibility_type: this.planData.visibility_type
        });
      } else {
        console.warn('No workout data found to patch the form.');
      }
    } else {
      this.pForm.patchValue({
        title: this.planData.title,
        type: this.planData.type,
        phase: null,
        week: null,
        total_weeks: null,
        visibility_type: this.planData.visibility_type
      });
    }
  }

  onClickExercise(workout: any, index: any) {
    if (workout.is_rest > 0) {
      return
    }
    if (workout.id) {
      this.selectedItem = {}
    }
    this.selectedItem = JSON.parse(JSON.stringify(workout));
    this.selectedIndex = index;
  }

  onSearch() {
    let filterQuery = '';
    ['tag'].forEach((filterKey) => {
      if (this.pageFilter[filterKey]) {
        filterQuery += `&${filterKey}=${this.pageFilter[filterKey]}`;
      }
    });
    this.dataService.fetchData(
      1,
      this.dataService.httpService.getWorkoutsApi,
      'workouts',
      'workoutsList',
      this.fieldText, filterQuery
    ).then(() => {
      if (this.fieldText) {
        this.isSearched = true;
      }
    })
  }

  clearSearch(isDestroy?: boolean) {
    debugger
    if (!isDestroy) {
      this.getFreshWorkouts()
    }
    this.fieldText = null;
    this.isSearched = false;
    this.pageFilter = new pageFilter;
  }

  getFreshWorkouts() {
    this.dataService.fetchData(1, this.dataService.httpService.getWorkoutsApi, 'workouts', 'workoutsList')
  }

  toggleVideo(workout: any, videoPlayer: HTMLVideoElement, event: Event): void {
    event.stopPropagation();


    this.dataService.workoutsList.workouts?.forEach((e: any) => {

      if (e?.videoPlaying && e.exercise.video !== workout.exercise.video) {
        e.videoPlaying = false;
        const playingVideoElement = document.getElementById(`video-${e?.exercise.video.id}`) as HTMLVideoElement;
        if (playingVideoElement) {
          playingVideoElement.pause();
        }
      }
    });
    if (workout.exercise.video?.video_url) {
      window.open(workout.exercise.video?.video_url, '_blank');
      return;
    }
    if (workout.videoPlaying) {
      videoPlayer.pause();
      workout.videoPlaying = false;
    } else {
      videoPlayer.play();
      workout.videoPlaying = true;
    }
  }

  onVideoClick(workout: any, event: Event): void {

    event.stopPropagation();
  }

  onClickVideo(event: Event) {

    event.stopPropagation();
  }

  isSelected(workout: any): number {
    return this.planData.workouts?.findIndex((e: any) => e.id === workout.id);
  }

  deleteSelectedWorkouts(): void {
    if (this.planData.type == 'Program') {
      // Check if all phases are selected
      const selectedPhasesCount = this.planData.workouts.filter((phase: any) => phase.selected).length;
      const totalPhasesCount = this.planData.workouts.length;

      // Prevent deleting all phases by ensuring at least one phase remains
      if (selectedPhasesCount >= totalPhasesCount) {
        this.dataService.utils.showToast('danger', 'At least one phase must remain.');
        return; // Exit if all phases are selected
      }

      let canDelete = true; // Flag to determine if we can proceed with deletions

      // Filter out selected phases, ensuring at least one phase remains
      this.planData.workouts = this.planData.workouts.filter((phase: any) => {

        if (phase.selected) {
          if (phase.weeks.length) {
            // Filter out selected days within the week
            phase.weeks = phase.weeks.filter((w: any) => {

              if (w.selected) {
                w.days = w.days.filter((day: any) => {

                  if (day.selected) {
                    if (day.plan_workout_id) {
                      this.deletedIds.push(day.plan_workout_id); // Add day ID to the deleted list
                    } else {
                      if (day.length) {
                        day.forEach((d: any) => {
                          if (d.plan_workout_id) {
                            this.deletedIds.push(d.plan_workout_id);
                          }
                        })
                      }
                    }
                    return false; // Delete the selected day
                  }
                  return true; // Keep the day if it's not selected
                });
                return false; // Delete the selected day
              }
              return true; // Keep the day if it's not selected
            });
            return false; // Keep the week if it has unselected days
          }
          return false; // Delete the selected week
        } else {
          // Check if all weeks in this phase are selected
          const selectedWeeksCount = phase.weeks.filter((week: any) => week.selected).length;
          const totalWeeksCount = phase.weeks.length;

          // Prevent deleting all weeks in a phase by ensuring at least one week remains
          if (selectedWeeksCount >= totalWeeksCount) {
            this.dataService.utils.showToast('danger', 'At least one week must remain in each phase.');
            canDelete = false; // Set flag to false
            return true; // Keep the phase
          }

          // Filter out selected weeks and days
          phase.weeks = phase.weeks.filter((week: any) => {

            if (week.selected) {
              if (week.days.length) {
                // Filter out selected days within the week
                week.days = week.days.filter((day: any) => {

                  if (day.selected) {
                    if (day.plan_workout_id) {
                      this.deletedIds.push(day.plan_workout_id); // Add day ID to the deleted list
                    } else {
                      if (day.length) {
                        day.forEach((d: any) => {
                          if (d.plan_workout_id) {
                            this.deletedIds.push(d.plan_workout_id);
                          }
                        })
                      }
                    }
                    return false; // Delete the selected day
                  }
                  return true; // Keep the day if it's not selected
                });
                return false; // Keep the week if it has unselected days
              }
              return false; // Delete the selected week
            } else {
              // Filter out selected days within the week
              week.days = week.days.filter((day: any) => {

                if (day.selected) {
                  if (day.plan_workout_id) {
                    this.deletedIds.push(day.plan_workout_id); // Add day ID to the deleted list
                  } else {
                    if (day.length) {
                      day.forEach((d: any) => {
                        if (d.plan_workout_id) {
                          this.deletedIds.push(d.plan_workout_id);
                        }
                      })
                    }
                  }
                  return false; // Delete the selected day
                }
                return true; // Keep the day if it's not selected
              });
              return true; // Keep the week if it has unselected days
            }
          });

          return true; // Keep the phase if it has unselected weeks
        }
      });

      this.updatePhaseAndWeekCounts();

      // Show success message only if deletion can proceed
      if (canDelete) {
        this.deselectAll(); // Deselect all items after deletion
        this.dataService.utils.showToast('success', 'Selected workouts have been deleted.');
      }
    } else {
      // Handle case for non-Program type
      this.planData.workouts = this.planData.workouts.filter((workout: any) => {

        if (workout.selected && workout.plan_workout_id) {
          this.deletedIds.push(workout.plan_workout_id); // Add workout ID to the deleted list
        }
        return !workout.selected;
      });
    }
  }

  updatePhaseAndWeekCounts(): void {
    const phaseCount = this.planData.workouts.length;

    // Update phase count in pForm
    this.pForm.patchValue({ phase: phaseCount });

    // Calculate total weeks across all phases
    let totalWeeksCount = 0;
    this.planData.workouts.forEach((phase: any) => {
      totalWeeksCount += phase.weeks.length;
    });

    // Update the total weeks count in pForm
    this.pForm.patchValue({ total_weeks: totalWeeksCount });
    this.planData.phase = phaseCount;
    this.planData.total_weeks = totalWeeksCount;
  }

  onEdit() {
    this.isEdit = !this.isEdit;
    if (!this.dataService.workoutsList.workouts?.length) {
      this.dataService.fetchData(1, this.dataService.httpService.getWorkoutsApi, 'workouts', 'workoutsList')
    }
    if (!this.dataService.tagsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getTagsApi, 'tags', 'tagsDropdown')
    }

    if (!this.planId) {
      this.getFormData()
    } else {
      this.planData = JSON.parse(JSON.stringify(this.submitPlanData))
      if (this.planData.id) {
        this.patchData();
        this.countDays()
      }
    }
  }

  onSubmitForm() {
    this.isSubmitted = true;
    if (!this.pForm.valid) {
      this.dataService.utils.showToast('danger', 'Please check required Fields')
    } else {
      this.planData.title = this.pForm.get('title').value;
      this.planData.visibility_type = this.pForm.get('visibility_type').value;
      // Check if there are any workouts
      if (this.planData.workouts?.length) {
        let structuredWorkouts: any = [];
        if (this.planData.type == 'Program') {
          // Ensure that the number of days is correct according to the daysCount
          const isValidDaysCount = this.planData.workouts?.every((phase: any) =>
            phase.weeks.every((week: any) =>
              week.days.length >= this.daysLength // Check if the number of days matches the daysCount
            )
          );

          if (!isValidDaysCount) {
            this.dataService.utils.showToast('danger', `Every Week should have a minimum of ${this.daysLength} Days. You are missing in some weeks.`);
            return;
          }
          structuredWorkouts = this.planData.workouts.flatMap((phase: any, phaseIndex: number) =>
            phase.weeks.flatMap((week: any, weekIndex: number) =>
              week.days.flatMap((day: any, dayIndex: number) =>
                Array.isArray(day)
                  ? day.map((set: any) => ({
                    plan_workout_id: set.plan_workout_id,
                    workout_id: set.workout_id || set.id,
                    phase: phaseIndex + 1,
                    week: weekIndex + 1,
                    day: dayIndex + 1,
                    is_rest: set.is_rest || 0
                  }))
                  : {
                    plan_workout_id: day.plan_workout_id,
                    workout_id: day.workout_id || day.id,
                    phase: phaseIndex + 1,
                    week: weekIndex + 1,
                    day: dayIndex + 1,
                    is_rest: day.is_rest || 0
                  }
              )
            )
          );
        } else {
          structuredWorkouts = this.planData.workouts.map((day: any) => ({
            plan_workout_id: day.plan_workout_id,
            workout_id: day.workout_id || day.id,
            is_rest: day.is_rest || 0,
          }
          ));

        }
        // Final payload to be sent to the API (multiple entries)
        const apiPayload = {
          title: this.planData.title,
          type: this.planData.type,
          phase: this.planData.phase,
          week: this.planData.week,
          visibility_type: this.planData.visibility_type,
          deleted_ids: this.deletedIds,
          workouts: structuredWorkouts
        };

        // Set loading state and proceed with API call
        this.dataService.isLoading = true;
        this.isSubmitted = false;

        const apiName = this.planId
          ? `${this.dataService.httpService.updatePlanApi}${this.planId}`
          : this.dataService.httpService.addPlanApi;


        this.dataService.httpService.postApiDataWithJson(apiName, apiPayload)
          .then((res: any) => {

            const plan = res.plan;
            this.submitPlanData = JSON.parse(JSON.stringify(res.plan));

            // Update the plan list in the dataService
            if (this.dataService.plansList?.plans?.length) {
              const planIndex = this.dataService.plansList.plans.findIndex((c: any) => c.id === plan.id);
              if (planIndex > -1) {
                this.dataService.plansList.plans[planIndex] = plan;
              } else {
                this.dataService.plansList.plans.unshift(plan);
              }
            }

            // Navigate to the manage plans page
            this.dataService.router.navigateByUrl('/plans/plan-detail/' + res.plan.id);
            this.isEdit = false;
            this.selectedPhase = 0;
            this.selectedPhaseWeek = 0;
            this.initializeData();
            this.dataService.utils.showToast('success', res.message);
            this.dataService.getDashboardData();
          })
          .catch((errors: any) => {
            this.dataService.utils.showToast('danger', errors.error.message);
            this.dataService.onApiError(errors);
          })
          .finally(() => {
            this.dataService.isLoading = false;
          });

      } else {
        this.dataService.utils.showToast('danger', 'Workouts not available.');
      }
    }
  }

  action() {

    if (this.planId) {
      this.dataService.isLoading = true;
      let data = { is_active: this.planData.is_active == 0 ? 1 : 0 };
      let path: any = this.dataService.httpService.updatePlanApi + this.planId;

      this.dataService.httpService.postApiData(path, data).then((res: any) => {

        this.planData.is_active = res.plan.is_active;
        if (this.dataService.plansList?.plans?.length) {
          let planIndex = this.dataService.plansList?.plans?.findIndex((c: any) => c.id == this.planData.id);
          if (planIndex > -1) {
            this.dataService.plansList.plans[planIndex] = this.planData;
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
    if (this.planId) {
      this.dataService.isLoading = true;
      let path: any = this.dataService.httpService.deletePlanApi + this.planId;
      this.dataService.httpService.deleteApiData(path).then((res: any) => {
        if (this.dataService.plansList?.plans?.length) {
          let planIndex = this.dataService.plansList?.plans?.findIndex((c: any) => c.id == this.planData.id);
          if (planIndex > -1) {
            this.dataService.plansList.plans.splice(planIndex, 1);
          }
        }
        this.planData = {}
        this.planId = null;
        document.getElementById('closedModal')?.click();
        this.dataService.router.navigateByUrl('/plans');
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

  getOrgDropdown() {
    if (!this.dataService.organizationsDropdown?.length) {
      this.dataService.fetchDropdownData(100, this.dataService.httpService.getOrganizationDropdown, 'organizations', 'organizationsDropdown').then(() => {
      })
    }
    this.assignmentType = 'Org';
    this.clearForm();
    this.changeRequiredByType();
  }

  getClientsDropdown() {
    if (!this.dataService.usersDropdown?.length) {
      this.dataService.fetchDropdownData(100, this.dataService.httpService.getUsersDropdownApi, 'users', 'usersDropdown').then(() => {
      })
    }
    this.assignmentType = 'Client'
    this.clearForm();
    this.changeRequiredByType()
  }

  clearForm() {
    this.aForm.reset();
  }

  calculateEndDate(event: any) {
    if (this.planData.type == 'Program') {
      var startDate = event.target.value;
      var totalDays = (this.planData.total_weeks - 1) * 7 + this.planData.days;
      var endDate = moment(startDate).add(totalDays, 'days');
      this.aForm.get('end_date').setValue(endDate.format('YYYY-MM-DD'));
    }
  }

  assignOrgClients() {
    this.isSubmitted = true;
    if (this.aForm.valid) {
      this.isSubmitted = false;
      this.dataService.isLoading = true;
      var formData = this.aForm.value;
      formData.plan_id = this.planId;
      let apiName = this.dataService.httpService.assignPlan;

      this.dataService.httpService.postApiData(apiName, formData).then((res: any) => {
        document.getElementById('closeassignModal')?.click()
        this.dataService.isLoading = false;
        this.dataService.utils.showToast('success', res.message)
        this.getSingleWorkout();
      }).catch((errors: any) => {
        this.dataService.utils.showToast('danger', errors.error.message)
        this.dataService.onApiError(errors);
      })
    }
  }

  removeAssignment() {
    if (this.selectedAssignment.id) {
      this.dataService.isLoading = true;
      let path: any = this.dataService.httpService.deleteAssignPlan + this.planId;
      if (this.assignmentType == 'Org') {
        path += '?organization_id=' + this.selectedAssignment.id
      } else {
        path += '?user_id=' + this.selectedAssignment.id
      }

      this.dataService.httpService.deleteApiData(path).then((res: any) => {
        this.getSingleWorkout();
        document.getElementById('closeddaModalModal')?.click();
        this.dataService.utils.showToast('success', res.message);
        this.dataService.isLoading = false;
      }).catch((errors: any) => {
        this.dataService.onApiError(errors);
      }).finally(() => {
        this.dataService.isLoading = false;
      });
    }
  }

  makeSet() {
    const days = this.planData.workouts[this.selectedPhase].weeks[this.selectedPhaseWeek].days;
    const hasInvalidSelection = days.some((day: any) => day.selected && day.length && day.length > 0) ||
      this.planData.workouts[this.selectedPhase].weeks.some((week: any) => week.selected) ||
      this.planData.workouts.some((phase: any, index: number) => phase.selected && index === this.selectedPhase);
    if (hasInvalidSelection) {
      this.dataService.utils.showToast('danger', 'Invalid Selection.');
      return;
    }
    const newSet = this.planData.workouts[this.selectedPhase].weeks[this.selectedPhaseWeek].days.filter((day: any) => day.selected);
    if (newSet.length === 0) {
      this.dataService.utils.showToast('danger', 'No workouts selected to merge!');
      return;
    } else if (newSet.length <= 1) {
      this.dataService.utils.showToast('danger', 'Set Required multiple items.');
      return
    } else if (newSet.length > 3) {
      this.dataService.utils.showToast('danger', 'Set can maximum three workouts.');
      return
    }
    // Assuming targetDay is the day you want to merge into (e.g., day 1)
    const firstSelectedIndex = this.planData.workouts[this.selectedPhase].weeks[this.selectedPhaseWeek].days.findIndex((day: any) => day.selected);
    // Filter Non Selected Days
    this.planData.workouts[this.selectedPhase].weeks[this.selectedPhaseWeek].days = this.planData.workouts[this.selectedPhase].weeks[this.selectedPhaseWeek].days.filter((day: any) => !day.selected)
    // Add new set in array
    this.planData.workouts[this.selectedPhase].weeks[this.selectedPhaseWeek].days.splice(firstSelectedIndex, 0, newSet);
    setTimeout(() => {
      const container = this.scrollingContainer.nativeElement;
      // Find the target week and phase
      const targetPhase = this.planData.workouts[this.selectedPhase];
      // Get the corresponding element for the selected week
      const phaseElements = container.querySelectorAll('.phase-tab-area-bottom');
      const weekElements = phaseElements[this.selectedPhase].querySelectorAll('.plan-phases.week');
      if (weekElements[this.selectedPhaseWeek]) {
        const targetElement = weekElements[this.selectedPhaseWeek];

        container.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    }, 0);

  }

  cloneItem(itemId: any, type: any) {
    this.dataService.cloneItem(itemId, type).then((res: any) => {
      if (!this.dataService?.workoutsList.workouts?.length) {
        this.getFreshWorkouts()
      }
      this.dataService.router.navigateByUrl('/plans/plan-detail/' + res.plan.id)
      this.planData = {};
      this.planId = res.plan.id;
      this.isEdit = false;
      this.getSingleWorkout();
    })
  }

  ngOnDestroy() {
    this.dragulaService.destroy('mainGroup')
    this.clearSearch(true);
    this.planData = JSON.parse(JSON.stringify(this.submitPlanData || {}));
    this.selectedItem = {}
  }
}
