import { AdminDoc, StudentDoc } from "@/firebaseSetup/fireBase.types";

export type AdminWithStringDate = Omit<AdminDoc, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type StudentwithStringDate = Omit<
  StudentDoc,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
};
