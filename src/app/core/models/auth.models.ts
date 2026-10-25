
export interface RoleOption {
  id: number;
  name: string;
}

export interface CenterOption {
  id: number;
  name: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  staffId: string;
  centerId: number;
  requestedRoleId: number;
  driverLicenceNumber?: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  staffId: string | null;
  centerId: number | null;
  driverLicenceNumber: string | null;
  status: string;
  roles: string[];
  requestedRole: string | null;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserResponse;
}