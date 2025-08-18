import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StringTabComponent } from './string-tab.component';

describe('StringTabComponent', () => {
  let component: StringTabComponent;
  let fixture: ComponentFixture<StringTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StringTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StringTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
