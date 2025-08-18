import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DragulaService } from 'ng2-dragula';
import { pageFilter } from 'src/app/models/filter';
import { DataService } from 'src/app/service/data.service';

@Component({
  selector: 'app-add-workout',
  templateUrl: './add-workout.component.html',
  styleUrls: ['./add-workout.component.scss']
})
export class AddWorkoutComponent implements OnInit {
  @ViewChild('scrollContainer') scrollingContainer!: ElementRef;
  public fieldText: any = null;
  public isSearched: boolean = false;
  public pageFilter: any = new pageFilter;
  public workoutData: any = {};
  public submitWorkoutData: any = {};
  public isEdit: boolean = false;
  public isSubmitted: boolean = false;
  public workoutId: any = null;
  public selectedItem: any = {};
  public selectedIndex: any = {};
  public selectedSupersetIndex: any = null;
  public listStyle: any = { height: '250px', dropZoneHeight: '100px' }
  public timeArray: any[] = Array.from({ length: 60 }, (_, i) => i + 1);
  public setArray: any[] = Array.from({ length: 100 }, (_, i) => i + 1);
  public selectAll: boolean = false;
  public value: any = 70;
  public deletedIds: any = [];
  public assignmentList: any = [];


  constructor(public dataService: DataService, public activeRoute: ActivatedRoute, private cd: ChangeDetectorRef, public dragulaService: DragulaService) {
    this.activeRoute.params.subscribe((res: any) => {
      this.workoutId = Number(res.id) || null;
      if (this.workoutId) {
        this.initializeData();
      } else {
        this.onEdit();
      }
    });
  }


  ngOnInit(): void {
    this.dragulaService.createGroup('mainGroup', {
      moves: (el, source, handle: any) => {
        return handle.className === 'handle';
      },
    });
    this.workoutData.visibility_type = null;
  }

  goBack() {
    if (this.isEdit && this.workoutId) { this.isEdit = false } else {
      history.back()
    }
  }

  initializeData() {
    var wDataIndex = this.dataService.workoutsList?.workouts?.findIndex((x: any) => x.id == this.workoutId);
    if (wDataIndex > -1) {
      this.workoutData = this.dataService.workoutsList?.workouts[wDataIndex];
      this.submitWorkoutData = this.dataService.workoutsList?.workouts[wDataIndex];
    } else {
      this.workoutData = {};
    }
    if (!this.workoutData?.id || !this.workoutData.exercises?.length) {
      this.getSingleWorkout();
    } else {
      this.activeFirstItem();
    }
  }

  activeFirstItem() {
    const firstExercise = this.workoutData.exercises[0];
    if (firstExercise?.superset?.length) {
      this.selectedItem = firstExercise.superset[0];
      this.selectedIndex = 0;
      this.selectedSupersetIndex = 0;
    } else {
      this.selectedItem = firstExercise;
      this.selectedIndex = 0;
      this.selectedSupersetIndex = null;
    }
  }

  getSingleWorkout() {
    this.dataService.httpService.getApiData(this.dataService.httpService.getSingleWorkoutApi + this.workoutId).then((res: any) => {
      this.formateData(res);
    }).catch((errors: any) => {
      if (errors.error.message == "Workout Not Found!") {
        this.dataService.utils.showToast('danger', errors.error.message);
        window.history.back();
        return
      }
      this.dataService.onApiError(errors);
    }).finally(() => {
      this.dataService.isLoading = false;
    });
  }

  formateData(res: any) {
    var supersetArray: any = JSON.parse(JSON.stringify(res.workout));
    supersetArray.exercises = [];
    res?.workout?.exercises.forEach((item: any) => {

      if (item.length > 0) {
        item = { superset: item };
      }
      supersetArray.exercises.push(item);
    });
    this.workoutData = supersetArray;
    this.submitWorkoutData = supersetArray;
    let workoutIndex = this.dataService.workoutsList?.workouts?.findIndex((c: any) => c.id == this.workoutData.id);
    if (workoutIndex > -1) {
      this.dataService.workoutsList.workouts[workoutIndex] = this.workoutData;
    }
    this.activeFirstItem();
  }

