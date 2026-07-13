import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  clearStoredSession,
  createUserSession,
  getStoredSession,
  persistSession,
} from "./session";
import { clearApiSession, isApiEnabled, loginWithApi } from "../api/client";

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

  const loginWithPassword = useCallback(async (email, password, options) => {
    if (!isApiEnabled) return login({ email, name: email.split("@")[0] }, options);
    const nextSession = await loginWithApi(email, password);
    persistSession(nextSession, options);
    setSession(nextSession);
    return nextSession;
  }, [login]);

  const logout = useCallback(() => {
    clearApiSession();
    clearStoredSession();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session,
      session,
      isAuthenticated: Boolean(session),
      login,
      loginWithPassword,
      logout,
    }),
    [login, loginWithPassword, logout, session]
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
