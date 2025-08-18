import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderTabComponent } from './placeholder-tab.component';

describe('PlaceholderTabComponent', () => {
  let component: PlaceholderTabComponent;
  let fixture: ComponentFixture<PlaceholderTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaceholderTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaceholderTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
