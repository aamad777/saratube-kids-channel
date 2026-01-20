import { useAuth } from "@/contexts/AuthContext";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { useMemo } from "react";

export type AppTheme = "rainbow" | "princess" | "ocean" | "space" | "jungle" | "candy" | "superhero" | "dinosaur";

interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  gradient: string;
  cardBg: string;
  emoji: string;
}

const themeConfigs: Record<AppTheme, ThemeConfig> = {
  rainbow: {
    name: "Rainbow",
    primary: "from-pink-500 via-purple-500 to-blue-500",
    secondary: "from-yellow-400 via-green-400 to-cyan-400",
    accent: "text-pink-500",
    background: "bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50",
    gradient: "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500",
    cardBg: "bg-white/80 backdrop-blur-sm border-pink-200",
    emoji: "🎨",
  },
  princess: {
    name: "Princess",
    primary: "from-pink-400 to-rose-500",
    secondary: "from-purple-300 to-pink-400",
    accent: "text-rose-500",
    background: "bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50",
    gradient: "bg-gradient-to-r from-pink-400 to-rose-500",
    cardBg: "bg-white/80 backdrop-blur-sm border-rose-200",
    emoji: "👑",
  },
  ocean: {
    name: "Ocean",
    primary: "from-cyan-400 to-blue-600",
    secondary: "from-teal-300 to-cyan-500",
    accent: "text-cyan-500",
    background: "bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50",
    gradient: "bg-gradient-to-r from-cyan-400 to-blue-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-cyan-200",
    emoji: "🌊",
  },
  space: {
    name: "Space",
    primary: "from-indigo-500 to-purple-600",
    secondary: "from-violet-400 to-indigo-500",
    accent: "text-indigo-500",
    background: "bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50",
    gradient: "bg-gradient-to-r from-indigo-500 to-purple-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-indigo-200",
    emoji: "🚀",
  },
  jungle: {
    name: "Jungle",
    primary: "from-green-400 to-emerald-600",
    secondary: "from-lime-300 to-green-500",
    accent: "text-emerald-500",
    background: "bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50",
    gradient: "bg-gradient-to-r from-green-400 to-emerald-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-green-200",
    emoji: "🌴",
  },
  candy: {
    name: "Candy",
    primary: "from-pink-400 to-orange-400",
    secondary: "from-yellow-300 to-pink-400",
    accent: "text-orange-500",
    background: "bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50",
    gradient: "bg-gradient-to-r from-pink-400 to-orange-400",
    cardBg: "bg-white/80 backdrop-blur-sm border-orange-200",
    emoji: "🍭",
  },
  superhero: {
    name: "Superhero",
    primary: "from-red-500 via-yellow-400 to-blue-600",
    secondary: "from-blue-500 to-red-500",
    accent: "text-red-500",
    background: "bg-gradient-to-br from-red-50 via-yellow-50 to-blue-50",
    gradient: "bg-gradient-to-r from-red-500 via-yellow-400 to-blue-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-red-200",
    emoji: "⚡",
  },
  dinosaur: {
    name: "Dinosaur",
    primary: "from-amber-500 to-green-600",
    secondary: "from-orange-400 to-amber-500",
    accent: "text-green-600",
    background: "bg-gradient-to-br from-amber-50 via-lime-50 to-green-50",
    gradient: "bg-gradient-to-r from-amber-500 to-green-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-amber-200",
    emoji: "🦖",
  },
};

export const useTheme = () => {
  const { profile } = useAuth();
  const { childSession, isChildActive } = useChildSession();

  const currentTheme = useMemo(() => {
    // Prioritize child session theme when active
    if (isChildActive && childSession?.theme) {
      return themeConfigs[childSession.theme] || themeConfigs.rainbow;
    }
    // Fall back to parent profile theme
    const selectedTheme = (profile?.selected_theme as AppTheme) || "rainbow";
    return themeConfigs[selectedTheme] || themeConfigs.rainbow;
  }, [profile?.selected_theme, childSession?.theme, isChildActive]);

  const themeName = useMemo(() => {
    if (isChildActive && childSession?.theme) {
      return childSession.theme;
    }
    return (profile?.selected_theme as AppTheme) || "rainbow";
  }, [profile?.selected_theme, childSession?.theme, isChildActive]);

  return {
    theme: currentTheme,
    themeName,
    themeConfigs,
    isAuthenticated: !!profile || isChildActive,
    isChildActive,
    childName: childSession?.name,
  };
};

export { themeConfigs };
