import { Search, Upload, Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const Header = () => {
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

          <div className="w-9 h-9 rounded-full bg-gradient-button flex items-center justify-center text-primary-foreground font-display font-bold shadow-button">
            S
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
