import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutService } from '../../../services/workout.service';
import { WorkoutPlan } from '../../../models/workout.model';

@Component({
  selector: 'app-workout-builder',
  templateUrl: './workout-builder.component.html',
  styleUrls: ['./workout-builder.component.scss']
})
export class WorkoutBuilderComponent implements OnInit {
  planId: number = 0;
  plan: WorkoutPlan | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workoutService: WorkoutService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.planId = +params['planId'];
      this.loadPlan();
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

  goBack(): void {
    this.router.navigate(['/workout-builder']);
  }
}
