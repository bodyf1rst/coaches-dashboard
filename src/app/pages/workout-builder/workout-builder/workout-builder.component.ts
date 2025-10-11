import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { WorkoutService } from '../../../services/workout.service';
import { WorkoutBuilderService } from '../../../services/workout-builder.service';
import { HttpService } from '../../../service/http.service';
import { WorkoutPlan, Workout, WorkoutExercise } from '../../../models/workout.model';
import { WorkoutTemplate, WorkoutBodyPoints } from '../../../models/workout-builder.model';

interface Video {
  video_id: number;
  video_title: string;
  thumbnail_url: string;
  video_duration: number;
  duration?: string;
  muscle_groups?: string;
  workout_type?: string;
}

interface ExerciseConfig extends WorkoutExercise {
  video?: Video;
  isExpanded?: boolean;
}

interface TemplateBlock {
  id: string;
  type: 'emom' | 'amrap' | 'circuit' | 'tabata' | 'traditional' | 'superset' | 'rest';
  name: string;
  duration?: number;
  rounds?: number;
  rest_seconds?: number;
  exercises: ExerciseConfig[];
  isExpanded: boolean;
}

@Component({
  selector: 'app-workout-builder',
  templateUrl: './workout-builder.component.html',
  styleUrls: ['./workout-builder.component.scss']
})
export class WorkoutBuilderComponent implements OnInit {
  workout: Workout | null = null;
  loading = false;
  error = '';

  // Video library
  videos: Video[] = [];
  filteredVideos: Video[] = [];
  searchTerm = '';
  loadingVideos = false;

  // Filter options
  selectedMuscleGroup = '';
  selectedWorkoutType = '';
  muscleGroupOptions = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
  workoutTypeOptions = ['All', 'Strength', 'Cardio', 'HIIT', 'Mobility', 'Recovery'];

  // Multi-select mode
  multiSelectMode = false;
  selectedVideos: Set<number> = new Set();
  MAX_SELECTION = 10;

  // Workout exercises
  workoutExercises: ExerciseConfig[] = [];

  // Template selection
  showTemplateSelector = false;
  selectedTemplate: WorkoutTemplate | null = null;
  coachId = 1; // TODO: Get from auth service

  // BodyPoints configuration
  bodyPoints: WorkoutBodyPoints = {
    points_per_video: 15,
    completion_bonus: 75
  };
  showBodyPointsConfig = false;

  // Workout configuration
  workoutName = '';
  workoutType: 'traditional' | 'emom' | 'amrap' | 'circuit' | 'tabata' | 'superset' | 'custom' = 'custom';
  workoutTypes = [
    { value: 'traditional', label: '🏋️ Traditional', description: 'Standard sets and reps' },
    { value: 'emom', label: '⏱️ EMOM', description: 'Every Minute On the Minute' },
    { value: 'amrap', label: '🔥 AMRAP', description: 'As Many Rounds As Possible' },
    { value: 'circuit', label: '🔄 Circuit', description: 'Multiple rounds of exercises' },
    { value: 'tabata', label: '⚡ Tabata', description: '20s work, 10s rest intervals' },
    { value: 'superset', label: '💪 Superset', description: 'Back-to-back exercises' },
    { value: 'custom', label: '🎨 Custom', description: 'Custom workout structure' }
  ];

  // Custom template blocks
  templateBlocks: TemplateBlock[] = [];
  showAddBlockMenu = false;

  // Saving state
  saving = false;

