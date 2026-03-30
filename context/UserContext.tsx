import { createContext, useContext } from "react";
import { AuthUser } from "../utils/authClient";

export const UserContext = createContext<AuthUser | null>(null);

export const useUser = () => useContext(UserContext);
