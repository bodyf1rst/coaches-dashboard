import { TestBed } from '@angular/core/testing';

import { CoachRestrictGuard } from './coach-restrict.guard';

describe('CoachRestrictGuard', () => {
  let guard: CoachRestrictGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(CoachRestrictGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
