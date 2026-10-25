
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';

import {
  RoleOption,
  CenterOption,
  RegisterRequest
} from '../../../core/models/auth.models';

export interface RegistrationResponse {
  id?: number;
  userId?: number;
  fullName?: string;
  email?: string;
  message?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ========================================
  // GET TARI CENTERS
  // ========================================

  getCenters(): Observable<CenterOption[]> {
    return this.http.get<CenterOption[]>(
      `${this.apiUrl}/registration/centers`
    ).pipe(
      map(centers => centers ?? []),
      catchError(error => this.handleError(error))
    );
  }

  // ========================================
  // GET REGISTRATION ROLES
  // ========================================

  getRoles(): Observable<RoleOption[]> {
    return this.http.get<RoleOption[]>(
      `${this.apiUrl}/registration/roles`
    ).pipe(
      map(roles =>
        (roles ?? []).filter(
          role =>
            role.name !== 'ROLE_USER' &&
            role.name !== 'ROLE_ADMIN'
        )
      ),
      catchError(error => this.handleError(error))
    );
  }

  // ========================================
  // REGISTER USER
  // ========================================

  register(
    request: RegisterRequest
  ): Observable<RegistrationResponse> {

    const payload: RegisterRequest = {
      fullName: request.fullName.trim(),
      email: request.email.trim().toLowerCase(),
      phoneNumber: request.phoneNumber.trim(),
      staffId: request.staffId.trim(),
      centerId: Number(request.centerId),
      requestedRoleId: Number(request.requestedRoleId),
      driverLicenceNumber:
        request.driverLicenceNumber?.trim() || undefined,
      password: request.password
    };

    return this.http.post<RegistrationResponse>(
      `${this.apiUrl}/auth/register`,
      payload
    ).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // ========================================
  // GET CENTER BY ID
  // ========================================

  getCenterById(
    centerId: number
  ): Observable<CenterOption | undefined> {
    return this.getCenters().pipe(
      map(centers =>
        centers.find(center => center.id === centerId)
      )
    );
  }

  // ========================================
  // GET ROLE BY ID
  // ========================================

  getRoleById(
    roleId: number
  ): Observable<RoleOption | undefined> {
    return this.getRoles().pipe(
      map(roles =>
        roles.find(role => role.id === roleId)
      )
    );
  }

  // ========================================
  // DRIVER ROLE CHECK
  // ========================================

  isDriverRole(
    role: RoleOption | null | undefined
  ): boolean {
    return role?.name === 'ROLE_DRIVER';
  }

  // ========================================
  // API ERROR HANDLING
  // ========================================

  private handleError(
    error: HttpErrorResponse
  ): Observable<never> {

    console.error('TVMS Registration Error:', error);

    let message = 'An unexpected error occurred.';

    switch (error.status) {
      case 0:
        message = 'Cannot connect to the TVMS backend.';
        break;

      case 400:
        message = 'Invalid registration information.';
        break;

      case 401:
        message = 'Authentication required.';
        break;

      case 403:
        message = 'Access denied.';
        break;

      case 404:
        message = 'Registration API endpoint not found.';
        break;

      case 409:
        message = 'Email or Staff ID already exists.';
        break;

      default:
        if (error.status >= 500) {
          message = 'TVMS backend server error.';
        }
    }

    return throwError(() => ({
      status: error.status,
      message,
      details: error.error
    }));
  }
}
