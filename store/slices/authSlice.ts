import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AdminWithStringDate, StudentwithStringDate } from "./auth.type";

type UserRole = "admin" | "student" | null;

interface AuthState {
  userInfo: AdminWithStringDate | StudentwithStringDate | null;
  role: UserRole;
  loading: boolean;
}

const initialState: AuthState = {
  userInfo: null,
  role: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Admin | Student | null>) {
      state.userInfo = action.payload;
    },
    setRole(state, action: PayloadAction<UserRole>) {
      state.role = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    logout(state) {
      state.userInfo = null;
      state.role = null;
    },
  },
});

export const { setUser, setRole, setLoading, logout } = authSlice.actions;

export default authSlice.reducer;
