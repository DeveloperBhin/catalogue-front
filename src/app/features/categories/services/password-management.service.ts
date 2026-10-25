
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ApiMessage {
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PasswordManagementService {

  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient) {}

  forgotPassword(email: string): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(
      `${this.baseUrl}/forgot-password`,
      { email }
    );
  }

  resetPassword(
    token: string,
    newPassword: string
  ): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(
      `${this.baseUrl}/reset-password`,
      { token, newPassword }
    );
  }

  changePassword(
    currentPassword: string,
    newPassword: string
  ): Observable<ApiMessage> {
    return this.http.post<ApiMessage>(
      `${this.baseUrl}/change-password`,
      { currentPassword, newPassword }
    );
  }
}
