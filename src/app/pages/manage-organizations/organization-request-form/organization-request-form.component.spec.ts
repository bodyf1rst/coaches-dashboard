import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationRequestFormComponent } from './organization-request-form.component';

describe('OrganizationRequestFormComponent', () => {
  let component: OrganizationRequestFormComponent;
  let fixture: ComponentFixture<OrganizationRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationRequestFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
