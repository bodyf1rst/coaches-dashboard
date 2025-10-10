import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkoutPlansListComponent } from './workout-plans-list/workout-plans-list.component';
import { WorkoutBuilderComponent } from './workout-builder/workout-builder.component';
import { WorkoutExecutionComponent } from './workout-execution/workout-execution.component';

const routes: Routes = [
  { path: '', component: WorkoutPlansListComponent },
  { path: 'build/:planId', component: WorkoutBuilderComponent },
  { path: 'execute/:id', component: WorkoutExecutionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkoutBuilderRoutingModule { }
