import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Star, Shield, Users, Eye, Baby, Upload, Clock } from "lucide-react";
import { toast } from "sonner";

const SignUpPage = () => {
  const navigate = useNavigate();
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

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: displayName,
            is_parent: true,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Update profile to mark as parent
        await supabase
          .from("profiles")
          .update({ 
            is_parent: true,
          })
          .eq("user_id", data.user.id);

        toast.success("Welcome! You can now create profiles for your kids! 🎉");
        navigate("/parent");
      }
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
              Parent Sign Up
            </CardTitle>
            <Star className="w-8 h-8 text-yellow-300 animate-bounce" />
          </div>
          <p className="text-white/90">Create a safe space for your kids! ✨</p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
              <Baby className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Create Kid Profiles</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
              <Upload className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium">Upload Videos</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
              <Eye className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Monitor Activity</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-xl">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">Set Time Limits</span>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="text-lg py-6 rounded-2xl border-2 border-primary/30 focus:border-primary"
            />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-lg py-6 rounded-2xl border-2 border-primary/30 focus:border-primary"
            />
            <Input
              type="password"
              placeholder="Create a password (min 6 characters)"
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
            {loading ? "Creating Account... ✨" : "Create Parent Account 🎉"}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
            <p className="text-xs text-muted-foreground">
              After signing up, you'll be able to create PIN-protected profiles for your children.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;