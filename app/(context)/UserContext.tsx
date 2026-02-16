import { User } from "firebase/auth";
import { createContext, useContext } from "react";

export const UserContext = createContext<User | null>(null);

export const useUser = () => useContext(UserContext);
