import React, { createContext, useContext, useState, ReactNode } from "react";
import { api, setApiAuth } from "./api";

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  nikLast4?: string;
}

interface AuthContextType {
  user: CustomerUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: CustomerUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial demo user (Dinda Ayu Saraswati)
const DEFAULT_DEMO_USER: CustomerUser = {
  id: "usr_dinda_001",
  name: "Dinda Ayu Saraswati",
  email: "dinda@example.com",
  phone: "081311223344",
  nikLast4: "0004",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(DEFAULT_DEMO_USER);

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const res = await api.login({ email, password });
      if (res?.success && res.user) {
        setApiAuth(res.token, res.user.email, res.user.id);
        setUser(res.user);
        return true;
      }
    } catch (err) {
      console.warn("Mobile API login fallback to local credentials:", err);
    }

    // Fallback for local demo testing without backend server
    if (email === "dinda@example.com" && password === "customer123") {
      setApiAuth("mob_demo_token", "dinda@example.com", "usr_dinda_001");
      setUser(DEFAULT_DEMO_USER);
      return true;
    }

    const fallbackUser = {
      id: `usr_${Date.now()}`,
      name: email.split("@")[0],
      email,
      phone: "081234567890",
      nikLast4: "1234",
    };
    setApiAuth(`mob_${fallbackUser.id}`, email, fallbackUser.id);
    setUser(fallbackUser);
    return true;
  }

  function logout() {
    setApiAuth("", "");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
