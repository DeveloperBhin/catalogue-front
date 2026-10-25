export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword?: string;

  staffId?: string;
  centerId?: number;
  requestedRoleId?: number;
  driverLicenceNumber?: string;
}

export interface RegisterApiRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;

  staffId?: string;
  centerId?: number;
  requestedRoleId?: number;
  driverLicenceNumber?: string;
}

export interface UserResponse {
  id: number;

  fullName: string;

  email: string;

  phoneNumber?: string;

  status?: string;

  roles?: string[];
}

export interface LoginResponse {
  token: string;

  tokenType?: string;

  user?: UserResponse;
}

export interface RegisterResponse {
  token?: string;

  tokenType?: string;

  user?: UserResponse;

  message?: string;
}