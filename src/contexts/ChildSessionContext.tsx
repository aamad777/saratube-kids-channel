import React, { createContext, useContext, useEffect, useState } from "react";
import { AppTheme } from "@/hooks/useTheme";

interface ChildSession {
  id: string;
  userId: string;
  name: string;
  theme: AppTheme;
  age: number | null;
}

const ChildSessionContext = createContext<any>({
  childSession: null,
  setChildSession: () => {},
  clearChildSession: () => {},
  updateChildTheme: async () => {},
  isChildActive: false
});

export const useChildSession = () => useContext(ChildSessionContext);

export const ChildSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childSession, setChildSessionState] = useState<ChildSession | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("activeChildId");
    const userId = localStorage.getItem("activeChildUserId");
    const name = localStorage.getItem("activeChildName");
    const theme = (localStorage.getItem("activeChildTheme") || "rainbow") as AppTheme;
    const age = localStorage.getItem("activeChildAge");

    if (id && userId && name) {
      setChildSessionState({
        id,
        userId,
        name,
        theme,
        age: age ? Number(age) : null
      });
    }
  }, []);

  const setChildSession = (session: ChildSession | null) => {
    if (!session) {
      clearChildSession();
      return;
    }

    localStorage.setItem("activeChildId", session.id);
    localStorage.setItem("activeChildUserId", session.userId);
    localStorage.setItem("activeChildName", session.name);
    localStorage.setItem("activeChildTheme", session.theme);

    if (session.age !== null) {
      localStorage.setItem("activeChildAge", String(session.age));
    }

    setChildSessionState(session);
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
    localStorage.setItem("activeChildTheme", theme);
    setChildSessionState({ ...childSession, theme });
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
