import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../lib/api";

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

  const login = useCallback(async (credentials) => {
    const signedInUser = await apiPost("/api/auth/login", credentials, null);
    setUser(signedInUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(signedInUser));
    return signedInUser;
  }, []);

  const signup = useCallback(async (payload) => {
    const signedUpUser = await apiPost("/api/auth/signup", payload, null);
    setUser(signedUpUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(signedUpUser));
    return signedUpUser;
  }, []);

  const completeGoogleLogin = useCallback(async () => {
    const signedInUser = await apiGet("/api/auth/oauth2/session", null, {
      credentials: "include"
    });
    setUser(signedInUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(signedInUser));
    return signedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/api/auth/logout", undefined, null, {
        credentials: "include"
      });
    } catch {
      // Logout error can be ignored
    }
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      return null;
    }
    const profile = await apiGet("/api/auth/me", user);
    setUser(profile);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return profile;
  }, [user]);

  const updateProfile = useCallback(async (payload) => {
    if (!user) {
      return null;
    }
    const updatedUser = await apiPut("/api/auth/me", payload, user);
    setUser(updatedUser);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }, [user]);

  const deleteAccount = useCallback(async () => {
    if (!user) {
      return;
    }
    await apiDelete("/api/auth/me", user);
    logout();
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      signup,
      completeGoogleLogin,
      refreshProfile,
      updateProfile,
      deleteAccount,
      logout
    }),
    [user, loading, login, signup, completeGoogleLogin, refreshProfile, updateProfile, deleteAccount, logout]
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
