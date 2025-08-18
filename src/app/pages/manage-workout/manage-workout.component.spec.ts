import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageWorkoutComponent } from './manage-workout.component';

describe('ManageWorkoutComponent', () => {
  let component: ManageWorkoutComponent;
  let fixture: ComponentFixture<ManageWorkoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageWorkoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageWorkoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
