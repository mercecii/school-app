import {
  AdminDoc,
  ParentDoc,
  StudentDoc,
  TeacherDoc,
} from "@/firebaseSetup/fireBase.types";

export type AdminWithStringDate = Omit<
  AdminDoc,
  "createdAt" | "updatedAt" | "lastLoginAt"
> & {
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
};

export type TeacherWithStringDate = Omit<
  TeacherDoc,
  "createdAt" | "updatedAt" | "lastLoginAt"
> & {
  id: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export type ParentWithStringDate = Omit<
  ParentDoc,
  "createdAt" | "updatedAt" | "lastLoginAt"
> & {
  id: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

// A parent's linked children, fetched alongside the parent profile —
// not the raw StudentDoc collection shape, since the app always needs
// "this parent's kids" rather than an arbitrary student lookup.
export type StudentwithStringDate = Omit<
  StudentDoc,
  "createdAt" | "updatedAt"
> & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
