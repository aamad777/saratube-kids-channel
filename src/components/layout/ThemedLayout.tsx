import { ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { useTimeLimitChecker } from "@/hooks/useTimeLimitChecker";
import Header from "./Header";
import MobileBottomNav from "./MobileBottomNav";
import InteractiveFloatingElements from "@/components/effects/InteractiveFloatingElements";
import ScreenLockOverlay from "@/components/effects/ScreenLockOverlay";
import TimeRemainingBanner from "@/components/effects/TimeRemainingBanner";
import { Sparkles, Star, Heart, Zap, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ThemedLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

const FloatingElements = ({ themeName }: { themeName: string }) => {
  const getElements = () => {
    switch (themeName) {
      case "princess":
        return (
          <>
            <Heart className="absolute top-20 left-10 w-6 h-6 text-rose-300 animate-float opacity-60" />
            <Heart className="absolute top-40 right-20 w-4 h-4 text-pink-300 animate-bounce-slow opacity-50" />
            <Star className="absolute bottom-40 left-20 w-5 h-5 text-purple-300 animate-sparkle opacity-60" />
          </>
        );
      case "ocean":
        return (
          <>
            <div className="absolute top-20 left-10 w-6 h-6 text-cyan-300 animate-float opacity-60">🐠</div>
            <div className="absolute top-40 right-20 w-4 h-4 text-blue-300 animate-bounce-slow opacity-50">🐚</div>
            <div className="absolute bottom-40 left-20 w-5 h-5 text-teal-300 animate-sparkle opacity-60">🌊</div>
          </>
        );
      case "space":
        return (
          <>
            <Star className="absolute top-20 left-10 w-6 h-6 text-indigo-300 animate-float opacity-60" />
            <div className="absolute top-40 right-20 w-4 h-4 animate-bounce-slow opacity-50">🚀</div>
            <Star className="absolute bottom-40 left-20 w-5 h-5 text-purple-300 animate-sparkle opacity-60" />
          </>
        );
      case "jungle":
        return (
          <>
            <div className="absolute top-20 left-10 w-6 h-6 animate-float opacity-60">🌿</div>
            <div className="absolute top-40 right-20 w-4 h-4 animate-bounce-slow opacity-50">🦋</div>
            <div className="absolute bottom-40 left-20 w-5 h-5 animate-sparkle opacity-60">🌴</div>
          </>
        );
      case "candy":
        return (
          <>
            <div className="absolute top-20 left-10 w-6 h-6 animate-float opacity-60">🍭</div>
            <div className="absolute top-40 right-20 w-4 h-4 animate-bounce-slow opacity-50">🍬</div>
            <div className="absolute bottom-40 left-20 w-5 h-5 animate-sparkle opacity-60">🧁</div>
          </>
        );
      case "superhero":
        return (
          <>
            <Zap className="absolute top-20 left-10 w-6 h-6 text-yellow-400 animate-float opacity-60" />
            <div className="absolute top-40 right-20 w-4 h-4 animate-bounce-slow opacity-50">💥</div>
            <Star className="absolute bottom-40 left-20 w-5 h-5 text-red-400 animate-sparkle opacity-60" />
          </>
        );
      case "dinosaur":
        return (
          <>
            <div className="absolute top-20 left-10 w-6 h-6 animate-float opacity-60">🦖</div>
            <div className="absolute top-40 right-20 w-4 h-4 animate-bounce-slow opacity-50">🦕</div>
            <div className="absolute bottom-40 left-20 w-5 h-5 animate-sparkle opacity-60">🌋</div>
          </>
        );
      case "bunny":
        return (
          <>
            <div className="absolute top-20 left-10 w-6 h-6 animate-float opacity-60 text-2xl">🐰</div>
            <div className="absolute top-40 right-20 w-4 h-4 animate-bounce-slow opacity-50 text-xl">🥕</div>
            <div className="absolute bottom-40 left-20 w-5 h-5 animate-sparkle opacity-60 text-xl">🌸</div>
            <div className="absolute bottom-20 right-10 w-4 h-4 animate-float opacity-40 text-lg">🥕</div>
          </>
        );
      default: // rainbow
        return (
          <>
            <Sparkles className="absolute top-20 left-10 w-6 h-6 text-pink-300 animate-float opacity-60" />
            <Star className="absolute top-40 right-20 w-4 h-4 text-yellow-300 animate-bounce-slow opacity-50" />
            <Heart className="absolute bottom-40 left-20 w-5 h-5 text-purple-300 animate-sparkle opacity-60" />
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {getElements()}
    </div>
  );
};

const ThemedLayout = ({ children, showHeader = true, showFooter = true }: ThemedLayoutProps) => {
  const { theme, themeName, isChildActive, childName } = useTheme();
  const { profile } = useAuth();
  const { childSession, clearChildSession } = useChildSession();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const timeLimits = useTimeLimitChecker();

  const handleExit = async () => {
    clearChildSession();
    if (profile && !profile.is_parent) {
      await signOut();
      navigate("/kid-login");
    } else {
      navigate("/kids");
    }
  };

  // Get personalized app name based on active child or parent's display name
  const getAppName = () => {
    if (isChildActive && childName) {
      const firstName = childName.split(" ")[0].toUpperCase();
      return `${firstName}TUBE`;
    }
    if (profile?.display_name) {
      const firstName = profile.display_name.split(" ")[0].toUpperCase();
      return `${firstName}TUBE`;
    }
    return "KIDSTUBE";
  };

  return (
    <div key={themeName} className={`min-h-screen ${theme.background} theme-transition`}>
      <FloatingElements themeName={themeName} />
      <InteractiveFloatingElements themeName={themeName} />
      
      {showHeader && <Header />}

      {/* Time remaining banner for active child sessions */}
      {isChildActive && timeLimits.isEnabled && !timeLimits.isLocked && (
        <TimeRemainingBanner
          remainingMinutes={timeLimits.remainingMinutes}
          dailyLimitMinutes={timeLimits.dailyLimitMinutes}
          usedMinutes={timeLimits.usedMinutes}
        />
      )}
      
      <main className="relative z-10 pb-16 sm:pb-0">
        {children}
      </main>

      {showFooter && (
        <footer className={`${theme.cardBg} border-t py-8 mt-12 pb-20 sm:pb-8 relative z-10 theme-transition`}>
          <div className="container px-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">{theme.emoji}</span>
              <span className={`font-display text-xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent transition-all duration-300`}>
                {getAppName()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Made with 💖 for kids everywhere!
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              A safe and fun place to watch and create videos
            </p>
          </div>
        </footer>
      )}

      <MobileBottomNav />

      {/* Screen Lock Overlay - blocks everything when time is up */}
      <ScreenLockOverlay
        isLocked={timeLimits.isLocked}
        lockReason={timeLimits.lockReason}
        dailyLimitMinutes={timeLimits.dailyLimitMinutes}
        usedMinutes={timeLimits.usedMinutes}
        bedtimeEnd={timeLimits.bedtimeEnd}
        childName={childSession?.name || "Kiddo"}
        onExtend={timeLimits.grantExtension}
      />

      {/* Persistent Exit Button for Child Mode */}
      {isChildActive && (
        <motion.div 
          className="fixed bottom-20 sm:bottom-6 left-6 z-[60]"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={handleExit}
            className={`h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br ${theme.primary} border-4 border-white text-white group relative overflow-hidden`}
            title="Exit Kid Mode"
          >
            <LogOut className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
            <span className="absolute -bottom-1 text-[8px] font-bold uppercase transition-opacity opacity-0 group-hover:opacity-100">Exit</span>
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ThemedLayout;
