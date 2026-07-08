import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Star, Shield, Users, Eye, Baby, Upload, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const SignUpPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSignUp = async () => {
    if (!email || !password || !displayName) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          displayName,
          role: "parent"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      localStorage.setItem("saratube_token", data.token);
      localStorage.setItem("saratube_user", JSON.stringify(data.user));

      toast.success("Welcome! You can now create profiles for your kids! 🎉");
      navigate("/parent");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-card border-2 border-primary/20 overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 py-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-8 h-8 text-white animate-pulse" />
            <CardTitle className="text-3xl font-display text-white">
              {t("signup.title")}
            </CardTitle>
            <Star className="w-8 h-8 text-yellow-300 animate-bounce" />
          </div>
          <p className="text-white/90">{t("signup.subtitle")}</p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
              <Baby className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">{t("signup.feature.profiles")}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
              <Upload className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">{t("signup.feature.upload")}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
              <Eye className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">{t("signup.feature.monitor")}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">{t("signup.feature.limits")}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              placeholder={t("signup.name")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="text-lg py-6 rounded-2xl border-2 border-primary/30 focus:border-primary"
            />
            <Input
              type="email"
              placeholder={t("signup.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-lg py-6 rounded-2xl border-2 border-primary/30 focus:border-primary"
            />
            <Input
              type="password"
              placeholder={t("signup.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-lg py-6 rounded-2xl border-2 border-primary/30 focus:border-primary"
            />
          </div>

          <Button 
            onClick={handleSignUp} 
            className="w-full py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
            disabled={loading || !displayName || !email || !password}
          >
            {loading ? t("signup.creating") : t("signup.button")}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm">
              {t("signup.has.account")}{" "}
              <Link to="/signin" className="text-primary hover:underline font-medium">
                {t("signup.signin")}
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              {t("signup.note")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
