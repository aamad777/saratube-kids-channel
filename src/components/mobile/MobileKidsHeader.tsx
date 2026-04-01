import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { useLanguage } from "@/contexts/LanguageContext";

const floatingEmojis = ["🌈", "⭐", "🎵", "🦋", "🌸", "🎨", "🎈", "💫"];

const MobileKidsHeader = () => {
  const { theme } = useTheme();
  const { childSession, isChildActive } = useChildSession();
  const { t } = useLanguage();

  if (!isChildActive) return null;

  const name = childSession?.name || "Kiddo";
  const greetings = [`Hey ${name}! ${theme.emoji}`, `Let's play ${name}! 🎉`, `Welcome back ${name}! ✨`];
  const greeting = greetings[Math.floor(Date.now() / 60000) % greetings.length];

  return (
    <div className="sm:hidden relative overflow-hidden rounded-3xl mx-4 mt-2 mb-4">
      {/* Gradient background */}
      <div className={`bg-gradient-to-r ${theme.primary} p-4 pb-5`}>
        {/* Floating emoji decorations */}
        {floatingEmojis.slice(0, 5).map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-lg opacity-40"
            style={{
              top: `${10 + (i * 18) % 60}%`,
              left: `${70 + (i * 7) % 30}%`,
            }}
            animate={{
              y: [0, -12, 0],
              rotate: [0, i % 2 === 0 ? 15 : -15, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          >
            {emoji}
          </motion.span>
        ))}

        {/* Mascot + greeting */}
        <div className="flex items-center gap-3 relative z-10">
          <motion.div
            className="text-4xl"
            animate={{ rotate: [0, -10, 10, -10, 0], y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {theme.emoji}
          </motion.div>
          <div className="flex-1">
            <motion.h2
              className="text-white font-display font-bold text-xl leading-tight"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {greeting}
            </motion.h2>
            <motion.p
              className="text-white/80 text-sm mt-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t("hero.description")}
            </motion.p>
          </div>
        </div>

        {/* Bouncy action pills */}
        <div className="flex gap-2 mt-3 relative z-10">
          {["🎬 Videos", "📸 Photos", "🎮 Fun"].map((label, i) => (
            <motion.div
              key={label}
              className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {label}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileKidsHeader;
