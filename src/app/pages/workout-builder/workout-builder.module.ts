import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { WorkoutBuilderRoutingModule } from './workout-builder-routing.module';
import { WorkoutPlansListComponent } from './workout-plans-list/workout-plans-list.component';
import { WorkoutBuilderComponent } from './workout-builder/workout-builder.component';

@NgModule({
  declarations: [
    WorkoutPlansListComponent,
    WorkoutBuilderComponent
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
