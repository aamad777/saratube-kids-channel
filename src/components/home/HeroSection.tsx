import { Sparkles, Play, Upload, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.png";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="SARATUBE Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
      </div>

      {/* Floating decorations */}
      <div className="absolute top-20 left-10 animate-float">
        <Star className="h-8 w-8 text-sara-yellow fill-sara-yellow" />
      </div>
      <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: "1s" }}>
        <Sparkles className="h-10 w-10 text-sara-pink" />
      </div>
      <div className="absolute bottom-20 left-1/4 animate-float" style={{ animationDelay: "0.5s" }}>
        <Star className="h-6 w-6 text-sara-mint fill-sara-mint" />
      </div>

      {/* Content */}
      <div className="relative z-10 container px-4 py-16 md:py-24 flex flex-col items-center text-center">
        <div className="animate-bounce-slow mb-4">
          <Sparkles className="h-12 w-12 text-sara-yellow" />
        </div>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
          <span className="text-gradient">Welcome to</span>
          <br />
          <span className="text-foreground">SARATUBE! ✨</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8">
          The most fun place for kids to watch, create, and share amazing videos!
          Learn, play, and make new friends! 🎀
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button variant="hero" size="xl" className="gap-2" asChild>
            <Link to="/explore">
              <Play className="h-6 w-6 fill-current" />
              Start Watching
            </Link>
          </Button>
          <Button variant="fun" size="xl" className="gap-2" asChild>
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
              className="flex flex-col items-center p-4 bg-card/80 backdrop-blur-sm rounded-2xl shadow-card min-w-[120px]"
            >
              <span className="text-2xl mb-1">{stat.icon}</span>
              <span className="font-display text-2xl font-bold text-primary">
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
