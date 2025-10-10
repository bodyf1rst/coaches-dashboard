import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkoutPlansListComponent } from './workout-plans-list/workout-plans-list.component';
import { WorkoutBuilderComponent } from './workout-builder/workout-builder.component';

const routes: Routes = [
  { path: '', component: WorkoutPlansListComponent },
  { path: 'build/:planId', component: WorkoutBuilderComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkoutBuilderRoutingModule { }
