import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseTabComponent } from './exercise-tab.component';

describe('ExerciseTabComponent', () => {
  let component: ExerciseTabComponent;
  let fixture: ComponentFixture<ExerciseTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExerciseTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExerciseTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
