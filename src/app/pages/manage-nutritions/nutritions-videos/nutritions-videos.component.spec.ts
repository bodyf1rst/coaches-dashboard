import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionsVideosComponent } from './nutritions-videos.component';

describe('NutritionsVideosComponent', () => {
  let component: NutritionsVideosComponent;
  let fixture: ComponentFixture<NutritionsVideosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NutritionsVideosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionsVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
