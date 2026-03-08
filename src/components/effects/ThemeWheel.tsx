import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { AppTheme, themeConfigs } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { toast } from "sonner";
import ThemeTransitionEffect from "./ThemeTransitionEffect";

interface ThemeWheelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
}

const THEME_GROUPS = [
  {
    label: "✨ General",
    themes: ["rainbow", "princess", "ocean", "space", "jungle", "candy", "superhero", "dinosaur", "unicorn", "fairy", "robot"] as AppTheme[],
  },
  {
    label: "☪️ Islamic",
    themes: ["quran_stories", "nasheed", "ramadan", "dua_prayer"] as AppTheme[],
  },
  {
    label: "🏕️ Adventure",
    themes: ["pirate", "farm", "sports", "cars", "magic"] as AppTheme[],
  },
];

export const ThemeWheel = ({ isOpen, onClose, currentTheme }: ThemeWheelProps) => {
  const { user, refreshProfile } = useAuth();
  const { isChildActive, updateChildTheme, childSession } = useChildSession();
  const childName = childSession?.name;
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(currentTheme);
  const [isApplying, setIsApplying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleThemeSelect = async (theme: AppTheme) => {
    if (isApplying) return;

    setSelectedTheme(theme);
    setIsApplying(true);

    try {
      if (isChildActive) {
        // Update child session theme
        await updateChildTheme(theme);
      } else {
        // Update parent profile theme
        if (!user) return;
        const { error } = await supabase
          .from("profiles")
          .update({ selected_theme: theme })
          .eq("user_id", user.id);

        if (error) throw error;
        await refreshProfile();
      }

      setShowConfetti(true);

      toast.success(
        <span className="flex items-center gap-2">
          <span className="text-xl">{themeConfigs[theme].emoji}</span>
          <span>{themeConfigs[theme].name} theme activated!</span>
        </span>
      );
    } catch (error) {
      console.error("Error updating theme:", error);
      toast.error("Failed to change theme");
    } finally {
      setIsApplying(false);
    }
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative p-6 bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground mb-2">
                {isChildActive ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Changing theme for <span className="font-bold text-foreground">{childName}</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    Changing your theme
                  </>
                )}
              </div>
              <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                ✨ Pick Your Theme! ✨
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose a theme to transform your experience
              </p>
            </div>

            {/* Theme Groups */}
            <div className="space-y-5">
              {THEME_GROUPS.map((group) => (
                <div key={group.label}>
                  <h3 className="text-sm font-bold text-muted-foreground mb-3 px-1">
                    {group.label}
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {group.themes.map((theme) => {
                      const config = themeConfigs[theme];
                      const isSelected = selectedTheme === theme;
                      const isCurrent = currentTheme === theme;

                      return (
                        <motion.button
                          key={theme}
                          onClick={() => handleThemeSelect(theme)}
                          disabled={isApplying}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
                            isSelected
                              ? "ring-3 ring-yellow-400 ring-offset-2 shadow-lg"
                              : "hover:shadow-md"
                          } ${isCurrent ? "ring-2 ring-green-400 ring-offset-1" : ""}`}
                          style={{
                            background: `linear-gradient(135deg, ${getGradientColors(config.primary)})`,
                          }}
                        >
                          <span className="text-2xl">{config.emoji}</span>
                          <span className="text-[10px] font-medium text-white leading-tight text-center line-clamp-1">
                            {config.name}
                          </span>
                          {isCurrent && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center text-[8px]">
                              ✓
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Current selection */}
            <motion.div
              key={selectedTheme}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`mt-5 text-center p-3 rounded-2xl bg-gradient-to-r ${themeConfigs[selectedTheme].primary} text-white`}
            >
              <span className="text-2xl mr-2">{themeConfigs[selectedTheme].emoji}</span>
              <span className="font-display font-bold">
                {themeConfigs[selectedTheme].name}
              </span>
              {currentTheme === selectedTheme && (
                <span className="ml-2 text-xs bg-white/30 px-2 py-0.5 rounded-full">Current</span>
              )}
            </motion.div>

            {isApplying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-3xl"
              >
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
                  <p className="text-sm font-medium text-purple-600 mt-2">Applying...</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          <ThemeTransitionEffect
            isActive={showConfetti}
            onComplete={handleConfettiComplete}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function getGradientColors(gradientClass: string): string {
  const colorMap: Record<string, string> = {
    "pink-500": "#ec4899", "purple-500": "#a855f7", "blue-500": "#3b82f6",
    "pink-400": "#f472b6", "rose-500": "#f43f5e", "cyan-400": "#22d3ee",
    "blue-600": "#2563eb", "indigo-500": "#6366f1", "purple-600": "#9333ea",
    "green-400": "#4ade80", "emerald-600": "#059669", "orange-400": "#fb923c",
    "red-500": "#ef4444", "yellow-400": "#facc15", "amber-500": "#f59e0b",
    "green-600": "#16a34a", "amber-600": "#d97706", "stone-700": "#44403c",
    "fuchsia-400": "#e879f9", "sky-500": "#0ea5e9", "slate-600": "#475569",
    "violet-500": "#8b5cf6", "indigo-600": "#4f46e5", "emerald-500": "#10b981",
    "teal-600": "#0d9488", "violet-600": "#7c3aed", "amber-400": "#fbbf24",
    "yellow-500": "#eab308", "teal-400": "#2dd4bf", "cyan-600": "#0891b2",
    "green-500": "#22c55e", "lime-600": "#65a30d", "blue-500b": "#3b82f6",
    "orange-500": "#f97316",
  };

  const matches = gradientClass.match(/(?:from|via|to)-(\w+-\d+)/g) || [];
  const colors = matches.map((match) => {
    const colorName = match.replace(/^(from|via|to)-/, "");
    return colorMap[colorName] || "#a855f7";
  });

  return colors.length >= 2 ? `${colors[0]}, ${colors[colors.length - 1]}` : "#a855f7, #ec4899";
}

export default ThemeWheel;
