import React, { createContext, useContext, useEffect, useState } from "react";
import { AppTheme } from "@/hooks/useTheme";
import { api } from "@/lib/api";

interface ChildSession {
  id: string;
  userId: string;
  name: string;
  theme: AppTheme;
  age: number | null;
}

interface ChildSessionContextType {
  childSession: ChildSession | null;
  setChildSession: (session: ChildSession | null) => void;
  clearChildSession: () => void;
  updateChildTheme: (theme: AppTheme) => Promise<void>;
  isChildActive: boolean;
}

const ChildSessionContext = createContext<ChildSessionContextType>({
  childSession: null,
  setChildSession: () => {},
  clearChildSession: () => {},
  updateChildTheme: async () => {},
  isChildActive: false,
});

export const useChildSession = () => {
  const context = useContext(ChildSessionContext);
  if (!context) {
    throw new Error("useChildSession must be used within a ChildSessionProvider");
  }
  return context;
};

export const ChildSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childSession, setChildSessionState] = useState<ChildSession | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedId = localStorage.getItem("activeChildId");
    const storedUserId = localStorage.getItem("activeChildUserId");
    const storedName = localStorage.getItem("activeChildName");
    const storedTheme = localStorage.getItem("activeChildTheme") as AppTheme;
    const storedAge = localStorage.getItem("activeChildAge");

    if (storedId && storedUserId && storedName) {
      setChildSessionState({
        id: storedId,
        userId: storedUserId,
        name: storedName,
        theme: storedTheme || "rainbow",
        age: storedAge ? parseInt(storedAge) : null,
      });
    }
  }, []);

  const setChildSession = (session: ChildSession | null) => {
    if (session) {
      localStorage.setItem("activeChildId", session.id);
      localStorage.setItem("activeChildUserId", session.userId);
      localStorage.setItem("activeChildName", session.name);
      localStorage.setItem("activeChildTheme", session.theme);
      if (session.age !== null) {
        localStorage.setItem("activeChildAge", String(session.age));
      } else {
        localStorage.removeItem("activeChildAge");
      }
      setChildSessionState(session);
    } else {
      clearChildSession();
    }
  };

  const clearChildSession = () => {
    localStorage.removeItem("activeChildId");
    localStorage.removeItem("activeChildUserId");
    localStorage.removeItem("activeChildName");
    localStorage.removeItem("activeChildTheme");
    localStorage.removeItem("activeChildAge");
    setChildSessionState(null);
  };

  const updateChildTheme = async (theme: AppTheme) => {
    if (!childSession) return;

    // Update in database (ignore failure so theme still changes locally)
    try { await api.put("/children/theme", { theme }); } catch (e) { console.error(e); }

    // Update local state and storage
    const updatedSession = { ...childSession, theme };
    localStorage.setItem("activeChildTheme", theme);
    setChildSessionState(updatedSession);
  };

  return (
    <ChildSessionContext.Provider 
      value={{ 
        childSession, 
        setChildSession, 
        clearChildSession,
        updateChildTheme,
        isChildActive: !!childSession 
      }}
    >
      {children}
    </ChildSessionContext.Provider>
  );
};