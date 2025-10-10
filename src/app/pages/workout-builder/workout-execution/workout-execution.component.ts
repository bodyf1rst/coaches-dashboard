import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../../services/workout.service';
import { Workout, WorkoutExercise } from '../../../models/workout.model';
import { Subscription } from 'rxjs';

interface ExerciseProgress {
  exercise: WorkoutExercise;
  currentSet: number;
  totalSets: number;
  completed: boolean;
  inRestPeriod: boolean;
}

@Component({
  selector: 'app-workout-execution',
  templateUrl: './workout-execution.component.html',
  styleUrls: ['./workout-execution.component.scss']
})
export class WorkoutExecutionComponent implements OnInit, OnDestroy {
  workout: Workout | null = null;
  workoutId: number = 0;
  loading: boolean = true;
  error: string = '';

  // Execution state
  currentExerciseIndex: number = 0;
  exerciseProgress: ExerciseProgress[] = [];
  workoutStartTime: Date | null = null;
  workoutEndTime: Date | null = null;
  workoutCompleted: boolean = false;
  isPaused: boolean = false;
  showRestTimer: boolean = false;

  // Current exercise tracking
  get currentExercise(): ExerciseProgress | null {
    return this.exerciseProgress[this.currentExerciseIndex] || null;
  }

  get overallProgress(): number {
    if (this.exerciseProgress.length === 0) return 0;
    const completedExercises = this.exerciseProgress.filter(e => e.completed).length;
    return (completedExercises / this.exerciseProgress.length) * 100;
  }

  get totalExercises(): number {
    return this.exerciseProgress.length;
  }

  get completedExercises(): number {
    return this.exerciseProgress.filter(e => e.completed).length;
  }

  get workoutDuration(): string {
    if (!this.workoutStartTime) return '0:00';
    const endTime = this.workoutEndTime || new Date();
    const durationMs = endTime.getTime() - this.workoutStartTime.getTime();
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService
  ) {}

  ngOnInit(): void {
    this.workoutId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.workoutId) {
      this.loadWorkout();
    } else {
      this.error = 'Invalid workout ID';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private async loadWorkout(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const response = await this.workoutService.getWorkout(this.workoutId);
      if (response.success && response.data) {
        this.workout = response.data;
        this.initializeExerciseProgress();
      } else {
        this.error = 'Failed to load workout. Please try again.';
      }
    } catch (err) {
      console.error('Error loading workout:', err);
      this.error = 'Failed to load workout. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  private initializeExerciseProgress(): void {
    if (!this.workout || !this.workout.exercises) return;

    this.exerciseProgress = this.workout.exercises.map(exercise => ({
      exercise: exercise,
      currentSet: 1,
      totalSets: exercise.sets || 3,
      completed: false,
      inRestPeriod: false
    }));
  }

  startWorkout(): void {
    this.workoutStartTime = new Date();
    this.isPaused = false;
  }

  completeSet(): void {
    if (!this.currentExercise) return;

    if (this.currentExercise.currentSet < this.currentExercise.totalSets) {
      // More sets remaining - show rest timer if configured
      if (this.currentExercise.exercise.rest_timer_seconds &&
          this.currentExercise.exercise.rest_timer_seconds > 0) {
        this.showRestTimer = true;
        this.currentExercise.inRestPeriod = true;
      } else {
        // No rest timer, just increment set
        this.currentExercise.currentSet++;
      }
    } else {
      // Exercise complete, move to next
      this.completeExercise();
    }
  }

  onRestTimerComplete(): void {
    if (!this.currentExercise) return;

    this.showRestTimer = false;
    this.currentExercise.inRestPeriod = false;
    this.currentExercise.currentSet++;
  }

  onRestTimerSkipped(): void {
    if (!this.currentExercise) return;

    this.showRestTimer = false;
    this.currentExercise.inRestPeriod = false;
    this.currentExercise.currentSet++;
  }

  skipRestTimer(): void {
    this.onRestTimerSkipped();
  }

  private completeExercise(): void {
    if (!this.currentExercise) return;

    this.currentExercise.completed = true;
    this.showRestTimer = false;

    // Check if workout is complete
    if (this.currentExerciseIndex < this.exerciseProgress.length - 1) {
      // Move to next exercise
      this.currentExerciseIndex++;
    } else {
      // Workout complete
      this.completeWorkout();
    }
  }

  skipExercise(): void {
    this.completeExercise();
  }

  previousExercise(): void {
    if (this.currentExerciseIndex > 0) {
      this.currentExerciseIndex--;
      this.showRestTimer = false;
    }
  }

  nextExercise(): void {
    if (this.currentExerciseIndex < this.exerciseProgress.length - 1) {
      this.currentExerciseIndex++;
      this.showRestTimer = false;
    }
  }

  pauseWorkout(): void {
    this.isPaused = true;
  }

  resumeWorkout(): void {
    this.isPaused = false;
  }

  private completeWorkout(): void {
    this.workoutCompleted = true;
    this.workoutEndTime = new Date();
    this.isPaused = false;
    this.showRestTimer = false;
  }

  restartWorkout(): void {
    this.currentExerciseIndex = 0;
    this.workoutStartTime = null;
    this.workoutEndTime = null;
    this.workoutCompleted = false;
    this.isPaused = false;
    this.showRestTimer = false;
    this.initializeExerciseProgress();
  }

  exitWorkout(): void {
    this.router.navigate(['/workout-builder']);
  }

  getVideoUrl(exercise: WorkoutExercise): string {
    if (!exercise.exercise_video_url) return '';

    // Handle S3 URLs with proper encoding
    if (exercise.exercise_video_url.includes('s3.amazonaws.com')) {
      const parts = exercise.exercise_video_url.split('/');
      const filename = parts[parts.length - 1];
      const encodedFilename = encodeURIComponent(decodeURIComponent(filename));
      parts[parts.length - 1] = encodedFilename;
      return parts.join('/');
    }

    return exercise.exercise_video_url;
  }

  getThumbnailUrl(exercise: WorkoutExercise): string {
    if (!exercise.exercise_thumbnail) return '';

    // Handle S3 URLs with proper encoding
    if (exercise.exercise_thumbnail.includes('s3.amazonaws.com')) {
      const parts = exercise.exercise_thumbnail.split('/');
      const filename = parts[parts.length - 1];
      const encodedFilename = encodeURIComponent(decodeURIComponent(filename));
      parts[parts.length - 1] = encodedFilename;
      return parts.join('/');
    }

    return exercise.exercise_thumbnail;
  }

  getWorkoutTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'traditional': 'Traditional',
      'emom': 'EMOM',
      'amrap': 'AMRAP',
      'circuit': 'Circuit',
      'tabata': 'Tabata',
      'superset': 'Superset',
      'custom': 'Custom'
    };
    return labels[type] || type;
  }

  formatRestTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  getTotalSets(): number {
    return this.exerciseProgress.reduce((sum, e) => sum + e.totalSets, 0);
  }
}
