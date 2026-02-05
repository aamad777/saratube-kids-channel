import { Play, Upload, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTheme, AppTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";

// Theme-based background images
import heroBgRainbow from "@/assets/hero-bg-rainbow.png";
import heroBgPrincess from "@/assets/hero-bg-princess.png";
import heroBgOcean from "@/assets/hero-bg-ocean.png";
import heroBgSpace from "@/assets/hero-bg-space.png";
import heroBgJungle from "@/assets/hero-bg-jungle.png";
import heroBgCandy from "@/assets/hero-bg-candy.png";
import heroBgSuperhero from "@/assets/hero-bg-superhero.png";
import heroBgDinosaur from "@/assets/hero-bg-dinosaur.png";
import heroBgUnicorn from "@/assets/hero-bg-unicorn.png";
import heroBgPirate from "@/assets/hero-bg-pirate.png";
import heroBgFairy from "@/assets/hero-bg-fairy.png";
import heroBgRobot from "@/assets/hero-bg-robot.png";

const themeBackgrounds: Record<AppTheme, string> = {
  rainbow: heroBgRainbow,
  princess: heroBgPrincess,
  ocean: heroBgOcean,
  space: heroBgSpace,
  jungle: heroBgJungle,
  candy: heroBgCandy,
  superhero: heroBgSuperhero,
  dinosaur: heroBgDinosaur,
  unicorn: heroBgUnicorn,
  pirate: heroBgPirate,
  fairy: heroBgFairy,
  robot: heroBgRobot,
};

const HeroSection = () => {
  const { theme, themeName } = useTheme();
  const { profile } = useAuth();

  // Get personalized app name based on child's display name
  const getAppName = () => {
    if (profile?.display_name) {
      const firstName = profile.display_name.split(" ")[0].toUpperCase();
      return `${firstName}TUBE`;
    }
    return "SARATUBE";
  };

  const currentBackground = themeBackgrounds[themeName as AppTheme] || heroBgRainbow;

  return (
    <section className="relative overflow-hidden min-h-[600px]">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={currentBackground}
          alt="SARATUBE Background"
          className="w-full h-full object-cover transition-all duration-700 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30" />
      </div>

      {/* Floating decorations */}
      <div className="absolute top-20 left-10 animate-float opacity-80">
        <Star className={`h-8 w-8 ${theme.accent} fill-current drop-shadow-lg`} />
      </div>
      <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: "1s" }}>
        <span className="text-5xl drop-shadow-xl">{theme.emoji}</span>
      </div>
      <div className="absolute bottom-20 left-1/4 animate-float" style={{ animationDelay: "0.5s" }}>
        <Sparkles className={`h-8 w-8 ${theme.accent} drop-shadow-lg`} />
      </div>
      <div className="absolute top-1/3 right-1/4 animate-float" style={{ animationDelay: "1.5s" }}>
        <Star className={`h-6 w-6 ${theme.accent} fill-current opacity-60`} />
      </div>
      <div className="absolute bottom-40 right-10 animate-float" style={{ animationDelay: "2s" }}>
        <span className="text-3xl opacity-70">{theme.emoji}</span>
      </div>

      {/* Content */}
      <div className="relative z-10 container px-4 py-20 md:py-28 flex flex-col items-center text-center">
        <div className="animate-bounce-slow mb-4">
          <span className="text-6xl drop-shadow-2xl">{theme.emoji}</span>
        </div>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
          <span className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent transition-all duration-300 drop-shadow-sm`}>Welcome to</span>
          <br />
          <span className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent transition-all duration-300 drop-shadow-sm`}>
            {getAppName()}! {theme.emoji}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mb-10 leading-relaxed">
          The most fun place for kids to watch, create, and share amazing videos!
          Learn, play, and make new friends! {theme.emoji}
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-4">
          <Button className={`gap-2 bg-gradient-to-r ${theme.primary} text-white hover:opacity-90 hover:scale-105 text-lg px-8 py-6 shadow-xl transition-all duration-300`} asChild>
            <Link to="/explore">
              <Play className="h-6 w-6 fill-current" />
              Start Watching
            </Link>
          </Button>
          <Button className={`gap-2 bg-gradient-to-r ${theme.secondary} text-white hover:opacity-90 hover:scale-105 text-lg px-8 py-6 shadow-xl transition-all duration-300`} asChild>
            <Link to="/upload">
              <Upload className="h-6 w-6" />
              Upload Video
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mt-12">
          {[
            { label: "Videos", value: "10K+", icon: "🎬" },
            { label: "Creators", value: "500+", icon: "⭐" },
            { label: "Happy Kids", value: "50K+", icon: "😊" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center p-5 bg-background/80 backdrop-blur-sm rounded-2xl shadow-xl border border-border/30 min-w-[130px] hover:scale-105 transition-transform duration-300`}
            >
              <span className="text-2xl mb-1">{stat.icon}</span>
              <span className={`font-display text-2xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent drop-shadow-sm`}>
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
