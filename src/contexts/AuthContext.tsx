import React, { createContext, useContext, useEffect, useState } from "react";

interface LocalUser {
  id: string;
  email: string;
  role: string;
  created_at?: string;
}

const AuthContext = createContext<any>({
  user: null,
  profile: null,
  loading: false,
  signOut: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("saratube_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const signOut = () => {
    localStorage.removeItem("saratube_token");
    localStorage.removeItem("saratube_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile: user, loading: false, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
