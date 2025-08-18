import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroVideosComponent } from './intro-videos.component';

describe('IntroVideosComponent', () => {
  let component: IntroVideosComponent;
  let fixture: ComponentFixture<IntroVideosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IntroVideosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntroVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
