import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { WorkoutService } from '../../../services/workout.service';
import { HttpService } from '../../../service/http.service';
import { WorkoutPlan, Workout, WorkoutExercise } from '../../../models/workout.model';

interface Video {
  video_id: number;
  video_title: string;
  thumbnail_url: string;
  video_duration: number;
  muscle_groups?: string;
  workout_type?: string;
}

interface ExerciseConfig extends WorkoutExercise {
  video?: Video;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-workout-builder',
  templateUrl: './workout-builder.component.html',
  styleUrls: ['./workout-builder.component.scss']
})
export class WorkoutBuilderComponent implements OnInit {
  planId: number = 0;
  plan: WorkoutPlan | null = null;
  workout: Workout | null = null;
  loading = false;
  error = '';

  // Video library
  videos: Video[] = [];
  filteredVideos: Video[] = [];
  searchTerm = '';
  loadingVideos = false;

  // Workout exercises
  workoutExercises: ExerciseConfig[] = [];

  // Workout configuration
  workoutName = '';
  workoutType: 'traditional' | 'emom' | 'amrap' | 'circuit' | 'tabata' | 'superset' | 'custom' = 'traditional';
  workoutTypes = [
    { value: 'traditional', label: '🏋️ Traditional', description: 'Standard sets and reps' },
    { value: 'emom', label: '⏱️ EMOM', description: 'Every Minute On the Minute' },
    { value: 'amrap', label: '🔥 AMRAP', description: 'As Many Rounds As Possible' },
    { value: 'circuit', label: '🔄 Circuit', description: 'Multiple rounds of exercises' },
    { value: 'tabata', label: '⚡ Tabata', description: '20s work, 10s rest intervals' },
    { value: 'superset', label: '💪 Superset', description: 'Back-to-back exercises' },
    { value: 'custom', label: '🎨 Custom', description: 'Custom workout structure' }
  ];

  // Saving state
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.planId = +params['planId'];
      this.loadPlan();
      this.loadVideos();
    });
  }

  async loadPlan(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const response = await this.workoutService.getWorkoutPlan(this.planId);
      if (response.success) {
        this.plan = response.data;
      } else {
        this.error = response.message || 'Failed to load workout plan';
      }
    } catch (error: any) {
      console.error('Error loading workout plan:', error);
      this.error = 'Error loading workout plan. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async loadVideos(): Promise<void> {
    this.loadingVideos = true;
    try {
      const response: any = await this.httpService.getApiData('get-videos.php?category=Fitness');
      if (response && response.videos) {
        this.videos = response.videos;
        this.filteredVideos = this.videos;
      }
    } catch (error: any) {
      console.error('Error loading videos:', error);
    } finally {
      this.loadingVideos = false;
    }
  }

  filterVideos(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredVideos = this.videos.filter(video =>
      video.video_title.toLowerCase().includes(term) ||
      (video.muscle_groups && video.muscle_groups.toLowerCase().includes(term)) ||
      (video.workout_type && video.workout_type.toLowerCase().includes(term))
    );
  }

  // Drag and drop handlers
  dropVideo(event: CdkDragDrop<any[]>): void {
    if (event.previousContainer === event.container) {
      // Reordering within workout
      moveItemInArray(this.workoutExercises, event.previousIndex, event.currentIndex);
    } else {
      // Adding video from library
      const video = event.previousContainer.data[event.previousIndex];
      const newExercise: ExerciseConfig = {
        exercise_id: video.video_id,
        workout_id: this.workout?.id || 0,
        sets: 3,
        reps: 10,
        duration_seconds: video.video_duration || 60,
        rest_timer_seconds: 60,
        timer_beep_enabled: true,
        notes: '',
        exercise_order: this.workoutExercises.length + 1,
        video: video,
        isExpanded: true
      };

      this.workoutExercises.splice(event.currentIndex, 0, newExercise);
      this.updateExerciseOrders();
    }
  }

  removeExercise(index: number): void {
    if (confirm('Remove this exercise from the workout?')) {
      this.workoutExercises.splice(index, 1);
      this.updateExerciseOrders();
    }
  }

  toggleExerciseExpanded(exercise: ExerciseConfig): void {
    exercise.isExpanded = !exercise.isExpanded;
  }

  updateExerciseOrders(): void {
    this.workoutExercises.forEach((ex, index) => {
      ex.exercise_order = index + 1;
    });
  }

  async saveWorkout(): Promise<void> {
    if (!this.workoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    if (this.workoutExercises.length === 0) {
      alert('Please add at least one exercise to the workout');
      return;
    }

    this.saving = true;
    this.error = '';

    try {
      // Create workout
      const workoutData = {
        plan_id: this.planId,
        name: this.workoutName,
        workout_type: this.workoutType,
        workout_config: JSON.stringify({
          type: this.workoutType,
          exercises_count: this.workoutExercises.length
        })
      };

      const workoutResponse = await this.workoutService.createWorkout(workoutData);

      if (!workoutResponse.success) {
        throw new Error(workoutResponse.message || 'Failed to create workout');
      }

      const workoutId = workoutResponse.data.workout_id;

      // Add exercises
      for (const exercise of this.workoutExercises) {
        const exerciseData: any = {
          workout_id: workoutId,
          exercise_id: exercise.exercise_id,
          sets: exercise.sets || 3,
          reps: exercise.reps || 10,
          duration_seconds: exercise.duration_seconds || 60,
          rest_timer_seconds: exercise.rest_timer_seconds || 60,
          timer_beep_enabled: exercise.timer_beep_enabled,
          notes: exercise.notes || '',
          exercise_order: exercise.exercise_order
        };

        await this.workoutService.addExercise(exerciseData);
      }

      alert(`✅ Workout "${this.workoutName}" saved successfully with ${this.workoutExercises.length} exercises!`);
      this.goBack();
    } catch (error: any) {
      console.error('Error saving workout:', error);
      this.error = error.message || 'Error saving workout. Please try again.';
      alert('❌ ' + this.error);
    } finally {
      this.saving = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/workout-builder']);
  }
}
