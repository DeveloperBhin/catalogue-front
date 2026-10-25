
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService, RegisterRequest } from '@core';

import {
  RoleOption,
  CenterOption
} from '../../core/models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  private readonly apiUrl = '/api/v1';

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  // =========================================
  // REGISTER NEW USER
  // =========================================

  register(
    payload: RegisterRequest
  ): ReturnType<AuthService['register']> {

    return this.authService.register(payload);

  }

  // =========================================
  // GET TARI CENTERS
  // =========================================

  getCenters(): Observable<CenterOption[]> {

    return this.http.get<CenterOption[]>(
      `${this.apiUrl}/registration/centers`
    );

  }

  // =========================================
  // GET AVAILABLE ROLES
  // =========================================

  getRoles(): Observable<RoleOption[]> {

    return this.http.get<RoleOption[]>(
      `${this.apiUrl}/registration/roles`
    ).pipe(
      map(roles =>
        roles.filter(
          role => role.name !== 'ROLE_USER'
        )
      )
    );

  }

  // =========================================
  // GET SELECTED CENTER
  // =========================================

  getCenterById(
    centerId: number
  ): Observable<CenterOption | undefined> {

    return this.getCenters().pipe(
      map(centers =>
        centers.find(
          center => center.id === centerId
        )
      )
    );

  }

  // =========================================
  // GET SELECTED ROLE
  // =========================================

  getRoleById(
    roleId: number
  ): Observable<RoleOption | undefined> {

    return this.getRoles().pipe(
      map(roles =>
        roles.find(
          role => role.id === roleId
        )
      )
    );

  }

  // =========================================
  // CHECK DRIVER ROLE
  // =========================================

  isDriverRole(
    role: RoleOption | null | undefined
  ): boolean {

    return role?.name === 'ROLE_DRIVER';

  }

}
