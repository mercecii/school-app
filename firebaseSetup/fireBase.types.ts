// DATABASE TABLES

import { Timestamp } from "firebase/firestore";

/**
 * Firestore Admin Document (raw structure from DB)
 */
export type AdminDoc = {
  createdAt: Timestamp; // or Date if you prefer to parse timestamps
  email: string;
  fullName: string;
  isActive: boolean;
  lastLoginAt: Timestamp; // or Date if you prefer to parse timestamps
  phone: string;
  role: string;
  updatedAt: Timestamp;
};

export type NotificationDoc = {
  createdAt: Timestamp; // or Date
  createdBy: string;
  isActive: boolean;
  message: string;
  readAt: Timestamp | null; // or Date | null (optional timestamp)
  readBy: string[]; // array of user IDs
  readReceipt: boolean;
  targetType: string;
  targetValue: string;
  title: string;
};

/**
 * Firestore Student Document (raw DB structure)
 */
export type StudentDoc = {
  class: string;
  createdAt: Timestamp; // or Date if you prefer to parse timestamps
  fullname: string;
  gender: string; // or 'M' | 'F'
  isActive: boolean;
  parentEmail: string;
  parentName: string;
  parentPhone: string;
  pushToken: string;
  role: string; // or 'student' | 'teacher' | 'admin'
  rollNumber: string;
  section: string;
  updatedAt: Timestamp; // or Date
};
// DATABASE TABLES - END

// FIREBASE AUTH USER INFO
export type FirebaseUserInfo = {
  localId: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  passwordUpdatedAt: number;
  providerUserInfo: ProviderInfo[];
  validSince: string;
  disabled: boolean;
  lastLoginAt: string;
  createdAt: string;
  lastRefreshAt: string;
};

export type ProviderInfo = {
  providerId: string;
  federatedId: string;
  email: string;
  rawId: string;
};

export type GetAccountInfoResponse = {
  kind: "identitytoolkit#GetAccountInfoResponse";
  users: FirebaseUserInfo[];
};

// FIREBASE AUTH USER INFO - END
