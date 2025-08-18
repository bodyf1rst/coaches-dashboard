import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachTabComponent } from './coach-tab.component';

describe('CoachTabComponent', () => {
  let component: CoachTabComponent;
  let fixture: ComponentFixture<CoachTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoachTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoachTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
