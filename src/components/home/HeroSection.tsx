import { Play, Upload, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTheme, AppTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

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
    <section className="relative overflow-hidden min-h-[650px]">
      {/* Background */}
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1.05, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          key={currentBackground}
          src={currentBackground}
          alt="SARATUBE Background"
          className="w-full h-full object-cover"
        />
        {/* Magical gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(var(--background)/0.4)_100%)]" />
        
        {/* Animated shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>

      {/* Fun floating decorations */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ y: 0, rotate: 0 }}
          animate={{ 
            y: [0, -20, 0], 
            rotate: [0, i % 2 === 0 ? 10 : -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3 + i * 0.5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: i * 0.3 
          }}
          style={{
            top: `${15 + (i * 10) % 60}%`,
            left: i % 2 === 0 ? `${5 + i * 3}%` : undefined,
            right: i % 2 === 1 ? `${5 + i * 3}%` : undefined,
          }}
        >
          {i % 3 === 0 ? (
            <Star className={`h-${6 + (i % 4) * 2} w-${6 + (i % 4) * 2} ${theme.accent} fill-current drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`} style={{ width: 24 + i * 4, height: 24 + i * 4 }} />
          ) : i % 3 === 1 ? (
            <span className="drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" style={{ fontSize: 32 + i * 4 }}>{theme.emoji}</span>
          ) : (
            <Sparkles className={`${theme.accent} drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`} style={{ width: 20 + i * 3, height: 20 + i * 3 }} />
          )}
        </motion.div>
      ))}

      {/* Bubble particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm"
            initial={{ y: "100vh", x: `${Math.random() * 100}%`, opacity: 0 }}
            animate={{ 
              y: "-10vh", 
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.8]
            }}
            transition={{ 
              duration: 8 + Math.random() * 4, 
              repeat: Infinity, 
              delay: i * 0.8,
              ease: "linear"
            }}
            style={{
              width: 10 + Math.random() * 30,
              height: 10 + Math.random() * 30,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container px-4 py-20 md:py-28 flex flex-col items-center text-center">
        <motion.div 
          className="mb-6"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-7xl md:text-8xl drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] filter">{theme.emoji}</span>
        </motion.div>

        <motion.h1 
          className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent drop-shadow-sm`}>Welcome to</span>
          <br />
          <motion.span 
            className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent inline-block`}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {getAppName()}! {theme.emoji}
          </motion.span>
        </motion.h1>

        <motion.p 
          className="text-lg md:text-xl text-foreground/90 max-w-2xl mb-10 leading-relaxed font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          The most fun place for kids to watch, create, and share amazing videos!
          Learn, play, and make new friends! {theme.emoji}
        </motion.p>

        <motion.div 
          className="flex flex-wrap gap-4 justify-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button
            className={`gap-2 bg-gradient-to-r ${theme.primary} text-white hover:opacity-90 hover:scale-110 text-lg px-8 py-6 shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 rounded-full`}
            onClick={() => document.getElementById("videos")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Play className="h-6 w-6 fill-current" />
            Start Watching
          </Button>
          <Button className={`gap-2 bg-gradient-to-r ${theme.secondary} text-white hover:opacity-90 hover:scale-110 text-lg px-8 py-6 shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 rounded-full`} asChild>
            <Link to="/upload">
              <Upload className="h-6 w-6" />
              Upload Video
            </Link>
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="flex flex-wrap justify-center gap-6 md:gap-8 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {[
            { label: "Videos", value: "10K+", icon: "🎬" },
            { label: "Creators", value: "500+", icon: "⭐" },
            { label: "Happy Kids", value: "50K+", icon: "😊" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center p-5 bg-background/70 backdrop-blur-md rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 min-w-[130px] hover:scale-110 transition-all duration-300"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + i * 0.1 }}
            >
              <motion.span 
                className="text-3xl mb-2"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              >
                {stat.icon}
              </motion.span>
              <span className={`font-display text-2xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent drop-shadow-sm`}>
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
