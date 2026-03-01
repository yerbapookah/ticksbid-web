"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthState {
  isLoggedIn: boolean;
  user: { username: string; phone: string } | null;
  login: (username: string, phone: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ username: string; phone: string } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("ticksbid_user");
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoaded(true);
  }, []);

  function login(username: string, phone: string) {
    const u = { username, phone };
    setUser(u);
    localStorage.setItem("ticksbid_user", JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("ticksbid_user");
  }

  if (!loaded) return <>{children}</>;

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
