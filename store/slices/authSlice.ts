import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AdminWithStringDate,
  ParentWithStringDate,
  StudentwithStringDate,
  TeacherWithStringDate,
} from "./auth.type";

type UserRole = "admin" | "teacher" | "parent" | null;
type UserInfo =
  | AdminWithStringDate
  | TeacherWithStringDate
  | ParentWithStringDate
  | null;

interface AuthState {
  userInfo: UserInfo;
  role: UserRole;
  // Only populated for role "parent" — the parent's linked children, fetched
  // alongside the profile so screens don't each re-derive it from childStudentIds.
  children: StudentwithStringDate[];
  selectedChildId: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  userInfo: null,
  role: null,
  children: [],
  selectedChildId: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserInfo>) {
      state.userInfo = action.payload;
    },
    setRole(state, action: PayloadAction<UserRole>) {
      state.role = action.payload;
    },
    setChildren(state, action: PayloadAction<StudentwithStringDate[]>) {
      state.children = action.payload;
      if (
        !state.selectedChildId ||
        !action.payload.some((c) => c.id === state.selectedChildId)
      ) {
        state.selectedChildId = action.payload[0]?.id ?? null;
      }
    },
    setSelectedChildId(state, action: PayloadAction<string | null>) {
      state.selectedChildId = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    logout(state) {
      state.userInfo = null;
      state.role = null;
      state.children = [];
      state.selectedChildId = null;
    },
  },
});

export const {
  setUser,
  setRole,
  setChildren,
  setSelectedChildId,
  setLoading,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
