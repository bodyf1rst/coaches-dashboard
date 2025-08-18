import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionDashboardComponent } from './nutrition-dashboard.component';

describe('NutritionDashboardComponent', () => {
  let component: NutritionDashboardComponent;
  let fixture: ComponentFixture<NutritionDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NutritionDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
