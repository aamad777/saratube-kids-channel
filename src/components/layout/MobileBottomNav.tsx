import { Home, Search, Upload, Users, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import SearchDialog from "@/components/search/SearchDialog";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { theme } = useTheme();
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

            if (onClick) {
              return (
                <button
                  key={label}
                  onClick={onClick}
                  className="flex flex-col items-center justify-center gap-0.5 w-14 py-1 text-muted-foreground transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              );
            }

            return (
              <Link
                key={label}
                to={path}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-14 py-1 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "relative p-1 rounded-xl transition-all",
                  isActive && `bg-gradient-to-r ${theme.primary} text-white`
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  isActive && "text-primary font-bold"
                )}>{label}</span>
              </Link>
            );
          })}
        </div>
        {/* Safe area spacer for iOS */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </>
  );
};

export default MobileBottomNav;
