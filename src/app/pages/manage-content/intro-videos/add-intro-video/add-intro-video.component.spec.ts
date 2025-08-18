import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIntroVideoComponent } from './add-intro-video.component';

describe('AddIntroVideoComponent', () => {
  let component: AddIntroVideoComponent;
  let fixture: ComponentFixture<AddIntroVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddIntroVideoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddIntroVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
