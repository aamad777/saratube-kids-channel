import { useState, useCallback } from "react";
import { Search, Upload, Bell, LogOut, User, Shield, Palette, Users, UserCircle, Sparkles, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { useTheme, AppTheme, themeConfigs } from "@/hooks/useTheme";
import { ThemeWheel } from "@/components/effects/ThemeWheel";
 import SearchDialog from "@/components/search/SearchDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
const Header = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const { childSession, clearChildSession, isChildActive, updateChildTheme } = useChildSession();
  const { theme, themeName, childName } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [showThemeWheel, setShowThemeWheel] = useState(false);
   const [showSearch, setShowSearch] = useState(false);
 
   const handleSearchOpen = useCallback(() => {
     setShowSearch(true);
   }, []);

  const handleChildThemeChange = async (newTheme: AppTheme) => {
    await updateChildTheme(newTheme);
  };
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

  const handleSwitchProfile = async () => {
    clearChildSession();
    if (profile && !profile.is_parent) {
      await signOut();
      navigate("/kid-login");
    } else {
      navigate("/kids");
    }
  };

  return (
    <>
       <SearchDialog open={showSearch} onOpenChange={setShowSearch} />
      <ThemeWheel
        isOpen={showThemeWheel}
        onClose={() => setShowThemeWheel(false)}
        currentTheme={themeName}
      />
       <header className={`sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg`}>
        <div className="container flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <div className="relative">
              {theme.iconUrl ? (
                <img src={theme.iconUrl} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain animate-sparkle" />
              ) : (
                <span className="text-2xl sm:text-3xl animate-sparkle">{theme.emoji}</span>
              )}
              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r ${theme.primary} rounded-full animate-bounce-slow`} />
            </div>
            <span className={`font-display text-2xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent hidden sm:inline transition-all duration-300`}>
              {getAppName()}
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl min-w-0">
             <button
               onClick={handleSearchOpen}
               className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-9 sm:h-11 rounded-full bg-muted/50 border-2 border-transparent hover:border-primary/50 hover:bg-muted transition-all group`}
             >
               <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
               <span className="text-muted-foreground flex-1 text-start text-sm sm:text-base truncate">{t("search.placeholder")}</span>
               <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-muted-foreground bg-background rounded border">
                 <span className="text-xs">⌘</span>K
               </kbd>
             </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              className="relative rounded-full hover:bg-muted transition-all h-8 w-8 sm:h-9 sm:w-9"
              title={language === "en" ? "العربية" : "English"}
            >
              <span className="font-bold text-xs sm:text-sm">{language === "en" ? "ع" : "EN"}</span>
            </Button>

          {user && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowThemeWheel(true)}
                className={`relative group rounded-full bg-gradient-to-r ${theme.primary} text-white hover:opacity-90 hover:scale-110 transition-all h-8 w-8 sm:h-9 sm:w-9`}
              >
                <Palette className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="absolute -bottom-1 -right-1 text-xs sm:text-sm">{theme.emoji}</span>
              </Button>
            )}
          {user ? (
            <>
              {/* Kids Zone Button - hidden on mobile, in dropdown instead */}
              <Link to="/kids" className="hidden sm:block">
                <Button className={`gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90`} size="lg">
                  <Users className="h-5 w-5" />
                   {t("kids.zone")}
                 </Button>
               </Link>

              <Link to="/upload" className="hidden sm:block">
                <Button className={`gap-2 bg-gradient-to-r ${theme.primary} text-white hover:opacity-90`} size="lg">
                  <Upload className="h-5 w-5" />
                  {t("upload")}
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gradient-to-r ${theme.primary} text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-bold`}>
                      3
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <div className="px-3 py-2 font-display font-bold text-sm text-foreground">
                    {t("notifications")}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                    <span className="font-medium text-sm">{t("welcome.notification")}</span>
                    <span className="text-xs text-muted-foreground">{t("welcome.notification.desc")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                    <span className="font-medium text-sm">{t("themes.notification")}</span>
                    <span className="text-xs text-muted-foreground">{t("themes.notification.desc")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                    <span className="font-medium text-sm">{t("screentime.notification")}</span>
                    <span className="text-xs text-muted-foreground">{t("screentime.notification.desc")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-xs text-muted-foreground">
                    {t("no.more.notifications")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-r ${theme.primary} flex items-center justify-center text-white font-display font-bold text-sm sm:text-base shadow-button hover:scale-110 transition-transform`}>
                    {getInitial()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {/* Mobile-only nav links */}
                  <div className="sm:hidden">
                     <Link to="/kids">
                      <DropdownMenuItem className="gap-2">
                        <Users className="w-4 h-4" />
                        <span>{t("kids.zone")}</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/upload">
                      <DropdownMenuItem className="gap-2">
                        <Upload className="w-4 h-4" />
                        <span>{t("upload")}</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                  </div>
                {isChildActive && (
                    <>
                      <DropdownMenuItem className="gap-2 font-semibold">
                        <span className="text-lg">{theme.emoji}</span>
                        <span>{childName}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2">
                          <Palette className="w-4 h-4" />
                          <span>{t("change.theme")}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="max-h-64 overflow-y-auto">
                            {(Object.keys(themeConfigs) as AppTheme[]).map((themeKey) => (
                              <DropdownMenuItem
                                key={themeKey}
                                onClick={() => handleChildThemeChange(themeKey)}
                                className={`gap-2 ${themeName === themeKey ? 'bg-accent' : ''}`}
                              >
                                {themeConfigs[themeKey].iconUrl ? (
                                  <img src={themeConfigs[themeKey].iconUrl} alt={themeKey} className="w-6 h-6 object-contain" />
                                ) : (
                                  <span className="text-lg">{themeConfigs[themeKey].emoji}</span>
                                )}
                                <span>{themeConfigs[themeKey].name}</span>
                                {themeName === themeKey && (
                                  <span className="ml-auto text-xs">✓</span>
                                )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuItem onClick={handleSwitchProfile} className="gap-2">
                        <UserCircle className="w-4 h-4" />
                        <span>{t("switch.profile")}</span>
                      </DropdownMenuItem>
                      {(isChildActive || (profile && !profile.is_parent)) && (
                        <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive">
                          <LogOut className="w-4 h-4 text-destructive" />
                          <span>{t("sign.out")}</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {!isChildActive && (
                    <>
                      <Link to="/profile">
                        <DropdownMenuItem className="gap-2">
                          <User className="w-4 h-4" />
                          <span>{t("my.profile")}</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/parent">
                        <DropdownMenuItem className="gap-2">
                          <Shield className="w-4 h-4" />
                          <span>{t("parent.dashboard")}</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={signOut}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t("sign.out")}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/kid-login">
                <Button variant="ghost" size="lg" className="hidden sm:flex gap-2 text-primary font-bold hover:bg-primary/5">
                  <span className="text-xl">🧸</span>
                  Kid Mode
                </Button>
              </Link>
              <Link to="/signin">
                <Button variant="outline" size="lg" className="hidden sm:flex">
                  {t("sign.in")}
                </Button>
              </Link>
              <Link to="/signup">
                <Button className={`gap-2 bg-gradient-to-r ${theme.primary} text-white hover:opacity-90`} size="lg">
                  <span>{theme.emoji}</span>
                  <span className="hidden sm:inline">{t("join.free")}</span>
                  <span className="sm:hidden">{t("join")}</span>
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
