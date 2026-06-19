import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { notLoginGuard } from './not-login.guard';

describe('notLoginGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => notLoginGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
