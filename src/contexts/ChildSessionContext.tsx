import React, { createContext, useContext, useEffect, useState } from "react";
import { AppTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";

interface ChildSession {
  id: string;
  name: string;
  theme: AppTheme;
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

  const updateChildTheme = async (theme: AppTheme) => {
    if (!childSession) return;

    // Update in database
    await supabase
      .from("profiles")
      .update({ selected_theme: theme })
      .eq("id", childSession.id);

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