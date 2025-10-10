import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutService } from '../../../services/workout.service';
import { WorkoutPlan } from '../../../models/workout.model';

@Component({
  selector: 'app-workout-plans-list',
  templateUrl: './workout-plans-list.component.html',
  styleUrls: ['./workout-plans-list.component.scss']
})
export class WorkoutPlansListComponent implements OnInit {
  workoutPlans: WorkoutPlan[] = [];
  loading = false;
  error = '';
  showCreateModal = false;
  newPlan: any = {
    name: '',
    description: '',
    duration_weeks: 4,
    is_public: false
  };

  constructor(
    private workoutService: WorkoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadWorkoutPlans();
  }

  async loadWorkoutPlans(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const coachId = 1; // TODO: Get from authentication service
      const response = await this.workoutService.listWorkoutPlans(coachId);
      if (response.success) {
        this.workoutPlans = response.data || [];
      } else {
        this.error = response.message || 'Failed to load workout plans';
      }
    } catch (error: any) {
      console.error('Error loading workout plans:', error);
      this.error = 'Error loading workout plans. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  openCreateModal(): void {
    this.showCreateModal = true;
    this.newPlan = {
      coach_id: 1,  // TODO: Get from logged-in user/auth token
      name: '',
      description: '',
      duration_weeks: 4,
      is_public: false
    };
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  async createPlan(): Promise<void> {
    if (!this.newPlan.name) {
      alert('Please enter a plan name');
      return;
    }

    this.loading = true;
    try {
      const response = await this.workoutService.createWorkoutPlan(this.newPlan);
      if (response.success) {
        alert('Workout plan created successfully!');
        this.closeCreateModal();
        this.loadWorkoutPlans();
      } else {
        alert(response.message || 'Failed to create workout plan');
      }
    } catch (error) {
      console.error('Error creating workout plan:', error);
      alert('Error creating workout plan. Please try again.');
    } finally {
      this.loading = false;
    }
  }

  buildWorkout(planId: number): void {
    this.router.navigate(['/workout-builder/build', planId]);
  }

  async deletePlan(plan: WorkoutPlan): Promise<void> {
    if (!confirm(`Are you sure you want to delete "${plan.name}"?`)) {
      return;
    }

    this.loading = true;
    try {
      const response = await this.workoutService.deleteWorkoutPlan(plan.id!);
      if (response.success) {
        alert('Workout plan deleted successfully!');
        this.loadWorkoutPlans();
      } else {
        alert(response.message || 'Failed to delete workout plan');
      }
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      alert('Error deleting workout plan. Please try again.');
    } finally {
      this.loading = false;
    }
  }
}
