import { useEffect, useState, useCallback, forwardRef } from "react";
import { Sparkles, Star, Heart, Zap } from "lucide-react";

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  delay: number;
  size: number;
}

interface ThemeTransitionEffectProps {
  isActive: boolean;
  onComplete?: () => void;
}

const emojis = ["✨", "⭐", "💫", "🌟", "💖", "🎉", "🦋", "🌈"];

const ThemeTransitionEffect = forwardRef<HTMLDivElement, ThemeTransitionEffectProps>(({ isActive, onComplete }, ref) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);

  const createParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        delay: Math.random() * 0.5,
        size: 16 + Math.random() * 24,
      });
    }
    return newParticles;
  }, []);

  useEffect(() => {
    if (isActive) {
      setShowOverlay(true);
      setParticles(createParticles());

      const timer = setTimeout(() => {
        setShowOverlay(false);
        setParticles([]);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isActive, createParticles, onComplete]);

  if (!showOverlay) return null;

  return (
    <div ref={ref} className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Sparkle burst overlay */}
      <div className="absolute inset-0 bg-white/20 animate-theme-glow" />
      
      {/* Center burst effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <Sparkles className="w-16 h-16 text-yellow-400 animate-theme-sparkle" />
          <Star className="absolute top-0 left-8 w-8 h-8 text-pink-400 animate-magic-swirl" style={{ animationDelay: "0.1s" }} />
          <Heart className="absolute top-8 left-0 w-8 h-8 text-rose-400 animate-magic-swirl" style={{ animationDelay: "0.2s" }} />
          <Zap className="absolute top-8 left-16 w-8 h-8 text-purple-400 animate-magic-swirl" style={{ animationDelay: "0.15s" }} />
        </div>
      </div>

      {/* Confetti particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: `-${particle.size}px`,
            fontSize: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  );
});

ThemeTransitionEffect.displayName = "ThemeTransitionEffect";

export default ThemeTransitionEffect;
