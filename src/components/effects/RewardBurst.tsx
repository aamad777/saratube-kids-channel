import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, createContext, useContext } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  size: number;
  angle: number;
  distance: number;
}

interface RewardContextType {
  triggerReward: (x: number, y: number, type?: "like" | "star" | "confetti") => void;
}

const RewardContext = createContext<RewardContextType>({ triggerReward: () => {} });

export const useReward = () => useContext(RewardContext);

const emojiSets = {
  like: ["❤️", "💖", "💕", "✨", "🌟", "💗"],
  star: ["⭐", "🌟", "✨", "💫", "🎉", "🎊"],
  confetti: ["🎉", "🎊", "🥳", "🎈", "🎁", "✨", "💥", "🌈"],
};

export const RewardProvider = ({ children }: { children: React.ReactNode }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const triggerReward = useCallback((x: number, y: number, type: "like" | "star" | "confetti" = "like") => {
    const emojis = emojiSets[type];
    const count = type === "confetti" ? 16 : 10;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      size: 16 + Math.random() * 16,
      angle: (360 / count) * i + Math.random() * 30,
      distance: 60 + Math.random() * 80,
    }));
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1200);
  }, []);

  return (
    <RewardContext.Provider value={{ triggerReward }}>
      {children}
      <div className="fixed inset-0 pointer-events-none z-[9998]">
        <AnimatePresence>
          {particles.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * p.distance;
            const ty = Math.sin(rad) * p.distance;
            return (
              <motion.div
                key={p.id}
                className="absolute"
                style={{ left: p.x, top: p.y, fontSize: p.size }}
                initial={{ opacity: 1, x: 0, y: 0, scale: 0.3 }}
                animate={{ opacity: 0, x: tx, y: ty - 40, scale: 1.2, rotate: Math.random() * 360 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              >
                {p.emoji}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </RewardContext.Provider>
  );
};
