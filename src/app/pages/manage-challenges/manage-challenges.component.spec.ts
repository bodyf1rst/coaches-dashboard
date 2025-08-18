import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageChallengesComponent } from './manage-challenges.component';

describe('ManageChallengesComponent', () => {
  let component: ManageChallengesComponent;
  let fixture: ComponentFixture<ManageChallengesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageChallengesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageChallengesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
