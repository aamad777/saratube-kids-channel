import { useState } from "react";
import { Search, Upload, Bell, LogOut, User, Shield, Palette, Users, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { useTheme, AppTheme } from "@/hooks/useTheme";
import { ThemeWheel } from "@/components/effects/ThemeWheel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const { childSession, clearChildSession, isChildActive } = useChildSession();
  const { theme, themeName, childName } = useTheme();
  const [showThemeWheel, setShowThemeWheel] = useState(false);

  const getInitial = () => {
    if (isChildActive && childName) {
      return childName.charAt(0).toUpperCase();
    }
    if (!user) return "?";
    const email = user.email || "";
    return email.charAt(0).toUpperCase();
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

  const handleSwitchProfile = () => {
    clearChildSession();
    navigate("/kids");
  };

  return (
    <>
      <ThemeWheel
        isOpen={showThemeWheel}
        onClose={() => setShowThemeWheel(false)}
        currentTheme={themeName}
      />
      <header className={`sticky top-0 z-50 w-full ${theme.cardBg} backdrop-blur-lg border-b shadow-soft`}>
        <div className="container flex h-16 items-center justify-between gap-4 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <span className="text-3xl animate-sparkle">{theme.emoji}</span>
              <div className={`absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r ${theme.primary} rounded-full animate-bounce-slow`} />
            </div>
            <span className={`font-display text-2xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent hidden sm:inline transition-all duration-300`}>
              {getAppName()}
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Search fun videos..."
                className="pl-10 pr-4 h-11 rounded-full bg-muted/50 border-2 border-transparent focus:border-primary focus:bg-card transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowThemeWheel(true)}
                className={`relative group rounded-full bg-gradient-to-r ${theme.primary} text-white hover:opacity-90 hover:scale-110 transition-all`}
              >
                <Palette className="h-5 w-5" />
                <span className="absolute -bottom-1 -right-1 text-sm">{theme.emoji}</span>
              </Button>
            )}
          {user ? (
            <>
              {/* Kids Zone Button */}
              <Link to="/kids">
                <Button className={`gap-2 hidden sm:flex bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90`} size="lg">
                  <Users className="h-5 w-5" />
                  Kids Zone
                </Button>
                <Button className={`sm:hidden bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90`} size="icon">
                  <Users className="h-5 w-5" />
                </Button>
              </Link>

              <Link to="/upload">
                <Button className={`gap-2 hidden sm:flex bg-gradient-to-r ${theme.primary} text-white hover:opacity-90`} size="lg">
                  <Upload className="h-5 w-5" />
                  Upload
                </Button>
                <Button className={`sm:hidden bg-gradient-to-r ${theme.primary} text-white hover:opacity-90`} size="icon">
                  <Upload className="h-5 w-5" />
                </Button>
              </Link>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className={`absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r ${theme.primary} text-white text-xs rounded-full flex items-center justify-center font-bold`}>
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`w-9 h-9 rounded-full bg-gradient-to-r ${theme.primary} flex items-center justify-center text-white font-display font-bold shadow-button hover:scale-110 transition-transform`}>
                    {getInitial()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isChildActive && (
                    <>
                      <DropdownMenuItem className="gap-2 font-semibold">
                        <span className="text-lg">{theme.emoji}</span>
                        <span>{childName}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSwitchProfile} className="gap-2">
                        <UserCircle className="w-4 h-4" />
                        <span>Switch Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {!isChildActive && (
                    <>
                      <Link to="/profile">
                        <DropdownMenuItem className="gap-2">
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/parent">
                        <DropdownMenuItem className="gap-2">
                          <Shield className="w-4 h-4" />
                          <span>Parent Dashboard</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={signOut}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="outline" size="lg" className="hidden sm:flex">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className={`gap-2 bg-gradient-to-r ${theme.primary} text-white hover:opacity-90`} size="lg">
                  <span>{theme.emoji}</span>
                  <span className="hidden sm:inline">Join Free!</span>
                  <span className="sm:hidden">Join</span>
                </Button>
              </Link>
            </>
          )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
