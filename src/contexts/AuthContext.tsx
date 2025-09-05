"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { EVEUser } from "@/types/auth";

interface AuthContextType {
  user: EVEUser | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<EVEUser | null>(null);
  const [loading, setLoading] = useState(true);

  const login = () => {
    window.location.href = "/api/auth/eve/login";
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/eve/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshSession = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/eve/session");
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error("Session refresh error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
