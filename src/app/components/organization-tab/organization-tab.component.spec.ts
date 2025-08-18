import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationTabComponent } from './organization-tab.component';

describe('OrganizationTabComponent', () => {
  let component: OrganizationTabComponent;
  let fixture: ComponentFixture<OrganizationTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationTabComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
