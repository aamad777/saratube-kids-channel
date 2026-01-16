import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { AppTheme, themeConfigs } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ThemeWheelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: AppTheme;
}

const themeOrder: AppTheme[] = [
  "rainbow",
  "princess",
  "ocean",
  "space",
  "jungle",
  "candy",
  "superhero",
  "dinosaur",
];

export const ThemeWheel = ({ isOpen, onClose, currentTheme }: ThemeWheelProps) => {
  const { user, refreshProfile } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(currentTheme);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const handleThemeSelect = async (theme: AppTheme) => {
    if (!user || isSpinning) return;

    setSelectedTheme(theme);
    
    // Calculate rotation to spin to selected theme
    const themeIndex = themeOrder.indexOf(theme);
    const anglePerTheme = 360 / themeOrder.length;
    const targetRotation = -(themeIndex * anglePerTheme) + 720; // Add 2 full spins
    
    setIsSpinning(true);
    setRotation(prev => prev + targetRotation);

    // Wait for spin animation
    setTimeout(async () => {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ selected_theme: theme })
          .eq("user_id", user.id);

        if (error) throw error;

        await refreshProfile();
        toast.success(
          <span className="flex items-center gap-2">
            <span className="text-xl">{themeConfigs[theme].emoji}</span>
            <span>{themeConfigs[theme].name} theme activated!</span>
          </span>
        );
        setIsSpinning(false);
        onClose();
      } catch (error) {
        console.error("Error updating theme:", error);
        toast.error("Failed to change theme");
        setIsSpinning(false);
      }
    }, 1500);
  };

  const handleRandomSpin = () => {
    if (isSpinning) return;
    const randomTheme = themeOrder[Math.floor(Math.random() * themeOrder.length)];
    handleThemeSelect(randomTheme);
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
            initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative p-8 bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                ✨ Pick Your Theme! ✨
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Tap a theme or spin the wheel!
              </p>
            </div>

            {/* Theme Wheel */}
            <div className="relative w-64 h-64 mx-auto mb-6">
              {/* Outer ring decoration */}
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-purple-200 animate-spin" style={{ animationDuration: "20s" }} />
              
              {/* Wheel container */}
              <motion.div
                ref={wheelRef}
                className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 shadow-inner"
                animate={{ rotate: rotation }}
                transition={{ 
                  type: "spring", 
                  damping: 30, 
                  stiffness: 50,
                  duration: 1.5 
                }}
              >
                {themeOrder.map((theme, index) => {
                  const angle = (index * 360) / themeOrder.length;
                  const config = themeConfigs[theme];
                  const isSelected = selectedTheme === theme;
                  const isCurrent = currentTheme === theme;

                  return (
                    <motion.button
                      key={theme}
                      onClick={() => handleThemeSelect(theme)}
                      disabled={isSpinning}
                      className={`absolute w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300 ${
                        isSelected ? "ring-4 ring-yellow-400 ring-offset-2 scale-110" : ""
                      } ${isCurrent ? "ring-2 ring-green-400" : ""}`}
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: `rotate(${angle}deg) translateY(-80px) rotate(-${angle}deg) translate(-50%, -50%)`,
                        background: `linear-gradient(135deg, ${getGradientColors(config.primary)})`,
                      }}
                      whileHover={{ scale: isSpinning ? 1 : 1.2 }}
                      whileTap={{ scale: isSpinning ? 1 : 0.95 }}
                    >
                      <span className={isSpinning ? "animate-bounce" : ""}>
                        {config.emoji}
                      </span>
                    </motion.button>
                  );
                })}

                {/* Center button */}
                <motion.button
                  onClick={handleRandomSpin}
                  disabled={isSpinning}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex items-center justify-center"
                  whileHover={{ scale: isSpinning ? 1 : 1.1 }}
                  whileTap={{ scale: isSpinning ? 1 : 0.95 }}
                >
                  <Sparkles className={`w-8 h-8 text-white ${isSpinning ? "animate-spin" : ""}`} />
                </motion.button>
              </motion.div>

              {/* Selection indicator */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-yellow-500 drop-shadow-lg" />
              </div>
            </div>

            {/* Current selection display */}
            <motion.div
              key={selectedTheme}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-center p-4 rounded-2xl bg-gradient-to-r ${themeConfigs[selectedTheme].primary} text-white`}
            >
              <span className="text-3xl mr-2">{themeConfigs[selectedTheme].emoji}</span>
              <span className="font-display font-bold text-lg">
                {themeConfigs[selectedTheme].name}
              </span>
              {currentTheme === selectedTheme && (
                <span className="ml-2 text-xs bg-white/30 px-2 py-1 rounded-full">
                  Current
                </span>
              )}
            </motion.div>

            {/* Spinning indicator */}
            {isSpinning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-3xl"
              >
                <div className="text-center">
                  <div className="text-4xl animate-bounce">🎡</div>
                  <p className="text-sm font-medium text-purple-600 mt-2">
                    Spinning...
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper function to extract colors from Tailwind gradient classes
function getGradientColors(gradientClass: string): string {
  const colorMap: Record<string, string> = {
    "pink-500": "#ec4899",
    "purple-500": "#a855f7",
    "blue-500": "#3b82f6",
    "pink-400": "#f472b6",
    "rose-500": "#f43f5e",
    "cyan-400": "#22d3ee",
    "blue-600": "#2563eb",
    "indigo-500": "#6366f1",
    "purple-600": "#9333ea",
    "green-400": "#4ade80",
    "emerald-600": "#059669",
    "orange-400": "#fb923c",
    "red-500": "#ef4444",
    "yellow-400": "#facc15",
    "amber-500": "#f59e0b",
    "green-600": "#16a34a",
  };

  // Extract color names from class
  const matches = gradientClass.match(/(?:from|via|to)-(\w+-\d+)/g) || [];
  const colors = matches.map((match) => {
    const colorName = match.replace(/^(from|via|to)-/, "");
    return colorMap[colorName] || "#a855f7";
  });

  return colors.length >= 2 ? `${colors[0]}, ${colors[colors.length - 1]}` : "#a855f7, #ec4899";
}

export default ThemeWheel;
