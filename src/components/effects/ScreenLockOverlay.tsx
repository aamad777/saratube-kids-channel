import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Clock, Lock, KeyRound } from "lucide-react";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { useTheme } from "@/hooks/useTheme";
import ParentUnlock from "./ParentUnlock";

interface ScreenLockOverlayProps {
  isLocked: boolean;
  lockReason: "time-limit" | "bedtime" | null;
  dailyLimitMinutes: number | null;
  usedMinutes: number;
  bedtimeEnd: string | null;
  childName: string;
  onExtend?: (minutes: number) => void;
}

const ScreenLockOverlay = ({
  isLocked,
  lockReason,
  dailyLimitMinutes,
  usedMinutes,
  bedtimeEnd,
  childName,
  onExtend,
}: ScreenLockOverlayProps) => {
  const { clearChildSession } = useChildSession();
  const { theme } = useTheme();
  const [showUnlock, setShowUnlock] = useState(false);

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleExtend = (minutes: number) => {
    setShowUnlock(false);
    onExtend?.(minutes);
  };

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
          
          {/* Stars background */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 1, 0.2],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative z-10 text-center px-6 max-w-md mx-auto"
          >
            <AnimatePresence mode="wait">
              {showUnlock ? (
                <motion.div
                  key="unlock"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ParentUnlock
                    onExtend={handleExtend}
                    onCancel={() => setShowUnlock(false)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="locked"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {lockReason === "bedtime" ? (
                    <>
                      {/* Bedtime Lock */}
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="text-8xl mb-6"
                      >
                        🌙
                      </motion.div>
                      <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                        Bedtime, {childName}! 💤
                      </h1>
                      <p className="text-xl text-purple-200 mb-6">
                        It's time to rest and dream wonderful dreams!
                      </p>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                        <Moon className="w-8 h-8 text-purple-300 mx-auto mb-3" />
                        <p className="text-purple-200 text-sm">
                          Videos will be available again at
                        </p>
                        <p className="text-3xl font-bold text-white mt-2">
                          {bedtimeEnd ? formatTime(bedtimeEnd) : "Morning"} ☀️
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Time Limit Lock */}
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-8xl mb-6"
                      >
                        ⏰
                      </motion.div>
                      <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                        Time's Up, {childName}! 🎬
                      </h1>
                      <p className="text-xl text-blue-200 mb-6">
                        You've watched enough videos for today!
                      </p>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
                        <Clock className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                        <p className="text-blue-200 text-sm">
                          Today's watch time
                        </p>
                        <p className="text-3xl font-bold text-white mt-2">
                          {usedMinutes} / {dailyLimitMinutes} minutes
                        </p>
                        <div className="w-full bg-white/20 rounded-full h-3 mt-4 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-amber-400 to-red-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Fun suggestions */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 mb-6">
                    <p className="text-white font-bold mb-3">
                      How about trying these instead? 🌟
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { emoji: "📚", label: "Read a book" },
                        { emoji: "🎨", label: "Draw" },
                        { emoji: "🏃", label: "Play outside" },
                      ].map((activity) => (
                        <motion.div
                          key={activity.label}
                          whileHover={{ scale: 1.05 }}
                          className="bg-white/10 rounded-xl p-3 text-center"
                        >
                          <div className="text-3xl mb-1">{activity.emoji}</div>
                          <p className="text-xs text-white/80">{activity.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-3">
                    {/* Parent Unlock Button */}
                    {lockReason === "time-limit" && onExtend && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowUnlock(true)}
                        className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 hover:from-emerald-500/50 hover:to-teal-500/50 border border-emerald-400/30 backdrop-blur-sm rounded-full text-white text-sm font-medium transition-all"
                      >
                        <KeyRound className="w-4 h-4" />
                        Parent: Extend Time
                      </motion.button>
                    )}

                    {/* Switch to parent */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearChildSession}
                      className="flex items-center gap-2 mx-auto px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white text-sm font-medium transition-all"
                    >
                      <Lock className="w-4 h-4" />
                      Switch to Parent Mode
                    </motion.button>
                  </div>

                  <p className="text-white/40 text-xs mt-4">
                    Parents can adjust time limits in the dashboard
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScreenLockOverlay;
