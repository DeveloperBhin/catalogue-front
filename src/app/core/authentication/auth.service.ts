import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { ApiService } from '../services/api.service';

import {
  LoginRequest,
  LoginResponse,
  RegisterApiRequest,
  RegisterResponse
} from './auth.models';

export interface AuthenticatedUser {
  id: number;
  fullName: string;
  email: string;
  centerId: number | null;
  roles: string[];
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'cpms_token';

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  login(
    request: LoginRequest
  ): Observable<LoginResponse> {

    return this.api
      .post<LoginResponse>(
        '/auth/login',
        request
      )
      .pipe(
        tap(response => {

          if (response.token) {
            localStorage.setItem(
              this.TOKEN_KEY,
              response.token
            );
          }

        })
      );
  }

  register(
    request: RegisterApiRequest
  ): Observable<RegisterResponse> {

    return this.api.post<RegisterResponse>(
      '/auth/register',
      request
    );
  }

  getToken(): string | null {
    return localStorage.getItem(
      this.TOKEN_KEY
    );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {

    localStorage.removeItem(
      this.TOKEN_KEY
    );

    this.router.navigate([
      '/auth/login'
    ]);
  }
  getCurrentUser(): Observable<AuthenticatedUser> {
  return this.api.get<AuthenticatedUser>(
    '/auth/me'
  );
}

hasAnyRole(
  user: AuthenticatedUser,
  allowedRoles: string[]
): boolean {
  return user.roles.some(
    role => allowedRoles.includes(role)
  );
}
}