/**
 * Plan Builder Component
 * Created: October 11, 2025
 * Phase 3: Frontend Implementation - Task 7
 *
 * Creates workout plans from 2-7 selected workouts with:
 * - Drag-and-drop workout ordering
 * - 2-7 workout constraint enforcement
 * - Client/organization assignment options
 * - Schedule configuration
 */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { WorkoutBuilderService } from '../../../services/workout-builder.service';
import {
  WorkoutWithExercises,
  WORKOUT_PLAN_CONSTRAINTS,
  WorkoutPlanSchedule
} from '../../../models/workout-builder.model';

@Component({
  selector: 'app-plan-builder',
  templateUrl: './plan-builder.component.html',
  styleUrls: ['./plan-builder.component.scss']
})
export class PlanBuilderComponent implements OnInit {
  // Plan data
  planName: string = '';
  workouts: WorkoutWithExercises[] = [];
  schedules: WorkoutPlanSchedule[] = [];

  // UI state
  isLoading: boolean = true;
  isSaving: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Assignment options
  assignmentType: 'none' | 'client' | 'organization' = 'none';
  selectedClientId: number | null = null;
  selectedOrganizationId: number | null = null;

  // Schedule options
  enableScheduling: boolean = false;
  scheduleDay: string = 'Monday';
  scheduleTime: string = '09:00';

