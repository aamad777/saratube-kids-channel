import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Star, Heart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const KidLoginPage = () => {
  const navigate = useNavigate();
  const [childLoginId, setChildLoginId] = useState("adam");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!childLoginId.trim()) {
      toast.error("Please enter your Login ID");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      toast.error("PIN must be 4 digits");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/child/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          childLoginId: childLoginId.trim().toLowerCase(),
          pin
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const child = data.child;

      localStorage.setItem("activeChildId", child.id);
      localStorage.setItem("activeChildUserId", child.userId);
      localStorage.setItem("activeChildName", child.name);
      localStorage.setItem("activeChildTheme", child.theme || "rainbow");

      if (child.age !== null && child.age !== undefined) {
        localStorage.setItem("activeChildAge", String(child.age));
      } else {
        localStorage.removeItem("activeChildAge");
      }

      toast.success(`Welcome back, ${child.name}! 🌈✨`);
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Invalid Login ID or PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <Star className="absolute top-10 left-10 w-12 h-12 text-primary/20 animate-float" fill="currentColor" />
        <Heart className="absolute bottom-20 right-20 w-10 h-10 text-accent/20 animate-float" fill="currentColor" />
        <Sparkles className="absolute top-1/4 right-1/4 w-14 h-14 text-secondary/20 animate-pulse" />
      </div>

      <Card className="w-full max-w-md shadow-card border-none rounded-[32px] overflow-hidden bg-white/90 backdrop-blur-md relative z-10">
        <CardHeader className="text-center p-8 pb-4">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/signin")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="text-3xl font-display bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              Kid Login
            </CardTitle>
            <div className="w-10" />
          </div>
          <p className="text-muted-foreground">
            Enter your Login ID and 4-digit PIN.
          </p>
        </CardHeader>

        <CardContent className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Login ID</label>
            <Input
              value={childLoginId}
              onChange={(e) => setChildLoginId(e.target.value)}
              placeholder="adam"
              className="text-lg py-6 rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">PIN</label>
            <Input
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="1234"
              type="password"
              maxLength={4}
              className="text-lg py-6 rounded-2xl"
            />
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-6 text-lg rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Example: Login ID <strong>adam</strong>, PIN <strong>1234</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KidLoginPage;
