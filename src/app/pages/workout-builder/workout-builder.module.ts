import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { WorkoutBuilderRoutingModule } from './workout-builder-routing.module';
import { WorkoutPlansListComponent } from './workout-plans-list/workout-plans-list.component';
import { WorkoutBuilderComponent } from './workout-builder/workout-builder.component';
import { WorkoutExecutionComponent } from './workout-execution/workout-execution.component';
import { RestTimerComponent } from '../../components/rest-timer/rest-timer.component';
import { TemplateSelectorComponent } from '../../components/template-selector/template-selector.component';
import { WorkoutBuilderLandingComponent } from './workout-builder-landing/workout-builder-landing.component';
import { WorkoutsListComponent } from './workouts-list/workouts-list.component';
import { PlanBuilderComponent } from './plan-builder/plan-builder.component';

@NgModule({
  declarations: [
    WorkoutPlansListComponent,
    WorkoutBuilderComponent,
    WorkoutExecutionComponent,
    RestTimerComponent,
    TemplateSelectorComponent,
    WorkoutBuilderLandingComponent,
    WorkoutsListComponent,
    PlanBuilderComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    WorkoutBuilderRoutingModule
  ]
})
export class WorkoutBuilderModule { }
