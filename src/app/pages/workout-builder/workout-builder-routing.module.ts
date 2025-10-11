import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkoutBuilderLandingComponent } from './workout-builder-landing/workout-builder-landing.component';
import { WorkoutPlansListComponent } from './workout-plans-list/workout-plans-list.component';
import { WorkoutBuilderComponent } from './workout-builder/workout-builder.component';
import { WorkoutExecutionComponent } from './workout-execution/workout-execution.component';
import { WorkoutsListComponent } from './workouts-list/workouts-list.component';
import { PlanBuilderComponent } from './plan-builder/plan-builder.component';

const routes: Routes = [
  { path: '', component: WorkoutBuilderLandingComponent },
  { path: 'create-workout', component: WorkoutBuilderComponent },
  { path: 'workouts', component: WorkoutsListComponent },
  { path: 'create-plan', component: PlanBuilderComponent },
  { path: 'plans', component: WorkoutPlansListComponent },
  { path: 'execute/:id', component: WorkoutExecutionComponent },
  // Legacy route for backwards compatibility
  { path: 'build/:planId', redirectTo: 'create-workout', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkoutBuilderRoutingModule { }
