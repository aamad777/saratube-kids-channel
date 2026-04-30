import { useAuth } from "@/contexts/AuthContext";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { useMemo } from "react";

export type AppTheme =
  | "rainbow" | "princess" | "ocean" | "space" | "jungle" | "candy"
  | "superhero" | "dinosaur" | "unicorn" | "pirate" | "fairy" | "robot"
  | "quran_stories" | "nasheed" | "ramadan" | "dua_prayer"
  | "farm" | "sports" | "cars" | "magic" | "bunny"
  | "labubu_pink" | "labubu_green" | "labubu_brown" | "labubu_blue";

interface ThemeConfig {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  gradient: string;
  cardBg: string;
  emoji: string;
  bgImage?: string;
  iconUrl?: string;
  group?: "general" | "islamic" | "adventure";
}

const themeConfigs: Record<AppTheme, ThemeConfig> = {
  // ── General Themes ──
  rainbow: {
    name: "Rainbow", primary: "from-pink-500 via-purple-500 to-blue-500",
    secondary: "from-yellow-400 via-green-400 to-cyan-400", accent: "text-pink-500",
    background: "bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50",
    gradient: "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500",
    cardBg: "bg-white/80 backdrop-blur-sm border-pink-200", emoji: "🎨", group: "general",
  },
  princess: {
    name: "Princess", primary: "from-pink-400 to-rose-500",
    secondary: "from-purple-300 to-pink-400", accent: "text-rose-500",
    background: "bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50",
    gradient: "bg-gradient-to-r from-pink-400 to-rose-500",
    cardBg: "bg-white/80 backdrop-blur-sm border-rose-200", emoji: "👑", group: "general",
  },
  ocean: {
    name: "Ocean", primary: "from-cyan-400 to-blue-600",
    secondary: "from-teal-300 to-cyan-500", accent: "text-cyan-500",
    background: "bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50",
    gradient: "bg-gradient-to-r from-cyan-400 to-blue-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-cyan-200", emoji: "🌊", group: "general",
  },
  space: {
    name: "Space", primary: "from-indigo-500 to-purple-600",
    secondary: "from-violet-400 to-indigo-500", accent: "text-indigo-500",
    background: "bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50",
    gradient: "bg-gradient-to-r from-indigo-500 to-purple-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-indigo-200", emoji: "🚀", group: "general",
  },
  jungle: {
    name: "Jungle", primary: "from-green-400 to-emerald-600",
    secondary: "from-lime-300 to-green-500", accent: "text-emerald-500",
    background: "bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50",
    gradient: "bg-gradient-to-r from-green-400 to-emerald-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-green-200", emoji: "🌴", group: "general",
  },
  candy: {
    name: "Candy", primary: "from-pink-400 to-orange-400",
    secondary: "from-yellow-300 to-pink-400", accent: "text-orange-500",
    background: "bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50",
    gradient: "bg-gradient-to-r from-pink-400 to-orange-400",
    cardBg: "bg-white/80 backdrop-blur-sm border-orange-200", emoji: "🍭", group: "general",
  },
  superhero: {
    name: "Superhero", primary: "from-red-500 via-yellow-400 to-blue-600",
    secondary: "from-blue-500 to-red-500", accent: "text-red-500",
    background: "bg-gradient-to-br from-red-50 via-yellow-50 to-blue-50",
    gradient: "bg-gradient-to-r from-red-500 via-yellow-400 to-blue-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-red-200", emoji: "⚡", group: "general",
  },
  dinosaur: {
    name: "Dinosaur", primary: "from-amber-500 to-green-600",
    secondary: "from-orange-400 to-amber-500", accent: "text-green-600",
    background: "bg-gradient-to-br from-amber-50 via-lime-50 to-green-50",
    gradient: "bg-gradient-to-r from-amber-500 to-green-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-amber-200", emoji: "🦖", group: "general",
  },
  unicorn: {
    name: "Unicorn", primary: "from-pink-400 via-purple-400 to-blue-400",
    secondary: "from-violet-300 to-pink-300", accent: "text-purple-400",
    background: "bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50",
    gradient: "bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400",
    cardBg: "bg-white/80 backdrop-blur-sm border-purple-200", emoji: "🦄", group: "general",
  },
  pirate: {
    name: "Pirate", primary: "from-amber-600 to-stone-700",
    secondary: "from-yellow-500 to-amber-600", accent: "text-amber-600",
    background: "bg-gradient-to-br from-amber-50 via-yellow-50 to-stone-50",
    gradient: "bg-gradient-to-r from-amber-600 to-stone-700",
    cardBg: "bg-white/80 backdrop-blur-sm border-amber-300", emoji: "🏴‍☠️", group: "adventure",
  },
  fairy: {
    name: "Fairy", primary: "from-fuchsia-400 to-purple-500",
    secondary: "from-pink-300 to-fuchsia-400", accent: "text-fuchsia-500",
    background: "bg-gradient-to-br from-fuchsia-50 via-pink-50 to-purple-50",
    gradient: "bg-gradient-to-r from-fuchsia-400 to-purple-500",
    cardBg: "bg-white/80 backdrop-blur-sm border-fuchsia-200", emoji: "🧚", group: "general",
  },
  robot: {
    name: "Robot", primary: "from-sky-500 to-slate-600",
    secondary: "from-cyan-400 to-sky-500", accent: "text-sky-500",
    background: "bg-gradient-to-br from-sky-50 via-slate-50 to-cyan-50",
    gradient: "bg-gradient-to-r from-sky-500 to-slate-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-sky-200", emoji: "🤖", group: "general",
  },

  // ── Islamic Themes ──
  quran_stories: {
    name: "Quran Stories", primary: "from-emerald-500 to-teal-600",
    secondary: "from-green-400 to-emerald-500", accent: "text-emerald-600",
    background: "bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50",
    gradient: "bg-gradient-to-r from-emerald-500 to-teal-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-emerald-200", emoji: "📖", group: "islamic",
  },
  nasheed: {
    name: "Nasheed", primary: "from-violet-500 to-indigo-600",
    secondary: "from-purple-400 to-violet-500", accent: "text-violet-600",
    background: "bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50",
    gradient: "bg-gradient-to-r from-violet-500 to-indigo-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-violet-200", emoji: "🎶", group: "islamic",
  },
  ramadan: {
    name: "Ramadan & Eid", primary: "from-amber-400 to-yellow-500",
    secondary: "from-yellow-300 to-amber-400", accent: "text-amber-500",
    background: "bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50",
    gradient: "bg-gradient-to-r from-amber-400 to-yellow-500",
    cardBg: "bg-white/80 backdrop-blur-sm border-amber-200", emoji: "🌙", group: "islamic",
  },
  dua_prayer: {
    name: "Dua & Prayer", primary: "from-teal-400 to-cyan-600",
    secondary: "from-cyan-300 to-teal-400", accent: "text-teal-600",
    background: "bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50",
    gradient: "bg-gradient-to-r from-teal-400 to-cyan-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-teal-200", emoji: "🤲", group: "islamic",
  },

  // ── Adventure Themes ──
  farm: {
    name: "Farm", primary: "from-green-500 to-lime-600",
    secondary: "from-yellow-400 to-green-500", accent: "text-green-600",
    background: "bg-gradient-to-br from-green-50 via-lime-50 to-yellow-50",
    gradient: "bg-gradient-to-r from-green-500 to-lime-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-green-200", emoji: "🐄", group: "adventure",
  },
  sports: {
    name: "Sports", primary: "from-blue-500 to-green-500",
    secondary: "from-green-400 to-blue-400", accent: "text-blue-600",
    background: "bg-gradient-to-br from-blue-50 via-green-50 to-cyan-50",
    gradient: "bg-gradient-to-r from-blue-500 to-green-500",
    cardBg: "bg-white/80 backdrop-blur-sm border-blue-200", emoji: "⚽", group: "adventure",
  },
  cars: {
    name: "Cars & Trucks", primary: "from-red-500 to-orange-500",
    secondary: "from-orange-400 to-red-400", accent: "text-red-500",
    background: "bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50",
    gradient: "bg-gradient-to-r from-red-500 to-orange-500",
    cardBg: "bg-white/80 backdrop-blur-sm border-red-200", emoji: "🚗", group: "adventure",
  },
  magic: {
    name: "Magic & Wizards", primary: "from-indigo-500 to-violet-600",
    secondary: "from-purple-400 to-indigo-500", accent: "text-indigo-600",
    background: "bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50",
    gradient: "bg-gradient-to-r from-indigo-500 to-violet-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-indigo-200", emoji: "🪄", group: "adventure",
  },
  bunny: {
    name: "Bunny", primary: "from-pink-300 to-orange-300",
    secondary: "from-white to-pink-100", accent: "text-pink-400",
    background: "bg-gradient-to-br from-pink-50 via-white to-orange-50",
    gradient: "bg-gradient-to-r from-pink-300 to-orange-300",
    cardBg: "bg-white/90 backdrop-blur-md border-pink-100", emoji: "🐰", group: "general",
  },
  labubu_pink: {
    name: "Labubu Pink", primary: "from-rose-400 to-pink-500",
    secondary: "from-pink-300 to-rose-400", accent: "text-rose-500",
    background: "bg-gradient-to-br from-rose-50 via-pink-50 to-white",
    gradient: "bg-gradient-to-r from-rose-400 to-pink-500",
    cardBg: "bg-white/80 backdrop-blur-sm border-rose-100", emoji: "💖", 
    bgImage: "/assets/themes/labubu-pink.png", iconUrl: "/assets/themes/labubu-icon.png", 
    group: "general",
  },
  labubu_green: {
    name: "Labubu Green", primary: "from-emerald-400 to-green-600",
    secondary: "from-green-300 to-emerald-400", accent: "text-emerald-600",
    background: "bg-gradient-to-br from-emerald-50 via-green-50 to-white",
    gradient: "bg-gradient-to-r from-emerald-400 to-green-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-emerald-100", emoji: "🍇", 
    bgImage: "/assets/themes/labubu-green.png", iconUrl: "/assets/themes/labubu-icon.png", 
    group: "general",
  },
  labubu_brown: {
    name: "Labubu Toffee", primary: "from-amber-500 to-orange-700",
    secondary: "from-orange-400 to-amber-600", accent: "text-amber-700",
    background: "bg-gradient-to-br from-amber-50 via-orange-50 to-white",
    gradient: "bg-gradient-to-r from-amber-500 to-orange-700",
    cardBg: "bg-white/80 backdrop-blur-sm border-amber-100", emoji: "🍮", 
    bgImage: "/assets/themes/labubu-brown.png", iconUrl: "/assets/themes/labubu-icon.png", 
    group: "general",
  },
  labubu_blue: {
    name: "Labubu Blue", primary: "from-sky-400 to-blue-600",
    secondary: "from-blue-300 to-sky-400", accent: "text-blue-600",
    background: "bg-gradient-to-br from-sky-50 via-blue-50 to-white",
    gradient: "bg-gradient-to-r from-sky-400 to-blue-600",
    cardBg: "bg-white/80 backdrop-blur-sm border-sky-100", emoji: "🥥", 
    bgImage: "/assets/themes/labubu-blue.png", iconUrl: "/assets/themes/labubu-icon.png", 
    group: "general",
  },
};

// Maps themes to their default video category (themes without a matching category return null)
export const themeCategoryMap: Partial<Record<AppTheme, string>> = {
  quran_stories: "quran_stories",
  nasheed: "nasheed",
  ramadan: "ramadan",
  dua_prayer: "dua_prayer",
  farm: "farm",
  sports: "sports",
  cars: "cars",
  magic: "magic",
};

export const useTheme = () => {
  const { profile } = useAuth();
  const { childSession, isChildActive } = useChildSession();

  const currentTheme = useMemo(() => {
    if (isChildActive && childSession?.theme) {
      return themeConfigs[childSession.theme] || themeConfigs.rainbow;
    }
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
