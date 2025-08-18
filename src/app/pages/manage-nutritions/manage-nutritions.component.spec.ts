import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNutritionsComponent } from './manage-nutritions.component';

describe('ManageNutritionsComponent', () => {
  let component: ManageNutritionsComponent;
  let fixture: ComponentFixture<ManageNutritionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageNutritionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageNutritionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
