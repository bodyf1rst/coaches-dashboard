import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutBuilderService } from '../../../services/workout-builder.service';
import { WorkoutService } from '../../../services/workout.service';

@Component({
  selector: 'app-workout-builder-landing',
  templateUrl: './workout-builder-landing.component.html',
  styleUrls: ['./workout-builder-landing.component.scss']
})
export class WorkoutBuilderLandingComponent implements OnInit {
  loading = false;
  error = '';

  stats = {
    totalWorkouts: 0,
    totalPlans: 0,
    recentWorkouts: [] as any[],
    recentPlans: [] as any[]
  };

  constructor(
    private router: Router,
    private workoutBuilderService: WorkoutBuilderService,
    private workoutService: WorkoutService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  async loadStats(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const coachId = 1; // TODO: Get from authentication service

      // Load workouts count
      const workoutsResponse = await this.workoutBuilderService.listWorkouts(coachId);
      if (workoutsResponse.success) {
        this.stats.totalWorkouts = workoutsResponse.workouts?.length || 0;
        this.stats.recentWorkouts = (workoutsResponse.workouts || []).slice(0, 3);
      }

      // Load plans count
      const plansResponse = await this.workoutService.listWorkoutPlans(coachId);
      if (plansResponse.success) {
        this.stats.totalPlans = plansResponse.data?.length || 0;
        this.stats.recentPlans = (plansResponse.data || []).slice(0, 3);
      }
    } catch (error: any) {
      console.error('Error loading stats:', error);
      this.error = 'Failed to load statistics';
    } finally {
      this.loading = false;
    }
  }

  navigateToCreateWorkout(): void {
    this.router.navigate(['/workout-builder/create-workout']);
  }

  navigateToCreatePlan(): void {
    this.router.navigate(['/workout-builder/create-plan']);
  }

  navigateToWorkouts(): void {
    this.router.navigate(['/workout-builder/workouts']);
  }

  navigateToPlans(): void {
    this.router.navigate(['/workout-builder/plans']);
  }
}
