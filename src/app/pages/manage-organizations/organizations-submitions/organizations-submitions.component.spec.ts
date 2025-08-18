import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationsSubmitionsComponent } from './organizations-submitions.component';

describe('OrganizationsSubmitionsComponent', () => {
  let component: OrganizationsSubmitionsComponent;
  let fixture: ComponentFixture<OrganizationsSubmitionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganizationsSubmitionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationsSubmitionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
