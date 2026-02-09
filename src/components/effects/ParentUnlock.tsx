import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, KeyRound, Clock, ChevronLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ParentUnlockProps {
  onExtend: (minutes: number) => void;
  onCancel: () => void;
}

const EXTENSION_OPTIONS = [
  { minutes: 15, label: "15 min", emoji: "⏱️" },
  { minutes: 30, label: "30 min", emoji: "⏰" },
  { minutes: 60, label: "1 hour", emoji: "🕐" },
];

const ParentUnlock = ({ onExtend, onCancel }: ParentUnlockProps) => {
  const [step, setStep] = useState<"password" | "choose-time">("password");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get current user email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setError("Unable to verify parent account");
        return;
      }

      // Re-authenticate the parent with their password
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (authError) {
        setError("Incorrect password. Please try again.");
        return;
      }

      // Password verified — move to time selection
      setStep("choose-time");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = (minutes: number) => {
    onExtend(minutes);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ type: "spring", damping: 25 }}
      className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 max-w-sm mx-auto border border-white/20 shadow-2xl"
    >
      <AnimatePresence mode="wait">
        {step === "password" ? (
          <motion.div
            key="password"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-5">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="inline-block text-5xl mb-3"
              >
                🔐
              </motion.div>
              <h2 className="text-xl font-display font-bold text-white">
                Parent Verification
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Enter your password to extend time
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Your password"
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl h-12 focus:border-white/50"
                  autoFocus
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-300 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={onCancel}
                  variant="ghost"
                  className="flex-1 text-white/70 hover:text-white hover:bg-white/10 rounded-xl h-11"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !password.trim()}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-xl h-11 font-medium"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Lock className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Verify
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="choose-time"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="text-center mb-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className="inline-block text-5xl mb-3"
              >
                ✅
              </motion.div>
              <h2 className="text-xl font-display font-bold text-white">
                Extend Watch Time
              </h2>
              <p className="text-sm text-white/60 mt-1">
                How much extra time?
              </p>
            </div>

            <div className="space-y-3 mb-5">
              {EXTENSION_OPTIONS.map((option, i) => (
                <motion.button
                  key={option.minutes}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleExtend(option.minutes)}
                  className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-white font-semibold text-lg">
                      +{option.label}
                    </span>
                  </div>
                  <Clock className="w-5 h-5 text-white/40 group-hover:text-white/80 transition-colors" />
                </motion.button>
              ))}
            </div>

            <Button
              onClick={onCancel}
              variant="ghost"
              className="w-full text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Cancel
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ParentUnlock;