  listSorted(event: any, type: string | number) {
    if (!event || !Array.isArray(event)) {
      console.error("Invalid event data:", event);
      return;
    }
    if (type === 'main') {
      event.forEach((item: any, index: number) => {
        if (item.superset && Array.isArray(item.superset)) {
          item.superset.forEach((set: any, setIndex: number) => {
            if ((setIndex === 0 || setIndex === item.superset.length - 1) && set.is_rest) {
              set.disabled = true;
            } else {
              set.disabled = false;
            }
            set.selected = false;
          });
        } else {
          if ((index === 0 || index === event.length - 1) && item.is_rest) {
            item.disabled = true;
          } else {
            item.disabled = false;
          }
          item.selected = false;
        }
      });
      this.workoutData.exercises = [];
      this.workoutData.exercises = [...event];
    }
    else if (typeof type === 'number') {
      const superset = this.workoutData.exercises[type]?.superset;
      if (superset && Array.isArray(superset)) {
        superset.forEach((set: any, setIndex: number) => {
          if ((setIndex === 0 || setIndex === superset.length - 1) && set.is_rest) {
            set.disabled = true;
          } else {
            set.disabled = false;
          }
          set.selected = false;
        });
        this.workoutData.exercises[type].superset = [];
        this.workoutData.exercises[type].superset = [...superset];
      }
    } else {
      console.error("Invalid type provided:", type);
    }
    this.cd.detectChanges();  // Trigger change detection manually
  }

  // TrackBy function for performance optimization
  trackByFn(index: number, item: any) {
    return item.id || index;
  }

  // Generate unique dragula bag IDs
  getSubDragId(index: number) {
    return `subDrag-${index}`;
  }

