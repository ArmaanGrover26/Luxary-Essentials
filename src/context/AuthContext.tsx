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

  // Restore session on mount via HttpOnly cookie
  const restoreSession = useCallback(async () => {
    try {
      // Clean up legacy insecure storage if present
      if (typeof window !== "undefined") {
        localStorage.removeItem("le_token");
      }

      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success && data.data) {
        setUser({
          id: data.data._id || data.data.id,
          name: data.data.name,
          email: data.data.email,
          role: data.data.role,
        });
      }
    } catch {
      setUser(null);
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
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        const { user: userData } = data.data;
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
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.success) {
        const { user: userData } = data.data;
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

  const logout = async () => {
    try {
      await fetch("/api/auth/me", { method: "POST", credentials: "include" });
    } catch {
      // Proceed with local logout regardless of network status
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("le_token");
    }
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
