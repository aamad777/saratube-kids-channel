import { Search, Upload, Bell, Sparkles, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, signOut, loading } = useAuth();

  const getInitial = () => {
    if (!user) return "?";
    const email = user.email || "";
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-lg border-b border-border shadow-soft">
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Sparkles className="h-8 w-8 text-sara-pink animate-sparkle" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-sara-yellow rounded-full animate-bounce-slow" />
          </div>
          <span className="font-display text-2xl font-bold text-gradient hidden sm:inline">
            SARATUBE
          </span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Search fun videos..."
              className="pl-10 pr-4 h-11 rounded-full bg-muted border-2 border-transparent focus:border-primary focus:bg-card transition-all"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to="/upload">
                <Button variant="hero" size="lg" className="gap-2 hidden sm:flex">
                  <Upload className="h-5 w-5" />
                  Upload
                </Button>
                <Button variant="hero" size="icon" className="sm:hidden">
                  <Upload className="h-5 w-5" />
                </Button>
              </Link>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-sara-coral text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-9 h-9 rounded-full bg-gradient-button flex items-center justify-center text-primary-foreground font-display font-bold shadow-button hover:scale-110 transition-transform">
                    {getInitial()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="gap-2">
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
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
                <Button variant="hero" size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Join Free!</span>
                  <span className="sm:hidden">Join</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
