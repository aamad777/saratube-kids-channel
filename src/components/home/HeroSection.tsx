import { Play, Upload, Star, Sparkles, Video, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTheme, AppTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
import heroBgQuranStories from "@/assets/hero-bg-quran-stories.png";
import heroBgNasheed from "@/assets/hero-bg-nasheed.png";
import heroBgRamadan from "@/assets/hero-bg-ramadan.png";
import heroBgDuaPrayer from "@/assets/hero-bg-dua-prayer.png";
import heroBgFarm from "@/assets/hero-bg-farm.png";
import heroBgSports from "@/assets/hero-bg-sports.png";
import heroBgCars from "@/assets/hero-bg-cars.png";
import heroBgMagic from "@/assets/hero-bg-magic.png";

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
  quran_stories: heroBgQuranStories,
  nasheed: heroBgNasheed,
  ramadan: heroBgRamadan,
  dua_prayer: heroBgDuaPrayer,
  farm: heroBgFarm,
  sports: heroBgSports,
  cars: heroBgCars,
  magic: heroBgMagic,
  bunny: heroBgRainbow, // Fallback background for bunny theme
};

const HeroSection = () => {
  const { theme, themeName } = useTheme();
  const { profile } = useAuth();
  const { t } = useLanguage();

  // Get personalized app name based on child's display name
  const getAppName = () => {
    if (profile?.display_name) {
      const firstName = profile.display_name.split(" ")[0].toUpperCase();
      return `${firstName}TUBE`;
    }
    return "SARATUBE";
  };

  const currentBackground = theme.bgImage || themeBackgrounds[themeName as AppTheme] || heroBgRainbow;

  const cards = [
    {
      title: "Fun Kids Videos",
      emoji: "🎬",
      icon: <Video className="w-5 h-5 text-pink-500" />,
      description: "Explore safe, educational, and super-fun videos!",
      image: "/kids_videos_promo.png",
      borderColor: "border-pink-200/60 dark:border-pink-800/30",
      bgLight: "bg-pink-500/5",
      delay: 0,
      link: "/kid-login",
      badgeText: "Kids Enter Here 🧸",
    },
    {
      title: "Share Creative Photos",
      emoji: "📸",
      icon: <ImageIcon className="w-5 h-5 text-purple-500" />,
      description: "Show off your crafts, drawings, and happy moments!",
      image: "/kids_photos_promo.png",
      borderColor: "border-purple-200/60 dark:border-purple-800/30",
      bgLight: "bg-purple-500/5",
      delay: 0.3,
      link: "/kid-login",
      badgeText: "Kids Gallery 🌟",
    },
    {
      title: "100% Parent Guided",
      emoji: "🛡️",
      icon: <ShieldCheck className="w-5 h-5 text-teal-500" />,
      description: "Complete control over screen time and categories.",
      image: "/kids_safety_promo.png",
      borderColor: "border-teal-200/60 dark:border-teal-800/30",
      bgLight: "bg-teal-500/5",
      delay: 0.6,
      link: "/parent",
      badgeText: "Parents Setup 🔑",
    },
  ];

  return (
    <section className="relative overflow-hidden min-h-[600px] md:min-h-[750px] pb-16">
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
          className="absolute pointer-events-none"
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
            left: i % 2 === 0 ? `${2 + i * 2}%` : undefined,
            right: i % 2 === 1 ? `${2 + i * 2}%` : undefined,
          }}
        >
          {i % 3 === 0 ? (
            <Star className={`h-${6 + (i % 4) * 2} w-${6 + (i % 4) * 2} ${theme.accent} fill-current drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`} style={{ width: 20 + i * 3, height: 20 + i * 3 }} />
          ) : i % 3 === 1 ? (
            theme.iconUrl ? (
              <img src={theme.iconUrl} alt="Labubu" className="drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] object-contain" style={{ width: 30 + i * 4, height: 30 + i * 4 }} />
            ) : (
              <span className="drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" style={{ fontSize: 24 + i * 3 }}>{theme.emoji}</span>
            )
          ) : (
            <Sparkles className={`${theme.accent} drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]`} style={{ width: 16 + i * 2, height: 16 + i * 2 }} />
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
      <div className="relative z-10 container px-4 pt-10 md:pt-16 flex flex-col items-center text-center">
        {/* Animated Hello Greeting */}
        <motion.div 
          className="mb-4 inline-flex items-center gap-2 bg-white/70 dark:bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-md cursor-pointer"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 3, -3, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-2xl md:text-3xl animate-pulse">👋</span>
          <span className="font-display font-black text-xl md:text-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
            Hi Kids!
          </span>
        </motion.div>

        <motion.h1 
          className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <span className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent drop-shadow-sm`}>{t("hero.welcome")}</span>{" "}
          <motion.span 
            className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent inline-block`}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {getAppName()}! {theme.emoji}
          </motion.span>
        </motion.h1>

        <motion.p 
          className="text-sm md:text-base text-foreground/90 max-w-xl mb-6 leading-relaxed font-semibold px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {t("hero.description")} {theme.emoji}
        </motion.p>

        {/* Buttons */}
        <motion.div 
          className="flex flex-wrap gap-3 justify-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {!profile?.is_parent && (
            <Button
              className={`gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 hover:scale-105 text-sm md:text-base px-5 md:px-7 py-4 md:py-5 shadow-lg transition-all duration-300 rounded-full animate-bounce-slow`}
              asChild
            >
              <Link to="/kid-login">
                <span className="text-xl">🧸</span>
                Kid's Magic Corner
              </Link>
            </Button>
          )}
          <Button
            className={`gap-2 bg-gradient-to-r ${theme.primary} text-white hover:opacity-90 hover:scale-105 text-sm md:text-base px-5 md:px-7 py-4 md:py-5 shadow-lg transition-all duration-300 rounded-full`}
            onClick={() => document.getElementById("videos")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Play className="h-5 w-5 fill-current" />
            {t("hero.start.watching")}
          </Button>
          {(profile?.is_parent || !profile) && (
            <Button className={`gap-2 bg-gradient-to-r ${theme.secondary} text-white hover:opacity-90 hover:scale-105 text-sm md:text-base px-5 md:px-7 py-4 md:py-5 shadow-lg transition-all duration-300 rounded-full`} asChild>
              <Link to="/upload">
                <Upload className="h-5 w-5" />
                {t("hero.upload.video")}
              </Link>
            </Button>
          )}
        </motion.div>

        {/* Visual Animated Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl w-full px-4">
          {cards.map((card, idx) => (
            <Link 
              key={card.title} 
              to={card.link}
              className="flex flex-col group cursor-pointer"
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ 
                  opacity: 1, 
                  y: [0, -10, 0] 
                }}
                transition={{
                  y: {
                    repeat: Infinity,
                    duration: 3 + idx * 0.5,
                    ease: "easeInOut",
                    delay: card.delay,
                  },
                  opacity: { duration: 0.6, delay: 0.4 + idx * 0.1 },
                  default: { ease: "linear" }
                }}
                whileHover={{ scale: 1.05, y: -15 }}
                className={`flex flex-col h-full bg-card/60 backdrop-blur-md rounded-[2rem] border ${card.borderColor} overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 relative`}
              >
                {/* Floating interactive badge */}
                <div className="absolute top-3 left-3 z-20 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-muted-foreground border border-white/20 shadow-sm transition-transform group-hover:scale-110">
                  {card.badgeText}
                </div>

                {/* Card Thumbnail */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="bg-white/95 text-black px-4 py-2 rounded-full font-bold text-xs shadow-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Click to Enter 🚀
                    </span>
                  </div>
                  <span className="absolute bottom-2 right-4 text-3xl drop-shadow-sm">
                    {card.emoji}
                  </span>
                </div>

                {/* Card Details */}
                <div className="p-4 flex-1 flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1.5 rounded-xl ${card.bgLight} border border-current/10 transition-transform group-hover:rotate-12`}>
                        {card.icon}
                      </div>
                      <h3 className="text-sm font-bold font-display tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {card.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
