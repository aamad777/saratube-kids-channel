import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Star, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { themeConfigs, AppTheme } from "@/hooks/useTheme";

interface ChildProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  age: number | null;
  selected_theme: AppTheme;
  pin_hash: string | null;
}

const ChildSelectPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { setChildSession } = useChildSession();
  const { t } = useLanguage();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/signin");
      return;
    }
    fetchChildren();
  }, [user, authLoading, navigate]);

  const fetchChildren = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("created_by_parent", user.id)
        .eq("is_parent", false);
      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error("Error fetching children:", error);
      toast.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = (child: ChildProfile) => {
    setSelectedChild(child);
    setPin("");
    setPinError(false);
  };

  const handlePinSubmit = async (submittedPin?: string) => {
    const pinToCheck = submittedPin || pin;
    if (!selectedChild || pinToCheck.length !== 4) return;

    if (selectedChild.pin_hash === pinToCheck) {
      setChildSession({
        id: selectedChild.id,
        userId: selectedChild.user_id,
        name: selectedChild.display_name,
        theme: selectedChild.selected_theme || "rainbow",
        age: selectedChild.age,
      });
      toast.success(
        <span className="flex items-center gap-2">
          <span className="text-xl">{themeConfigs[selectedChild.selected_theme || "rainbow"].emoji}</span>
          <span>{t("child.hi")} {selectedChild.display_name}!</span>
        </span>
      );
      navigate("/");
    } else {
      setPinError(true);
      setPin("");
      toast.error(t("child.wrong.pin"));
    }
  };

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setPinError(false);
      if (newPin.length === 4) {
        setTimeout(() => handlePinSubmit(newPin), 200);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setPinError(false);
  };

  const getThemeColors = (theme: AppTheme) => {
    return themeConfigs[theme] || themeConfigs.rainbow;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce">🎡</div>
          <p className="text-lg font-display text-purple-600 mt-4">{t("child.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-6">
      <Button
        variant="ghost"
        onClick={() => selectedChild ? setSelectedChild(null) : navigate("/parent")}
        className="mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        {t("child.back")}
      </Button>

      <AnimatePresence mode="wait">
        {!selectedChild ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                {t("child.whos.watching")}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t("child.choose.profile")}
              </p>
            </div>

            {children.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👶</div>
                <h2 className="text-xl font-display font-bold text-gray-700 mb-2">
                  {t("child.no.profiles")}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t("child.ask.parent")}
                </p>
                <Button
                  onClick={() => navigate("/parent")}
                  className="bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  {t("child.go.parent")}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {children.map((child, index) => {
                  const theme = getThemeColors(child.selected_theme || "rainbow");
                  return (
                    <motion.button
                      key={child.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleChildSelect(child)}
                      className="group relative"
                    >
                      <div className={`relative p-6 rounded-3xl bg-gradient-to-br ${theme.primary} shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl`}>
                        <div className="w-24 h-24 mx-auto rounded-full bg-white/30 flex items-center justify-center text-5xl mb-4 ring-4 ring-white/50">
                          {theme.emoji}
                        </div>
                        <h3 className="text-xl font-display font-bold text-white text-center mb-2">
                          {child.display_name}
                        </h3>
                        {child.pin_hash && (
                          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/30 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <Sparkles className="absolute top-3 left-3 w-6 h-6 text-white/60 animate-pulse" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="pin"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 10 }}
                className={`w-32 h-32 mx-auto rounded-full bg-gradient-to-br ${getThemeColors(selectedChild.selected_theme || "rainbow").primary} flex items-center justify-center text-6xl shadow-xl mb-4`}
              >
                {getThemeColors(selectedChild.selected_theme || "rainbow").emoji}
              </motion.div>
              <h2 className="text-3xl font-display font-bold text-gray-800">
                {t("child.hi")} {selectedChild.display_name}!
              </h2>
              <p className="text-muted-foreground mt-2">
                {t("child.enter.pin")}
              </p>
            </div>

            <div className="flex justify-center gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: pin.length > i ? 1.2 : 1,
                    backgroundColor: pinError 
                      ? "#ef4444" 
                      : pin.length > i 
                        ? "#a855f7" 
                        : "#e5e7eb"
                  }}
                  className="w-5 h-5 rounded-full transition-colors"
                />
              ))}
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((digit, i) => {
                  if (digit === "") return <div key={i} />;
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => digit === "⌫" ? handleBackspace() : handlePinInput(String(digit))}
                      className={`h-16 rounded-2xl font-display text-2xl font-bold transition-all ${
                        digit === "⌫"
                          ? "bg-gray-200 hover:bg-gray-300 text-gray-600"
                          : "bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg"
                      }`}
                    >
                      {digit}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {pinError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-red-500 mt-4 font-medium"
              >
                {t("child.wrong.pin")}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChildSelectPage;