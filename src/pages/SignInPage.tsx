import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Star, Heart } from "lucide-react";
import { toast } from "sonner";

const SignInPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/signin`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success("Password reset link sent! Check your email 📧");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields! 💖");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Welcome back! 🎉✨");
      navigate("/");
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
              Welcome Back!
            </CardTitle>
            <Star className="w-8 h-8 text-accent animate-bounce" />
          </div>
          <p className="text-primary-foreground/80">Sign in to SARATUBE! ✨</p>
        </CardHeader>

        <CardContent className="p-6">
          {resetMode ? (
            resetSent ? (
              <div className="text-center space-y-4 py-4">
                <div className="text-5xl">📬</div>
                <h3 className="font-display text-xl font-bold">Check Your Email!</h3>
                <p className="text-muted-foreground text-sm">
                  We sent a password reset link to <strong>{email}</strong>
                </p>
                <Button
                  variant="outline"
                  onClick={() => { setResetMode(false); setResetSent(false); }}
                  className="rounded-2xl"
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-muted-foreground text-sm text-center">
                  Enter your email and we'll send you a reset link 🔗
                </p>
                <Input
                  type="email"
                  placeholder="Your email 📧"
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
                  {loading ? "Sending..." : "Send Reset Link 📧"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setResetMode(false)}
                  className="w-full text-muted-foreground"
                >
                  Back to Sign In
                </Button>
              </form>
            )
          ) : (
            <>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Your email 📧"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-lg py-6 rounded-2xl border-2 border-primary/30 focus:border-primary"
                  />
                  <Input
                    type="password"
                    placeholder="Your secret password 🔐"
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
                      Signing in...
                    </span>
                  ) : (
                    "Let's Play! 🎮"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <button
                  onClick={() => setResetMode(true)}
                  className="text-primary hover:underline text-sm font-medium"
                >
                  Forgot your password? 🔑
                </button>
                <p className="text-muted-foreground text-sm">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Join the fun! 🎉
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
