import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { createLogger } from "redux-logger";
import authReducer from "./slices/authSlice";

const logger = createLogger({
  collapsed: true,
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: <TSelected>(
  selector: (state: AppState) => TSelected,
) => TSelected = useSelector;
