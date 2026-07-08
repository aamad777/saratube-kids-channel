import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Star, Heart } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const SignInPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Password reset is not connected yet in local on-prem auth.");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields! 💖");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("saratube_token", data.token);
      localStorage.setItem("saratube_user", JSON.stringify(data.user));

      toast.success("Welcome back! 🎉✨");
      navigate("/parent");
    } catch (error: any) {
      toast.error(error.message || "Oops! Something went wrong 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
      {/* Floating decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 animate-float">
          <Star className="w-12 h-12 text-accent/40" fill="currentColor" />
        </div>
        <div className="absolute top-20 right-20 animate-float" style={{ animationDelay: "1s" }}>
          <Heart className="w-10 h-10 text-primary/40" fill="currentColor" />
        </div>
        <div className="absolute bottom-20 left-1/4 animate-float" style={{ animationDelay: "0.5s" }}>
          <Sparkles className="w-14 h-14 text-secondary/40" />
        </div>
        <div className="absolute bottom-32 right-1/3 animate-float" style={{ animationDelay: "1.5s" }}>
          <Star className="w-8 h-8 text-accent/40" fill="currentColor" />
        </div>
      </div>

      <Card className="w-full max-w-md shadow-card border-2 border-primary/20 overflow-hidden relative z-10">
        <CardHeader className="text-center bg-gradient-to-r from-primary to-secondary py-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-primary-foreground animate-pulse" />
            <CardTitle className="text-3xl font-display text-primary-foreground">
              {t("signin.welcome")}
            </CardTitle>
            <Star className="w-8 h-8 text-accent animate-bounce" />
          </div>
          <p className="text-primary-foreground/80">{t("signin.subtitle")}</p>
        </CardHeader>

        <CardContent className="p-6">
          {resetMode ? (
            resetSent ? (
              <div className="text-center space-y-4 py-4">
                <div className="text-5xl">📬</div>
                <h3 className="font-display text-xl font-bold">{t("signin.reset.title")}</h3>
                <p className="text-muted-foreground text-sm">
                  {t("signin.reset.desc")} <strong>{email}</strong>
                </p>
                <Button
                  variant="outline"
                  onClick={() => { setResetMode(false); setResetSent(false); }}
                  className="rounded-2xl"
                >
                  {t("signin.reset.back")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-muted-foreground text-sm text-center">
                  {t("signin.reset.prompt")}
                </p>
                <Input
                  type="email"
                  placeholder={t("signin.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-lg py-6 rounded-2xl border-2 border-primary/30 focus:border-primary"
                />
                <Button
                  type="submit"
                  className="w-full py-6 text-xl"
                  variant="hero"
                  disabled={loading}
                >
                  {loading ? t("signin.reset.sending") : t("signin.reset.button")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setResetMode(false)}
                  className="w-full text-muted-foreground"
                >
                  {t("signin.reset.back")}
                </Button>
              </form>
            )
          ) : (
            <>
              <div className="mb-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full py-8 text-xl rounded-3xl border-2 border-primary/30 hover:bg-primary/5 group"
                  onClick={() => navigate("/kid-login")}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-2xl group-hover:animate-bounce">🧸</span>
                    Kid's Corner
                    <Sparkles className="w-5 h-5 text-accent" />
                  </span>
                </Button>
                <div className="flex items-center gap-2 my-4">
                  <div className="flex-1 h-[1px] bg-muted" />
                  <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Or Parent Login</span>
                  <div className="flex-1 h-[1px] bg-muted" />
                </div>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder={t("signin.email")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-lg py-6 rounded-2xl border-2 border-primary/30 focus:border-primary"
                  />
                  <Input
                    type="password"
                    placeholder={t("signin.password")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-lg py-6 rounded-2xl border-2 border-primary/30 focus:border-primary"
                  />
                </div>

                <Button 
                  type="submit"
                  className="w-full py-6 text-xl"
                  variant="hero"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 animate-spin" />
                      {t("signin.signing.in")}
                    </span>
                  ) : (
                    t("signin.button")
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <button
                  onClick={() => setResetMode(true)}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  {t("signin.forgot")}
                </button>
                <p className="text-muted-foreground text-sm">
                  {t("signin.no.account")}{" "}
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    {t("signin.join")}
                  </Link>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
