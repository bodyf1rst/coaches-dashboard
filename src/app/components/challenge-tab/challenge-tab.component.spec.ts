import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChallengeTabComponent } from './challenge-tab.component';

describe('ChallengeTabComponent', () => {
  let component: ChallengeTabComponent;
  let fixture: ComponentFixture<ChallengeTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChallengeTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChallengeTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
