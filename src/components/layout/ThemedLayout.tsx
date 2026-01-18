import { ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";
import InteractiveFloatingElements from "@/components/effects/InteractiveFloatingElements";
import { Sparkles, Star, Heart, Zap } from "lucide-react";

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
      
      <main className="relative z-10">
        {children}
      </main>

      {showFooter && (
        <footer className={`${theme.cardBg} border-t py-8 mt-12 relative z-10 theme-transition`}>
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
    </div>
  );
};

export default ThemedLayout;
