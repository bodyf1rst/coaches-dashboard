/**
 * Workouts List Component
 * Created: October 11, 2025
 * Phase 3: Frontend Implementation - Task 6
 *
 * Displays all workouts for a coach with:
 * - Multi-select checkboxes for bulk actions
 * - Click to view/edit individual workout
 * - Integration with WorkoutBuilderService.listWorkouts()
 * - Loading and error states
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutBuilderService } from '../../../services/workout-builder.service';
import { WorkoutWithExercises, TEMPLATE_CATEGORIES } from '../../../models/workout-builder.model';

@Component({
  selector: 'app-workouts-list',
  templateUrl: './workouts-list.component.html',
  styleUrls: ['./workouts-list.component.scss']
})
export class WorkoutsListComponent implements OnInit {
  // Data
  workouts: WorkoutWithExercises[] = [];
  filteredWorkouts: WorkoutWithExercises[] = [];
  selectedWorkouts: Set<number> = new Set();

  // UI State
  isLoading: boolean = true;
  errorMessage: string = '';
  searchQuery: string = '';
  filterType: string = 'all';
  filterMuscleGroup: string = 'all';
  filterDuration: string = 'all';
  sortBy: string = 'newest';

  // Template categories for filtering
  templateCategories = TEMPLATE_CATEGORIES;

  // Muscle groups for filtering (from video workout_tags)
  muscleGroups = [
    { value: 'all', label: 'All Muscle Groups' },
    { value: 'chest', label: 'Chest' },
    { value: 'back', label: 'Back' },
    { value: 'legs', label: 'Legs' },
    { value: 'shoulders', label: 'Shoulders' },
    { value: 'arms', label: 'Arms' },
    { value: 'core', label: 'Core/Abs' },
    { value: 'full body', label: 'Full Body' }
  ];

  // Duration ranges for filtering (in minutes)
  durationRanges = [
    { value: 'all', label: 'Any Duration' },
    { value: '0-15', label: 'Under 15 min' },
    { value: '15-30', label: '15-30 min' },
    { value: '30-45', label: '30-45 min' },
    { value: '45-60', label: '45-60 min' },
    { value: '60+', label: 'Over 60 min' }
  ];

  // Coach ID (TODO: Get from auth service)
  private coachId: number = 1;

  constructor(
    private workoutService: WorkoutBuilderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWorkouts();
  }

  /**
   * Load all workouts for the coach
   */
  async loadWorkouts(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await this.workoutService.listWorkouts(this.coachId);

      if (response.success) {
        this.workouts = response.workouts || [];
        this.applyFiltersAndSort();
      } else {
        this.errorMessage = 'Failed to load workouts';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred while loading workouts';
      console.error('Error loading workouts:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Apply filters and sorting to workouts list
   */
  applyFiltersAndSort(): void {
    let filtered = [...this.workouts];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(workout =>
        workout.name.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (this.filterType !== 'all') {
      filtered = filtered.filter(workout =>
        workout.template?.type === this.filterType
      );
    }

    // Apply muscle group filter
    if (this.filterMuscleGroup !== 'all') {
      filtered = filtered.filter(workout => {
        if (!workout.exercises || workout.exercises.length === 0) return false;

        // Check if any exercise's video workout_tags contains the muscle group
        return workout.exercises.some(exercise => {
          const tags = exercise.video?.workout_tags;
          if (!tags || tags.length === 0) return false;

          // workout_tags is string[] - check if any tag includes the filter
          return tags.some(tag =>
            tag.toLowerCase().includes(this.filterMuscleGroup.toLowerCase())
          );
        });
      });
    }

    // Apply duration filter
    if (this.filterDuration !== 'all') {
      filtered = filtered.filter(workout => {
        const duration = this.getEstimatedDuration(workout);
        const [min, max] = this.filterDuration.split('-').map(v => {
          if (v === '60+') return [60, Infinity];
          return parseInt(v);
        });

        if (this.filterDuration === '60+') {
          return duration >= 60;
        } else {
          const [minVal, maxVal] = this.filterDuration.split('-').map(v => parseInt(v));
          return duration >= minVal && duration < maxVal;
        }
      });
    }

    // Apply sorting
    switch (this.sortBy) {
      case 'newest':
        filtered.sort((a, b) =>
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        break;
      case 'oldest':
        filtered.sort((a, b) =>
          new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        );
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'exercises':
        filtered.sort((a, b) =>
          (b.exercises?.length || 0) - (a.exercises?.length || 0)
        );
        break;
    }

    this.filteredWorkouts = filtered;
  }

  /**
   * Handle search input change
   */
  onSearchChange(): void {
    this.applyFiltersAndSort();
  }

  /**
   * Handle filter type change
   */
  onFilterChange(): void {
    this.applyFiltersAndSort();
  }

  /**
   * Handle sort change
   */
  onSortChange(): void {
    this.applyFiltersAndSort();
  }

  /**
   * Toggle selection of a workout
   */
  toggleSelection(workoutId: number): void {
    if (this.selectedWorkouts.has(workoutId)) {
      this.selectedWorkouts.delete(workoutId);
    } else {
      this.selectedWorkouts.add(workoutId);
    }
  }

  /**
   * Check if workout is selected
   */
  isSelected(workoutId: number): boolean {
    return this.selectedWorkouts.has(workoutId);
  }

  /**
   * Select all visible workouts
   */
  selectAll(): void {
    this.filteredWorkouts.forEach(workout => {
      this.selectedWorkouts.add(workout.id);
    });
  }

  /**
   * Deselect all workouts
   */
  deselectAll(): void {
    this.selectedWorkouts.clear();
  }

  /**
   * Toggle select all/none
   */
  toggleSelectAll(): void {
    if (this.allVisibleSelected) {
      this.deselectAll();
    } else {
      this.selectAll();
    }
  }

  /**
   * Check if all visible workouts are selected
   */
  get allVisibleSelected(): boolean {
    return this.filteredWorkouts.length > 0 &&
           this.filteredWorkouts.every(workout => this.selectedWorkouts.has(workout.id));
  }

  /**
   * Navigate to create workout page
   */
  createNewWorkout(): void {
    this.router.navigate(['/workout-builder/create-workout']);
  }

  /**
   * Navigate to create plan page with selected workouts
   */
  createPlanFromSelected(): void {
    const selectedIds = Array.from(this.selectedWorkouts);

    if (selectedIds.length < 2) {
      alert('Please select at least 2 workouts to create a plan');
      return;
    }

    if (selectedIds.length > 7) {
      alert('You can only select up to 7 workouts for a plan');
      return;
    }

    // Navigate to plan builder with selected workout IDs
    this.router.navigate(['/workout-builder/create-plan'], {
      queryParams: { workoutIds: selectedIds.join(',') }
    });
  }

  /**
   * View/edit a workout
   */
  viewWorkout(workoutId: number): void {
    this.router.navigate(['/workout-builder/create-workout'], {
      queryParams: { workoutId }
    });
  }

  /**
   * Get template category info for a workout
   */
  getTemplateCategory(workout: WorkoutWithExercises) {
    const type = workout.template?.type || 'custom';
    return this.templateCategories.find(cat => cat.type === type) ||
           this.templateCategories.find(cat => cat.type === 'custom');
  }

  /**
   * Calculate estimated duration for a workout
   */
  getEstimatedDuration(workout: WorkoutWithExercises): number {
    if (!workout.exercises || workout.exercises.length === 0) {
      return 0;
    }

    const avgSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0) / workout.exercises.length;
    const avgReps = workout.exercises.reduce((sum, ex) => sum + ex.reps, 0) / workout.exercises.length;
    const avgRest = workout.exercises.reduce((sum, ex) => sum + ex.rest_time_seconds, 0) / workout.exercises.length;

    return this.workoutService.calculateEstimatedDuration(
      workout.exercises.length,
      avgSets,
      avgReps,
      avgRest
    );
  }

  /**
   * Format date for display
   */
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
