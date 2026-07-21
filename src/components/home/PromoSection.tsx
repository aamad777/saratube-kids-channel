import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { Video, Image as ImageIcon, ShieldCheck } from "lucide-react";

export const PromoSection = () => {
  const { theme } = useTheme();

  const cards = [
    {
      title: "Fun Kids Videos",
      emoji: "🎬",
      icon: <Video className="w-6 h-6 text-pink-500" />,
      description: "Explore a wonderland of safe, educational, and super-fun videos! Cartoons, learning, crafts, and games curated just for you.",
      image: "/kids_videos_promo.png",
      color: "from-pink-400 to-rose-500",
      bgLight: "bg-pink-500/5",
      border: "border-pink-200/50 dark:border-pink-800/30",
    },
    {
      title: "Share Creative Photos",
      emoji: "📸",
      icon: <ImageIcon className="w-6 h-6 text-purple-500" />,
      description: "Show off your amazing crafts, drawings, and happy moments! A safe space to share and view memories with your friends and family.",
      image: "/kids_photos_promo.png",
      color: "from-purple-400 to-indigo-500",
      bgLight: "bg-purple-500/5",
      border: "border-purple-200/50 dark:border-purple-800/30",
    },
    {
      title: "100% Safe & Parent Guided",
      emoji: "🛡️",
      icon: <ShieldCheck className="w-6 h-6 text-teal-500" />,
      description: "Complete peace of mind for parents. Set screen time limits, block/allow categories, and monitor activities with simple controls.",
      image: "/kids_safety_promo.png",
      color: "from-teal-400 to-emerald-500",
      bgLight: "bg-teal-500/5",
      border: "border-teal-200/50 dark:border-teal-800/30",
    },
  ];

  return (
    <section className="py-16 relative overflow-hidden bg-background">
      {/* Decorative background shapes */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4"
          >
            <span>🎈</span> Discover Saratube
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl font-display font-bold mb-6 tracking-tight"
          >
            A Magical World of{" "}
            <span className={`bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
              Videos & Photos
            </span>{" "}
            for Kids! ✨
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Saratube brings children educational entertainment and creative photo sharing in a secure environment. Parents have full oversight while kids enjoy maximum fun!
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8 }}
              className={`flex flex-col bg-card/40 backdrop-blur-md rounded-[2.5rem] border ${card.border} overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300`}
            >
              {/* Illustration Area */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
                <span className="absolute bottom-4 right-6 text-4xl drop-shadow-md animate-bounce-slow">
                  {card.emoji}
                </span>
              </div>

              {/* Text & Details Area */}
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2.5 rounded-2xl ${card.bgLight} border border-current/10`}>
                      {card.icon}
                    </div>
                    <h3 className="text-xl font-bold font-display tracking-tight text-foreground">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-muted flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>✨ Playful & Secure</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default PromoSection;
