import { Home, Search, Upload, Users, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import SearchDialog from "@/components/search/SearchDialog";

const tapAnimation = {
  whileTap: { scale: 0.82, y: 2 },
  transition: { type: "spring" as const, stiffness: 500, damping: 15, mass: 0.6 },
};

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [showSearch, setShowSearch] = useState(false);

  const handleSearchOpen = useCallback(() => {
    setShowSearch(true);
  }, []);

  if (!user) return null;

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Search", path: "#search", onClick: handleSearchOpen },
    { icon: Upload, label: "Upload", path: "/upload" },
    { icon: Users, label: "Kids", path: "/kids" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <>
      <SearchDialog open={showSearch} onOpenChange={setShowSearch} />
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] sm:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(({ icon: Icon, label, path, onClick }) => {
            const isActive = path !== "#search" && location.pathname === path;

            const content = (
              <>
                <motion.div
                  className={cn(
                    "relative p-1.5 rounded-xl transition-colors",
                    isActive && `bg-gradient-to-r ${theme.primary} text-white`
                  )}
                  layout
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
                <span className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary font-bold" : ""
                )}>{label}</span>
              </>
            );

            if (onClick) {
              return (
                <motion.button
                  key={label}
                  onClick={onClick}
                  className="flex flex-col items-center justify-center gap-0.5 w-14 py-1 text-muted-foreground"
                  {...tapAnimation}
                >
                  {content}
                </motion.button>
              );
            }

            return (
              <motion.div key={label} {...tapAnimation}>
                <Link
                  to={path}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 w-14 py-1 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {content}
                </Link>
              </motion.div>
            );
          })}
        </div>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
};

export default MobileBottomNav;