  // Constants
  readonly MIN_WORKOUTS = WORKOUT_PLAN_CONSTRAINTS.MIN_WORKOUTS;
  readonly MAX_WORKOUTS = WORKOUT_PLAN_CONSTRAINTS.MAX_WORKOUTS;
  readonly DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Coach ID (TODO: Get from auth service)
  private coachId: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutBuilderService
  ) {}

  ngOnInit(): void {
    this.loadWorkoutsFromRoute();
  }

  /**
   * Load workouts based on IDs from query params
   */
  async loadWorkoutsFromRoute(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Get workout IDs from query params
      const workoutIdsParam = this.route.snapshot.queryParamMap.get('workoutIds');

      if (!workoutIdsParam) {
        this.errorMessage = 'No workouts selected. Please select workouts from the list.';
        this.isLoading = false;
        return;
      }

      const workoutIds = workoutIdsParam.split(',').map(id => parseInt(id, 10));

      // Validate workout count
      if (workoutIds.length < this.MIN_WORKOUTS) {
        this.errorMessage = `You must select at least ${this.MIN_WORKOUTS} workouts to create a plan.`;
        this.isLoading = false;
        return;
      }

      if (workoutIds.length > this.MAX_WORKOUTS) {
        this.errorMessage = `You can only select up to ${this.MAX_WORKOUTS} workouts for a plan.`;
        this.isLoading = false;
        return;
      }

      // Load each workout with full details
      const loadPromises = workoutIds.map(id =>
        this.workoutService.getWorkoutWithExercises(id).toPromise()
      );

      const results = await Promise.all(loadPromises);

      this.workouts = results
        .filter(result => result?.success)
        .map(result => result!.workout);

      if (this.workouts.length === 0) {
        this.errorMessage = 'Failed to load selected workouts.';
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred while loading workouts';
      console.error('Error loading workouts:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Handle drag-and-drop reordering
   */
  onWorkoutDrop(event: CdkDragDrop<WorkoutWithExercises[]>): void {
    moveItemInArray(this.workouts, event.previousIndex, event.currentIndex);
  }

  /**
   * Remove a workout from the plan
   */
  removeWorkout(index: number): void {
    if (this.workouts.length <= this.MIN_WORKOUTS) {
      alert(`You must have at least ${this.MIN_WORKOUTS} workouts in a plan.`);
      return;
    }

    this.workouts.splice(index, 1);
  }

  /**
   * Validate plan before saving
   */
  validatePlan(): { valid: boolean; message?: string } {
    if (!this.planName.trim()) {
      return { valid: false, message: 'Please enter a plan name.' };
    }

    if (this.workouts.length < this.MIN_WORKOUTS) {
      return { valid: false, message: `Plan must contain at least ${this.MIN_WORKOUTS} workouts.` };
    }

    if (this.workouts.length > this.MAX_WORKOUTS) {
      return { valid: false, message: `Plan cannot contain more than ${this.MAX_WORKOUTS} workouts.` };
    }

    if (this.assignmentType === 'client' && !this.selectedClientId) {
      return { valid: false, message: 'Please select a client.' };
    }

    if (this.assignmentType === 'organization' && !this.selectedOrganizationId) {
      return { valid: false, message: 'Please select an organization.' };
    }

    return { valid: true };
  }

  /**
   * Save the workout plan
   */
  async savePlan(): Promise<void> {
    // Validate
    const validation = this.validatePlan();
    if (!validation.valid) {
      this.errorMessage = validation.message || 'Invalid plan configuration';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Create the plan
      const workoutIds = this.workouts.map(w => w.id);
      const planData = {
        name: this.planName.trim(),
        coach_id: this.coachId,
        workout_ids: workoutIds
      };

      const createResult = await this.workoutService.createEnhancedPlan(planData).toPromise();

      if (!createResult?.success) {
        throw new Error('Failed to create plan');
      }

      const planId = createResult.plan_id;

      // Add schedule if enabled
      if (this.enableScheduling) {
        const scheduleData: WorkoutPlanSchedule = {
          plan_id: planId,
          target_type: this.assignmentType === 'organization' ? 'organization' : 'client',
          target_id: this.assignmentType === 'organization'
            ? this.selectedOrganizationId!
            : this.selectedClientId!,
          schedule_day: this.scheduleDay,
          schedule_time: this.scheduleTime + ':00'
        };

        await this.workoutService.schedulePlan(scheduleData).toPromise();
      }

      // Bulk assign to organization if selected
      if (this.assignmentType === 'organization' && this.selectedOrganizationId) {
        const assignmentData = {
          plan_id: planId,
          organization_id: this.selectedOrganizationId
        };

        await this.workoutService.bulkAssign(assignmentData).toPromise();
      }

      this.successMessage = 'Workout plan created successfully!';

      // Navigate to plans list after a brief delay
      setTimeout(() => {
        this.router.navigate(['/workout-builder/plans']);
      }, 1500);
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to save workout plan';
      console.error('Error saving plan:', error);
    } finally {
      this.isSaving = false;
    }
  }

  /**
   * Cancel and go back
   */
  cancel(): void {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      this.router.navigate(['/workout-builder/workouts']);
    }
  }

  /**
   * Calculate total estimated duration
   */
  getTotalDuration(): number {
    return this.workouts.reduce((total, workout) => {
      if (!workout.exercises || workout.exercises.length === 0) {
        return total;
      }

      const avgSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0) / workout.exercises.length;
      const avgReps = workout.exercises.reduce((sum, ex) => sum + ex.reps, 0) / workout.exercises.length;
      const avgRest = workout.exercises.reduce((sum, ex) => sum + ex.rest_time_seconds, 0) / workout.exercises.length;

      const duration = this.workoutService.calculateEstimatedDuration(
        workout.exercises.length,
        avgSets,
        avgReps,
        avgRest
      );

      return total + duration;
    }, 0);
  }

  /**
   * Get workout count status message
   */
  getWorkoutCountStatus(): string {
    const count = this.workouts.length;

    if (count < this.MIN_WORKOUTS) {
      return `Add ${this.MIN_WORKOUTS - count} more workout(s) to meet minimum requirement`;
    }

    if (count === this.MAX_WORKOUTS) {
      return 'Maximum workouts reached';
    }

    return `${count} of ${this.MAX_WORKOUTS} workouts`;
  }

  /**
   * Check if plan can be saved
   */
  canSave(): boolean {
    return this.planName.trim().length > 0 &&
           this.workouts.length >= this.MIN_WORKOUTS &&
           this.workouts.length <= this.MAX_WORKOUTS &&
           !this.isSaving;
  }
}
