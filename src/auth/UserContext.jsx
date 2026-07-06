import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearStoredSession,
  createUserSession,
  getStoredSession,
  persistSession,
} from "./session";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [session, setSession] = useState(() => getStoredSession());

  useEffect(() => {
    const syncSession = () => setSession(getStoredSession());

    window.addEventListener("spectramind:session-updated", syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("spectramind:session-updated", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  const login = useCallback((profile, options) => {
    const nextSession = createUserSession(profile);
    persistSession(nextSession, options);
    setSession(nextSession);
    return nextSession;
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session,
      session,
      isAuthenticated: Boolean(session),
      login,
      logout,
    }),
    [login, logout, session]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }

  return context;
}

export function useOptionalUser() {
  return useContext(UserContext);
}