  onClickExercise(exercise: any, mainIndex: number, supersetIndex?: number) {
    if (exercise.is_rest > 0) {
      return;
    }
    if (exercise.id) {
      this.selectedItem = {};
    }
    this.selectedItem = JSON.parse(JSON.stringify(exercise));
    this.selectedIndex = mainIndex;
    if (supersetIndex !== undefined) {
      this.selectedSupersetIndex = supersetIndex;
    } else {
      this.selectedSupersetIndex = null;
    }
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
      this.dataService.httpService.getExercisesApi,
      'exercises',
      'exercisesList',
      this.fieldText, filterQuery
    ).then(() => {
      if (this.fieldText) {
        this.isSearched = true;
      }
    })
  }

  clearSearch() {
    this.getFreshExercises()
    this.fieldText = null;
    this.isSearched = false;
    this.pageFilter = new pageFilter;
  }

  getFreshExercises() {
    this.dataService.fetchData(1, this.dataService.httpService.getExercisesApi, 'exercises', 'exercisesList')
  }

  toggleVideoSelection(exercise: any): void {
    this.selectedItem = exercise;
    const index = this.workoutData.exercises?.findIndex((e: any) => e.id === exercise.id);
    exercise.selected = false;
    exercise.type = 'Sets';
    exercise.min = null;
    exercise.sec = null;
    exercise.rep = null;
    exercise.set = null;
    exercise.is_rest = 0;
    exercise.is_stag = false;
    if (!this.workoutData.exercises?.length) {
      this.workoutData.exercises = []
    }
    this.workoutData.exercises.push(JSON.parse(JSON.stringify(exercise)));
    this.listSorted(JSON.parse(JSON.stringify(this.workoutData.exercises)), 'main');
    this.selectAll = false;
  }

  toggleVideo(exercise: any, videoPlayer: HTMLVideoElement, event: Event): void {
    event.stopPropagation();
    this.dataService.exercisesList.exercises?.forEach((e: any) => {
      if (e?.videoPlaying && e.videos[0] !== exercise.videos[0]) {
        e.videoPlaying = false;
        const playingVideoElement = document.getElementById(`video-${e?.videos[0].id}`) as HTMLVideoElement;
        if (playingVideoElement) {
          playingVideoElement.pause();
        }
      }
    });
    if (exercise.videos[0]?.video_url) {
      window.open(exercise.videos[0]?.video_url, '_blank');
      return;
    }
    if (exercise.videoPlaying) {
      videoPlayer.pause();
      exercise.videoPlaying = false;
    } else {
      videoPlayer.play();
      exercise.videoPlaying = true;
    }
  }

  onVideoClick(exercise: any, event: Event): void {
    event.stopPropagation();
  }

  onClickVideo(event: Event) {
    event.stopPropagation();
  }

  isSelected(exercise: any): number {
    return this.workoutData.exercises?.findIndex((e: any) => e.id === exercise.id);
  }

  toggleAllCheckboxes() {
    this.workoutData.exercises.forEach((exercise: any) => {
      exercise.selected = this.selectAll;
    });
  }

  updateSelectAllState() {
    this.selectAll = this.workoutData.exercises.every((exercise: any) => exercise.selected);
  }

  deleteSelectedExercises() {
    this.workoutData.exercises = this.workoutData.exercises?.filter((exercise: any) => {
      if (exercise.selected) {
        if (exercise.workout_exercise_id) {
          this.deletedIds.push(exercise.workout_exercise_id);
          return false;
        } else {
          if (exercise.superset && exercise.superset.length) {
            exercise.superset.forEach((es: any) => {
              if (es.workout_exercise_id) {
                this.deletedIds.push(es.workout_exercise_id);
              }
            });
          }
          return false;
        }
      }
      return true;
    });
    this.listSorted(this.workoutData.exercises, 'main');
    this.selectAll = false;
  }

  isAnyItemSelected() {
    return this.workoutData.exercises.some((exercise: any) => exercise.selected);
  }

  addRest() {
    var rest = {
      min: null,
      sec: null,
      is_rest: 1, selected: false,
      type: 'Duration'
    }
    if (this.workoutData.exercises[this.workoutData.exercises.length - 1].is_rest) {
      this.dataService.utils.showToast('danger', 'You cant add multiple rests in same time.')
      return
    }
    this.workoutData.exercises.push(rest)
    this.listSorted(this.workoutData.exercises, 'main')
  }

  makeSet() {
    // Check if any exercise already has a superset
    const isInvalidItems = this.workoutData.exercises?.some(
      (exercise: any) => exercise.selected && exercise.superset && exercise.superset.length > 0
    );
    if (isInvalidItems) {
      this.dataService.utils.showToast('danger', 'Invalid Selection. You cannot select a superset to make another.');
      return;
    }

    // Create a new superset from selected exercises
    const newSet = {
      superset: this.workoutData.exercises?.filter((exercise: any) => exercise.selected)
    };

    // Ensure the new superset has at least two exercises
    if (newSet.superset.length < 2) {
      this.dataService.utils.showToast('danger', 'A superset requires multiple exercises.');
      return;
    }

    // Find the index of the first selected exercise
    const firstSelectedIndex = this.workoutData.exercises.findIndex((exercise: any) => exercise.selected);

    // Remove selected exercises from the main list
    this.workoutData.exercises = this.workoutData.exercises?.filter((exercise: any) => !exercise.selected);

    // Insert the new superset at the index of the first selected exercise
    this.workoutData.exercises.splice(firstSelectedIndex, 0, newSet);

    // Show success message
    this.dataService.utils.showToast('success', 'A superset created at the original position.');

    // Reset selection and sort the list
    this.selectAll = false;
    this.listSorted(this.workoutData.exercises, 'main');

    // Scroll only the specific container section to the new superset position
    setTimeout(() => {

      // Ensure the scrolling container is available
      if (this.scrollingContainer) {
        // Find the position of the newly added superset element
        const supersetElement = this.scrollingContainer.nativeElement?.children[1]?.children[0]?.children[firstSelectedIndex];

        if (supersetElement) {
          // Calculate the top position of the superset element relative to the scrollable container
          const supersetOffsetTop = supersetElement.getBoundingClientRect().top - this.scrollingContainer.nativeElement.getBoundingClientRect().top;

          // Scroll to the superset position smoothly
          this.scrollingContainer.nativeElement.scrollTo({
            top: supersetOffsetTop + this.scrollingContainer.nativeElement.scrollTop - 70,
            behavior: 'smooth'  // Smooth scrolling
          });
        }
      }
    }, 0);
  }

  deleteSelectedSupersets() {
    // Find all selected supersets
    const selectedSupersets = this.workoutData.exercises.filter((exercise: any) => exercise.selected);

    if (!selectedSupersets.every((exercise: any) => exercise?.superset?.length > 0)) {
      this.dataService.utils.showToast('danger', 'Cannot break because you also selected single items.')
      return
    }

    if (selectedSupersets.length > 0) {
      // Extract exercises from all selected supersets
      let exercisesToRestore: any = [];
      selectedSupersets?.forEach((superset: any) => {
        if (Array.isArray(superset.superset)) {
          exercisesToRestore = [...exercisesToRestore, ...superset.superset];
        }
      });

      // Remove all selected supersets from the main list
      this.workoutData.exercises = this.workoutData.exercises.filter((exercise: any) => !(exercise.selected && exercise.superset));

      // Add the exercises back to the main list
      this.workoutData.exercises = [...this.workoutData.exercises, ...exercisesToRestore];

      // Sort the list if necessary
      this.listSorted(this.workoutData.exercises, 'main');

      // Wait for the DOM to update before scrolling
      setTimeout(() => {
        if (this.scrollingContainer) {
          this.scrollingContainer.nativeElement.scrollTo({
            top: this.scrollingContainer.nativeElement.scrollHeight,
            behavior: 'smooth' // Enable smooth scrolling
          });
        }
      }, 0);

      // Show a success message
      this.dataService.utils.showToast('success', 'Selected supersets deleted and exercises restored to the main list at bottom.');
    } else {
      // Show an error message if no supersets are selected
      this.dataService.utils.showToast('danger', 'No supersets selected.');
    }

    // Reset the select all state
    this.selectAll = false;
    this.toggleAllCheckboxes();
  }

  isSupersetSelected() {
    return this.workoutData?.exercises?.some((exercise: any) => exercise.selected && exercise.superset?.length);
  }

  // Function to generate an array of sets with corresponding reps based on set
  generateRepsArray(index: number, set: number, isStag: boolean, type: string, existingReps: any[] = []) {
    const reps = [];

    // Iterate through the new set count
    for (let i = 0; i < set; i++) {
      // Check if there is an existing entry for this set, otherwise create a new one
      const existingEntry = existingReps[i] || {
        stag: index,
        set: i + 1,
        rep: null,
        min: null,
        sec: null
      };

      // If it's a "Stag", and type is "Sets" or "Duration", modify accordingly
      if (isStag) {
        if (type === 'Sets') {
          existingEntry.rep = existingEntry.rep || null; // Preserve previous value if any
        } else if (type === 'Duration') {
          existingEntry.min = existingEntry.min || null; // Preserve previous value if any
          existingEntry.sec = existingEntry.sec || null; // Preserve previous value if any
        }
      }

      // Add the current entry to the reps array
      reps.push(existingEntry);
    }

    return reps;
  }

  updateRepsArray(index: number, item: any) {
    // Reset the individual rep value (for "Sets" type)
    item.rep = null;

    // Generate the repsArray based on the type (Sets or Duration)
    // Pass in the existing reps to preserve previous values when updating
    item.repsArray = this.generateRepsArray(index, item.set, item.is_stag, item.type, item.repsArray || []);

    // If "Duration" and "Stag" is enabled, we also need to set the duration for each set
    if (item.is_stag && item.type === 'Duration') {
      for (let i = 0; i < item.set; i++) {
        const rep = item.repsArray[i];
        rep.min = rep.min || null; // Preserve existing value if available
        rep.sec = rep.sec || null; // Preserve existing value if available
      }
    }
  }

  async onEdit() {
    this.isEdit = !this.isEdit;
    if (!this.dataService.exercisesList.exercises?.length) {
      await this.dataService.fetchData(1, this.dataService.httpService.getExercisesApi, 'exercises', 'exercisesList')
    }
    if (!this.dataService.tagsDropdown?.length) {
      this.dataService.fetchDropdownData(50, this.dataService.httpService.getTagsApi, 'tags', 'tagsDropdown')
    }
    this.workoutData = JSON.parse(JSON.stringify(this.submitWorkoutData))
    if (!this.workoutData.id) {
      this.workoutData.visibility_type = null;
    }
  }

  onSubmitForm() {
    this.isSubmitted = true;
    if (this.workoutData.exercises?.length) {

      // --------------------------------------------------------------------------//

      // Check if at least one exercise has an id or superset with items
      if (!this.workoutData.exercises?.some((ex: any) => ex.superset?.length > 0 || ex.id)) {
        this.dataService.utils.showToast('danger', 'Please select at least one Exercise.');
        return;
      }
      // Check if any exercise or superset item of type 'Duration' is missing 'min' or 'sec'
      const invalidDuration = this.workoutData.exercises.some((ex: any) => {

        // Main exercise validation for 'Duration' type: Either 'min' or 'sec' must be provided
        const isInvalidMainExercise = !ex.is_stag && ex.type === 'Duration' && (!ex.min && !ex.sec);

        // Superset validation for 'Duration' type: Either 'min' or 'sec' must be provided
        const isInvalidSuperset = Array.isArray(ex) && ex.some((sup: any) =>
          !sup.is_stag && sup.type === 'Duration' && (!sup.min && !sup.sec)
        );

        // If it's a stag type, check that each set in the main exercise has either 'min' or 'sec'
        const isInvalidStagDuration = ex.is_stag && ex.set && ex.set > 0 && ex.repsArray?.some((set: any) => {
          // If the set type is 'Duration', validate that either 'min' or 'sec' is provided
          return ex.type === 'Duration' && (!set.min && !set.sec);
        });

        // Check superset items for stag type and validate 'Duration'
        const isInvalidStagSupersetDuration = Array.isArray(ex) && ex.some((sup: any) => {
          return sup.is_stag && sup.set && sup.set > 0 && sup.repsArray?.some((set: any) => {
            return sup.type === 'Duration' && (!set.min && !set.sec);
          });
        });

        return isInvalidMainExercise || isInvalidSuperset || isInvalidStagDuration || isInvalidStagSupersetDuration;
      });

      if (invalidDuration) {
        this.dataService.utils.showToast('danger', 'One or more rest or exercises or superset items are missing Duration (min or sec).');
        return;
      }

      // Check if any exercise or superset item of type 'Sets' is missing 'rep' and 'set'
      const invalidSets = this.workoutData.exercises.some((ex: any) => {

        // Main exercise validation for 'Sets' type: 'rep' and 'set' must be provided
        const isInvalidMainExercise = !ex.is_stag && ex.type === 'Sets' && (!ex.rep || ex.rep == null || !ex.set || ex.set == null);

        // Superset validation for 'Sets' type: 'rep' and 'set' must be provided
        const isInvalidSuperset = Array.isArray(ex.superset) && ex.superset.some((sup: any) => {

          return !sup.is_stag && sup.type === 'Sets' && (!sup.rep || sup.rep == null || !sup.set || sup.set == null)
        }
        );

        // If it's a stag type, check that each set in the main exercise has both 'rep' and 'set'
        const isInvalidStagSets = ex.is_stag && ex.set && ex.set > 0 && ex.repsArray?.some((set: any) => {
          if (ex.type === 'Sets') {
            return !set.rep || set.rep == null || !set.set || set.set == null;
          }
          return false;
        });

        // Check superset items for stag type and validate 'Sets'
        const isInvalidStagSupersetSets = Array.isArray(ex.superset) && ex.superset.some((sup: any) => {
          return sup.is_stag && sup.set && sup.set > 0 && sup.repsArray?.some((set: any) => {
            if (sup.type === 'Sets') {
              return !set.rep || set.rep == null || !set.set || set.set == null;
            }
            return false;
          });
        });

        return isInvalidMainExercise || isInvalidSuperset || isInvalidStagSets || isInvalidStagSupersetSets;
      });

      if (invalidSets) {
        this.dataService.utils.showToast('danger', 'One or more exercises or superset items are missing Reps/Sets.');
        return;
      }


      // --------------------------------------------------------------------------//
      // Check if workout title is provided
      if (!this.workoutData.title?.length || this.workoutData.title?.length < 4 || this.workoutData.title?.length > 100) {
        this.dataService.utils.showToast('danger', 'Please check workout Title.');
        return;
      }

      // Check if workout visibility type is selected
      if (!this.workoutData.visibility_type?.length) {
        this.dataService.utils.showToast('danger', 'Please select visibility type.');
        return;
      }

      if (this.deletedIds.length) {
        this.workoutData.deleted_ids = this.deletedIds;
      }
      // Set loading state and proceed with API call
      this.dataService.isLoading = true;
      this.isSubmitted = false;

      const apiName = this.workoutId
        ? this.dataService.httpService.updateWorkoutApi + this.workoutId
        : this.dataService.httpService.addWorkoutApi;

      this.dataService.httpService.postApiDataWithJson(apiName, this.workoutData)
        .then((res: any) => {

          const workout = res.workout;
          this.submitWorkoutData = JSON.parse(JSON.stringify(res.workout));
          this.workoutId = this.submitWorkoutData.id;
          // Update the workout list in the dataService
          if (this.dataService.workoutsList?.workouts?.length) {
            const workoutIndex = this.dataService.workoutsList.workouts.findIndex((c: any) => c.id === workout.id);
            if (workoutIndex > -1) {
              this.dataService.workoutsList.workouts[workoutIndex] = workout;
            } else {
              this.dataService.workoutsList.workouts.unshift(workout);
            }
          }

          // Navigate to the manage workouts page
          if (this.submitWorkoutData.id) {
            this.initializeData();
            this.dataService.router.navigateByUrl('/manage-workouts/workout-detail/' + this.submitWorkoutData.id);
          } else {
            this.dataService.router.navigateByUrl('/manage-workouts');
          }
          this.isEdit = false;
          this.dataService.utils.showToast('success', res.message);
          this.dataService.getDashboardData();
        })
        .catch((errors: any) => {
          this.dataService.utils.showToast('danger', errors.error.message);
          this.dataService.onApiError(errors);
        }).finally(() => {
          this.dataService.isLoading = false;
        });
    } else {
      this.dataService.utils.showToast('danger', 'No exercises available.');
    }
  }

  action() {
    if (this.workoutId) {
      this.dataService.isLoading = true;
      let data = { is_active: this.workoutData.is_active == 0 ? this.workoutData.is_active = 1 : this.workoutData.is_active = 0 };
      let path: any = this.dataService.httpService.updateWorkoutApi + this.workoutId;
      this.dataService.httpService.postApiData(path, data).then((res: any) => {

        this.workoutData.is_active = res.workout.is_active;
        if (this.dataService.workoutsList?.workouts?.length) {
          let workoutIndex = this.dataService.workoutsList?.workouts?.findIndex((c: any) => c.id == this.workoutData.id);
          if (workoutIndex > -1) {
            this.dataService.workoutsList.workouts[workoutIndex] = this.workoutData;
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
    if (this.workoutId) {
      this.dataService.isLoading = true;
      let path: any = this.dataService.httpService.deleteWorkoutApi + this.workoutId;
      this.dataService.httpService.deleteApiData(path).then((res: any) => {
        if (this.dataService.workoutsList?.workouts?.length) {
          let workoutIndex = this.dataService.workoutsList?.workouts?.findIndex((c: any) => c.id == this.workoutData.id);
          if (workoutIndex > -1) {
            this.dataService.workoutsList.workouts.splice(workoutIndex, 1);
          }
        }
        this.workoutData = {}
        this.workoutId = null;
        document.getElementById('closedModal')?.click();
        this.dataService.router.navigateByUrl('/manage-workouts');
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

  cloneItem(itemId: any, type: any) {
    this.dataService.cloneItem(itemId, type).then((res: any) => {
      debugger
      this.dataService.router.navigateByUrl('/manage-workouts/workout-detail/' + res.workout.id)
      this.isEdit = true;
      this.formateData(res);
    })
  }

  checkDeletion() {
    this.dataService.checkDeletion(this.workoutId, 'workout').then((res: any) => {

      this.assignmentList = res.data.plans_data || [];
    }).catch((errors: any) => {
      this.dataService.onApiError(errors);
    })
  }

  ngOnDestroy() {
    this.dragulaService.destroy('mainGroup')
    this.clearSearch();
    this.workoutData = JSON.parse(JSON.stringify(this.submitWorkoutData));
    this.selectedItem = {}
  }
}
