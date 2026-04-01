import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { Play, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useReward } from "@/components/effects/RewardBurst";

interface SwipeItem {
  id: string;
  title: string;
  thumbnail: string;
  creator: string;
  type: "video" | "photo";
  duration?: string;
}

interface MobileSwipeCarouselProps {
  items: SwipeItem[];
  title?: string;
}

const CARD_WIDTH = 260;
const CARD_GAP = 16;

const MobileSwipeCarousel = ({ items, title }: MobileSwipeCarouselProps) => {
  const { theme } = useTheme();
  const { triggerReward } = useReward();
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const handleLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    triggerReward(rect.left + rect.width / 2, rect.top, "like");
    setLiked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="sm:hidden mb-6">
      {title && (
        <h3 className={`font-display text-lg font-bold px-4 mb-3 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
          {theme.emoji} {title}
        </h3>
      )}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            className="snap-center shrink-0"
            style={{ width: CARD_WIDTH }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to={item.type === "video" ? `/watch/${item.id}` : "#"}>
              <div className={`${theme.cardBg} rounded-3xl overflow-hidden shadow-card`}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className={`w-12 h-12 rounded-full bg-gradient-to-r ${theme.primary} flex items-center justify-center shadow-lg`}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Play className="h-5 w-5 text-white fill-current ml-0.5" />
                      </motion.div>
                    </div>
                  )}
                  {item.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-lg font-bold">
                      {item.duration}
                    </span>
                  )}
                  <motion.button
                    onClick={(e) => handleLike(e, item.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm"
                    whileTap={{ scale: 1.4 }}
                  >
                    <Heart className={`h-4 w-4 ${liked.has(item.id) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  </motion.button>
                </div>
                <div className="p-3">
                  <h4 className="font-display font-bold text-sm line-clamp-2">{item.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.creator}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MobileSwipeCarousel;
