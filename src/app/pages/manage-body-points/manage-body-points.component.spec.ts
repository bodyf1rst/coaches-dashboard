import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBodyPointsComponent } from './manage-body-points.component';

describe('ManageBodyPointsComponent', () => {
  let component: ManageBodyPointsComponent;
  let fixture: ComponentFixture<ManageBodyPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageBodyPointsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageBodyPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
