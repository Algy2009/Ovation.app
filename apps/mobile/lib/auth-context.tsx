import React, { createContext, useContext, useState, ReactNode } from "react";

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
    // For mobile demo, match demo accounts or allow instant login
    if (email === "dinda@example.com" && password === "customer123") {
      setUser(DEFAULT_DEMO_USER);
      return true;
    }

    setUser({
      id: `usr_${Date.now()}`,
      name: email.split("@")[0],
      email,
      phone: "081234567890",
      nikLast4: "1234",
    });
    return true;
  }

  function logout() {
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