  // Preview modal state
  showPreviewModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService,
    private workoutBuilderService: WorkoutBuilderService,
    private httpService: HttpService
  ) {}

  ngOnInit(): void {
    this.loadVideos();
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
    this.filteredVideos = this.videos.filter(video => {
      // Text search filter
      const matchesSearch = !term ||
        video.video_title.toLowerCase().includes(term) ||
        (video.muscle_groups && video.muscle_groups.toLowerCase().includes(term)) ||
        (video.workout_type && video.workout_type.toLowerCase().includes(term));

      // Muscle group filter
      const matchesMuscleGroup = !this.selectedMuscleGroup ||
        this.selectedMuscleGroup === 'All' ||
        (video.muscle_groups && video.muscle_groups.toLowerCase().includes(this.selectedMuscleGroup.toLowerCase()));

      // Workout type filter
      const matchesWorkoutType = !this.selectedWorkoutType ||
        this.selectedWorkoutType === 'All' ||
        (video.workout_type && video.workout_type.toLowerCase().includes(this.selectedWorkoutType.toLowerCase()));

      return matchesSearch && matchesMuscleGroup && matchesWorkoutType;
    });
  }

  // Template Selection Methods
  openTemplateSelector(): void {
    this.showTemplateSelector = true;
  }

  closeTemplateSelector(): void {
    this.showTemplateSelector = false;
  }

  onTemplateSelected(template: WorkoutTemplate): void {
    this.selectedTemplate = template;
    this.workoutName = `${template.name} Workout`;
    this.showTemplateSelector = false;
  }

  clearTemplate(): void {
    this.selectedTemplate = null;
  }

  // BodyPoints Configuration Methods
  toggleBodyPointsConfig(): void {
    this.showBodyPointsConfig = !this.showBodyPointsConfig;
  }

  calculateTotalBodyPoints(): number {
    const videoPoints = this.workoutExercises.length * this.bodyPoints.points_per_video;
    return videoPoints + this.bodyPoints.completion_bonus;
  }

  calculateEstimatedDuration(): number {
    let totalSeconds = 0;
    for (const exercise of this.workoutExercises) {
      // Duration per set + rest time
      const setDuration = (exercise.duration_seconds || 60) + (exercise.rest_timer_seconds || 60);
      totalSeconds += setDuration * (exercise.sets || 3);
    }
    return Math.round(totalSeconds / 60); // Return minutes
  }

  // Custom Template Methods
  addTemplateBlock(type: 'emom' | 'amrap' | 'circuit' | 'tabata' | 'traditional' | 'superset' | 'rest'): void {
    const blockNames: {[key: string]: string} = {
      'emom': 'EMOM Block',
      'amrap': 'AMRAP Block',
      'circuit': 'Circuit Block',
      'tabata': 'Tabata Block',
      'traditional': 'Traditional Block',
      'superset': 'Superset Block',
      'rest': 'Rest Period'
    };

    const newBlock: TemplateBlock = {
      id: 'block-' + Date.now(),
      type: type,
      name: blockNames[type] || 'Block',
      duration: type === 'rest' ? 60 : type === 'emom' ? 600 : undefined,
      rounds: ['circuit', 'amrap', 'tabata'].includes(type) ? 3 : undefined,
      rest_seconds: type === 'rest' ? undefined : 60,
      exercises: [],
      isExpanded: true
    };

    this.templateBlocks.push(newBlock);
    this.showAddBlockMenu = false;
  }

  removeTemplateBlock(index: number): void {
    if (confirm('Remove this template block?')) {
      this.templateBlocks.splice(index, 1);
    }
  }

  toggleBlockExpanded(block: TemplateBlock): void {
    block.isExpanded = !block.isExpanded;
  }

  moveBlockUp(index: number): void {
    if (index > 0) {
      [this.templateBlocks[index], this.templateBlocks[index - 1]] =
      [this.templateBlocks[index - 1], this.templateBlocks[index]];
    }
  }

  moveBlockDown(index: number): void {
    if (index < this.templateBlocks.length - 1) {
      [this.templateBlocks[index], this.templateBlocks[index + 1]] =
      [this.templateBlocks[index + 1], this.templateBlocks[index]];
    }
  }

  dropVideoToBlock(event: CdkDragDrop<any[]>, blockIndex: number): void {
    const video = event.previousContainer.data[event.previousIndex];
    const newExercise: ExerciseConfig = {
      exercise_id: video.video_id,
      workout_id: 0,
      sets: 3,
      reps: 10,
      duration_seconds: video.video_duration || 60,
      rest_timer_seconds: 60,
      timer_beep_enabled: true,
      notes: '',
      exercise_order: this.templateBlocks[blockIndex].exercises.length + 1,
      video: video,
      isExpanded: false
    };

    this.templateBlocks[blockIndex].exercises.push(newExercise);
  }

  removeExerciseFromBlock(blockIndex: number, exerciseIndex: number): void {
    if (confirm('Remove this exercise?')) {
      this.templateBlocks[blockIndex].exercises.splice(exerciseIndex, 1);
    }
  }

  buildCustomTemplateJSON(): string {
    const structure = this.templateBlocks.map(block => ({
      type: block.type,
      name: block.name,
      duration: block.duration,
      rounds: block.rounds,
      rest_seconds: block.rest_seconds,
      exercises: block.exercises.map(ex => ({
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps,
        duration_seconds: ex.duration_seconds,
        rest_timer_seconds: ex.rest_timer_seconds,
        timer_beep_enabled: ex.timer_beep_enabled,
        notes: ex.notes
      }))
    }));

    return JSON.stringify({
      template_type: 'custom',
      name: this.workoutName,
      structure: structure
    });
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

  // Preview Modal Methods
  openPreviewModal(): void {
    // Validate before showing preview
    if (!this.workoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    if (this.workoutExercises.length === 0 && this.templateBlocks.length === 0) {
      alert('Please add at least one exercise to your workout');
      return;
    }

    this.showPreviewModal = true;
  }

  closePreviewModal(): void {
    this.showPreviewModal = false;
  }

  confirmAndSaveWorkout(): void {
    this.closePreviewModal();
    this.saveWorkout();
  }

  async saveWorkout(): Promise<void> {
    if (!this.workoutName.trim()) {
      alert('Please enter a workout name');
      return;
    }

    if (this.workoutExercises.length === 0 && this.templateBlocks.length === 0) {
      alert('Please add at least one exercise to the workout');
      return;
    }

    this.saving = true;
    this.error = '';

    try {
      // Prepare exercises array
      let exercisesToAdd: any[] = [];

      if (this.workoutType === 'custom' && this.templateBlocks.length > 0) {
        // Flatten all exercises from all blocks
        let order = 1;
        for (const block of this.templateBlocks) {
          for (const exercise of block.exercises) {
            exercisesToAdd.push({
              video_id: exercise.exercise_id,
              order: order++,
              sets: exercise.sets || 3,
              reps: exercise.reps || 10,
              rest_time_seconds: exercise.rest_timer_seconds || 60
            });
          }
        }
      } else {
        // Use traditional exercises
        exercisesToAdd = this.workoutExercises.map((ex, index) => ({
          video_id: ex.exercise_id,
          order: index + 1,
          sets: ex.sets || 3,
          reps: ex.reps || 10,
          rest_time_seconds: ex.rest_timer_seconds || 60
        }));
      }

      // Use the new enhanced API endpoint
      const requestBody = {
        name: this.workoutName,
        coach_id: this.coachId,
        template_id: this.selectedTemplate?.id || undefined,
        exercises: exercisesToAdd,
        bodypoints: {
          points_per_video: this.bodyPoints.points_per_video,
          completion_bonus: this.bodyPoints.completion_bonus
        }
      };

      const response = await this.workoutBuilderService.createWorkoutWithVideos(requestBody).toPromise();

      if (!response || !response.success) {
        throw new Error('Failed to create workout');
      }

      const totalExercises = exercisesToAdd.length;
      const totalPoints = this.calculateTotalBodyPoints();
      alert(`✅ Workout "${this.workoutName}" created successfully!\n\n` +
            `📹 ${totalExercises} exercises\n` +
            `🎯 ${totalPoints} BodyPoints available`);

      this.goBack();
    } catch (error: any) {
      console.error('Error saving workout:', error);
      this.error = error.message || 'Error saving workout. Please try again.';
      alert('❌ ' + this.error);
    } finally {
      this.saving = false;
    }
  }

  getDropListIds(): string[] {
    // For custom templates, return all block IDs plus video list
    if (this.workoutType === 'custom') {
      const blockIds = this.templateBlocks.map((_, index) => `block-${index}`);
      return ['videoList', ...blockIds];
    }
    // For traditional types, just connect to workout list
    return ['workoutList'];
  }

  // Multi-select methods
  toggleMultiSelectMode(): void {
    this.multiSelectMode = !this.multiSelectMode;
    if (!this.multiSelectMode) {
      this.clearSelection();
    }
  }

  toggleVideoSelection(videoId: number): void {
    if (!this.multiSelectMode) return;

    if (this.selectedVideos.has(videoId)) {
      this.selectedVideos.delete(videoId);
    } else {
      if (this.selectedVideos.size >= this.MAX_SELECTION) {
        alert(`Maximum ${this.MAX_SELECTION} videos can be selected at once`);
        return;
      }
      this.selectedVideos.add(videoId);
    }
  }

  isVideoSelected(videoId: number): boolean {
    return this.selectedVideos.has(videoId);
  }

  addSelectedVideosToWorkout(): void {
    if (this.selectedVideos.size === 0) {
      alert('Please select at least one video');
      return;
    }

    const selectedVideoIds = Array.from(this.selectedVideos);
    const videosToAdd = this.videos.filter(v => selectedVideoIds.includes(v.video_id));

    for (const video of videosToAdd) {
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
        isExpanded: false
      };
      this.workoutExercises.push(newExercise);
    }

    this.updateExerciseOrders();
    this.clearSelection();
    this.multiSelectMode = false;
  }

  addSelectedVideosToBlock(blockIndex: number): void {
    if (this.selectedVideos.size === 0) {
      alert('Please select at least one video');
      return;
    }

    const selectedVideoIds = Array.from(this.selectedVideos);
    const videosToAdd = this.videos.filter(v => selectedVideoIds.includes(v.video_id));

    for (const video of videosToAdd) {
      const newExercise: ExerciseConfig = {
        exercise_id: video.video_id,
        workout_id: 0,
        sets: 3,
        reps: 10,
        duration_seconds: video.video_duration || 60,
        rest_timer_seconds: 60,
        timer_beep_enabled: true,
        notes: '',
        exercise_order: this.templateBlocks[blockIndex].exercises.length + 1,
        video: video,
        isExpanded: false
      };
      this.templateBlocks[blockIndex].exercises.push(newExercise);
    }

    this.clearSelection();
    this.multiSelectMode = false;
  }

  clearSelection(): void {
    this.selectedVideos.clear();
  }

  goBack(): void {
    this.router.navigate(['/workout-builder']);
  }
}
