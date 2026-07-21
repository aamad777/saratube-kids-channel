import React, { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "@/lib/api";

interface AppUser {
  id: string;
  email: string | null;
  display_name: string;
}

interface AppSession {
  token: string;
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  age: number | null;
  avatar_url: string | null;
  is_parent: boolean | null;
  selected_theme: string | null;
  created_by_parent: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  session: AppSession | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

function profileFromUser(u: AppUser): Profile {
  return {
    id: u.id,
    user_id: u.id,
    display_name: u.display_name,
    age: null,
    avatar_url: null,
    is_parent: true,
    selected_theme: null,
    created_by_parent: null,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<AppSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const applyLogin = (token: string, u: { id: number | string; email?: string | null; display_name: string }) => {
    setToken(token);
    const appUser: AppUser = {
      id: String(u.id),
      email: u.email ?? null,
      display_name: u.display_name,
    };
    setUser(appUser);
    setSession({ token });
    setProfile(profileFromUser(appUser));
  };

  const login = async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: { id: number; email: string; display_name: string } }>(
      "/auth/login", { email, password });
    applyLogin(res.token, res.user);
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    await api.post("/auth/signup", { email, password, display_name: displayName });
    await login(email, password);
  };

  const refreshProfile = async () => {
    if (user) setProfile(profileFromUser(user));
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    api.get<{ sub: number; role: string; name: string }>("/auth/me")
      .then((me) => {
        if (me.role === "parent") {
          applyLogin(token, { id: me.sub, display_name: me.name, email: null });
        }
      })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    setToken(null);
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, login, signup, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
