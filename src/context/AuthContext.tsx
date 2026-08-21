"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  const restoreSession = useCallback(async () => {
    try {
      const savedToken = localStorage.getItem("le_token");
      if (!savedToken) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      const data = await res.json();

      if (data.success && data.data) {
        setUser({
          id: data.data._id || data.data.id,
          name: data.data.name,
          email: data.data.email,
          role: data.data.role,
        });
        setToken(savedToken);
      } else {
        localStorage.removeItem("le_token");
      }
    } catch {
      localStorage.removeItem("le_token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        const { token: newToken, user: userData } = data.data;
        localStorage.setItem("le_token", newToken);
        setToken(newToken);
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });
        return { success: true };
      }

      return { success: false, error: data.error || "Login failed" };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.success) {
        const { token: newToken, user: userData } = data.data;
        localStorage.setItem("le_token", newToken);
        setToken(newToken);
        setUser({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
        });
        return { success: true };
      }

      return { success: false, error: data.error || "Registration failed" };
    } catch {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = () => {
    localStorage.removeItem("le_token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
