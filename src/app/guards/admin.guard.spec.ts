import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthPocketbaseService } from '../services/auth.service';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  const router = { navigate: vi.fn() };
  const auth = {
    isLoggedIn: true,
    user: { type: 'admin' },
  };

  beforeEach(() => {
    router.navigate.mockReset();
    auth.isLoggedIn = true;
    auth.user = { type: 'admin' };
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthPocketbaseService, useValue: auth },
      ],
    });
  });

  it('allows an authenticated application admin', () => {
    expect(TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never))).toBe(true);
  });

  it('rejects an authenticated non-admin', () => {
    auth.user = { type: 'client' };

    expect(TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never))).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard/login']);
  });
});
