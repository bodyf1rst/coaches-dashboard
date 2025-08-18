import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCoachesComponent } from './manage-coaches.component';

describe('ManageCoachesComponent', () => {
  let component: ManageCoachesComponent;
  let fixture: ComponentFixture<ManageCoachesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageCoachesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCoachesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
