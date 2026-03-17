import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Sparkles, Heart, ArrowLeft, Lock, Mail, ChevronRight, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { themeConfigs, AppTheme } from "@/hooks/useTheme";

interface ChildProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  selected_theme: AppTheme;
  dummy_email: string;
}

const KidLoginPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setChildSession } = useChildSession();
  
  const [step, setStep] = useState(1); // 1: Child ID, 2: PIN
  const [childId, setChildId] = useState("");
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Auto-load child id from localStorage if available
  useEffect(() => {
    const savedId = localStorage.getItem("last_child_login_id");
    if (savedId) setChildId(savedId);
  }, []);

  const handleFetchChild = async () => {
    if (!childId.trim()) {
      toast.error("Please enter your Child ID");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await (supabase.rpc as any)("get_child_by_login_id", {
        p_login_id: childId.trim().toLowerCase(),
      });

      if (error) throw error;

      if (!data || (data as any[]).length === 0) {
        toast.error("Profile not found. Ask your parent for your Login ID!");
      } else {
        const childData = (data as any[])[0] as ChildProfile;
        setSelectedChild(childData);
        localStorage.setItem("last_child_login_id", childId.trim());
        setStep(2);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to find your profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = (child: ChildProfile) => {
    setSelectedChild(child);
    setStep(3);
    setPin("");
  };

  const handlePinSubmit = async (p: string) => {
    if (!selectedChild) return;
    
    setLoading(true);
    try {
      // Direct sign-in using the dummy email and PIN as password
      const { data, error } = await supabase.auth.signInWithPassword({
        email: selectedChild.dummy_email,
        password: p,
      });

      if (error) {
        setPinError(true);
        setPin("");
        toast.error("Oops! Wrong PIN. Try again! 🤫");
        throw error;
      }

      // Success! Set the child session
      setChildSession({
        id: selectedChild.id,
        userId: data.user.id,
        name: selectedChild.display_name,
        theme: selectedChild.selected_theme || "rainbow",
        age: (data.user.user_metadata as any).age || null,
      });

      toast.success(`Welcome back, ${selectedChild.display_name}! 🌈✨`);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      {/* Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-10 left-10 w-12 h-12 text-primary/20 animate-float" fill="currentColor" />
        <Heart className="absolute bottom-20 right-20 w-10 h-10 text-accent/20 animate-float" style={{ animationDelay: "1s" }} fill="currentColor" />
        <Sparkles className="absolute top-1/4 right-1/4 w-14 h-14 text-secondary/20 animate-pulse" />
      </div>

      <Card className="w-full max-w-lg shadow-card border-none rounded-[40px] overflow-hidden bg-white/80 backdrop-blur-md relative z-10">
        <CardHeader className="text-center p-8 pb-4">
          <div className="flex justify-between items-center mb-4">
            {step > 1 && (
              <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="w-6 h-6" />
              </Button>
            )}
            <div className="flex-1 text-center">
              <CardTitle className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Kid's Corner 🧸
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <UserCircle className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Hello Friend! 👋</h3>
                  <p className="text-muted-foreground">Enter your Child ID to start</p>
                </div>

                <div className="relative">
                  <Input
                    type="text"
                    placeholder="e.g. sara123"
                    value={childId}
                    onChange={(e) => setChildId(e.target.value)}
                    className="text-lg py-7 px-12 rounded-3xl border-2 border-primary/20 focus:border-primary shadow-sm"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                </div>

                <Button
                  onClick={handleFetchChild}
                  disabled={loading || !childId}
                  className="w-full py-8 text-xl rounded-3xl group shadow-lg"
                  variant="hero"
                >
                  {loading ? "Finding You..." : "Go to My Videos!"}
                  <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => navigate("/signin")}
                  className="w-full text-muted-foreground"
                >
                  I'm a Parent (Sign In)
                </Button>
              </motion.div>
            )}

            {step === 2 && selectedChild && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${themeConfigs[selectedChild.selected_theme || "rainbow"].primary} flex items-center justify-center text-5xl shadow-xl mb-4 border-4 border-white`}>
                    {themeConfigs[selectedChild.selected_theme || "rainbow"].emoji}
                  </div>
                  <h2 className="text-3xl font-display font-bold">
                    Hi {selectedChild.display_name}!
                  </h2>
                  <p className="text-muted-foreground mt-2">Enter your 4-digit PIN</p>
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

                <div className="bg-white/50 rounded-[32px] p-6">
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((digit, i) => {
                      if (digit === "") return <div key={i} />;
                      return (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={loading}
                          onClick={() => digit === "⌫" ? handleBackspace() : handlePinInput(String(digit))}
                          className={`h-16 rounded-2xl font-display text-2xl font-bold transition-all shadow-sm ${
                            digit === "⌫"
                              ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                              : "bg-white hover:bg-primary/10 text-foreground border-2 border-primary/10"
                          }`}
                        >
                          {digit}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {loading && (
                  <div className="absolute inset-0 bg-white/40 flex items-center justify-center rounded-[40px]">
                    <Sparkles className="w-12 h-12 text-primary animate-spin" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};

export default KidLoginPage;
