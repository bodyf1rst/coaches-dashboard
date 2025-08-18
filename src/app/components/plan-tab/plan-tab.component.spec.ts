import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanTabComponent } from './plan-tab.component';

describe('PlanTabComponent', () => {
  let component: PlanTabComponent;
  let fixture: ComponentFixture<PlanTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
