import { TestBed } from '@angular/core/testing';

import { StopNavigateGuard } from './stop-navigate.guard';

describe('StopNavigateGuard', () => {
  let guard: StopNavigateGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(StopNavigateGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
