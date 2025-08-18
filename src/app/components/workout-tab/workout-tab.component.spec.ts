import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutTabComponent } from './workout-tab.component';

describe('WorkoutTabComponent', () => {
  let component: WorkoutTabComponent;
  let fixture: ComponentFixture<WorkoutTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkoutTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
