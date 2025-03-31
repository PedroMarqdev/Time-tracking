// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RouteEnum } from '@core/enums/route.enum';
import {AuthService} from '@services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isLoggedInValue()) {
    router.navigate([RouteEnum.HOME]);
    return false;
  }

  // Refresh token when accessing protected routes
  authService.refreshToken();
  return true;
};
