import React, { createContext, useContext, useEffect, useState } from "react";
import { AppTheme } from "@/hooks/useTheme";

interface ChildSession {
  id: string;
  name: string;
  theme: AppTheme;
}

interface ChildSessionContextType {
  childSession: ChildSession | null;
  setChildSession: (session: ChildSession | null) => void;
  clearChildSession: () => void;
  isChildActive: boolean;
}

const ChildSessionContext = createContext<ChildSessionContextType>({
  childSession: null,
  setChildSession: () => {},
  clearChildSession: () => {},
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
    const storedName = localStorage.getItem("activeChildName");
    const storedTheme = localStorage.getItem("activeChildTheme") as AppTheme;

    if (storedId && storedName) {
      setChildSessionState({
        id: storedId,
        name: storedName,
        theme: storedTheme || "rainbow",
      });
    }
  }, []);

  const setChildSession = (session: ChildSession | null) => {
    if (session) {
      localStorage.setItem("activeChildId", session.id);
      localStorage.setItem("activeChildName", session.name);
      localStorage.setItem("activeChildTheme", session.theme);
      setChildSessionState(session);
    } else {
      clearChildSession();
    }
  };

  const clearChildSession = () => {
    localStorage.removeItem("activeChildId");
    localStorage.removeItem("activeChildName");
    localStorage.removeItem("activeChildTheme");
    setChildSessionState(null);
  };

  return (
    <ChildSessionContext.Provider 
      value={{ 
        childSession, 
        setChildSession, 
        clearChildSession,
        isChildActive: !!childSession 
      }}
    >
      {children}
    </ChildSessionContext.Provider>
  );
};
