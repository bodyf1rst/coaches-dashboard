import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNutritionsVideosComponent } from './add-nutritions-videos.component';

describe('AddNutritionsVideosComponent', () => {
  let component: AddNutritionsVideosComponent;
  let fixture: ComponentFixture<AddNutritionsVideosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddNutritionsVideosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNutritionsVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
