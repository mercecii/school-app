export interface User {
  isActive: boolean;
  phone: string;
  email: string;
  role: string;
  lastLoginAt: LastLoginAt;
  fullName: string;
  createdAt: string;
}

export interface LastLoginAt {
  type: string;
  seconds: number;
  nanoseconds: number;
}
