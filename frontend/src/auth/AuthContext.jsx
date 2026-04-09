import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiPost } from "../lib/api";

const STORAGE_KEY = "smart-campus-user";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  async function login(credentials) {
    const signedInUser = await apiPost("/api/auth/login", credentials);
    setUser(signedInUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(signedInUser));
    return signedInUser;
  }

  async function signup(payload) {
    const signedUpUser = await apiPost("/api/auth/signup", payload);
    setUser(signedUpUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(signedUpUser));
    return signedUpUser;
  }

  function logout() {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
