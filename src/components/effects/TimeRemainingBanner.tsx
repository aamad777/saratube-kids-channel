import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";

interface TimeRemainingBannerProps {
  remainingMinutes: number;
  dailyLimitMinutes: number | null;
  usedMinutes: number;
}

const TimeRemainingBanner = ({
  remainingMinutes,
  dailyLimitMinutes,
  usedMinutes,
}: TimeRemainingBannerProps) => {
  if (!dailyLimitMinutes || remainingMinutes > 15) return null;

  const isUrgent = remainingMinutes <= 5;
  const progress = dailyLimitMinutes > 0 
    ? Math.min((usedMinutes / dailyLimitMinutes) * 100, 100)
    : 0;

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-50 px-4 py-2.5 text-center text-sm font-bold ${
        isUrgent
          ? "bg-destructive text-destructive-foreground"
          : "bg-amber-400 text-amber-900"
      }`}
    >
      <div className="container flex items-center justify-center gap-3">
        {isUrgent ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <AlertTriangle className="w-4 h-4" />
          </motion.div>
        ) : (
          <Clock className="w-4 h-4" />
        )}
        
        <span>
          {isUrgent
            ? `⚠️ Only ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""} left!`
            : `⏰ ${remainingMinutes} minutes of watch time remaining`
          }
        </span>

        {/* Mini progress bar */}
        <div className="w-20 h-2 bg-black/20 rounded-full overflow-hidden hidden sm:block">
          <motion.div
            className={`h-full rounded-full ${isUrgent ? "bg-white" : "bg-amber-700"}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TimeRemainingBanner;
