import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Star, Heart, Music, Palette, Book, Beaker, Gamepad2, TreePine, Candy, Waves, Rocket, Crown, Rainbow } from "lucide-react";
import { toast } from "sonner";

type Theme = "rainbow" | "princess" | "ocean" | "space" | "jungle" | "candy";
type VideoCategory = "music" | "animals" | "crafts" | "stories" | "science" | "games";

const themes: { id: Theme; name: string; icon: React.ElementType; colors: string; bg: string }[] = [
  { id: "rainbow", name: "Rainbow", icon: Rainbow, colors: "from-pink-400 via-purple-400 to-blue-400", bg: "bg-gradient-to-r from-pink-100 to-purple-100" },
  { id: "princess", name: "Princess", icon: Crown, colors: "from-pink-400 to-rose-400", bg: "bg-gradient-to-r from-pink-100 to-rose-100" },
  { id: "ocean", name: "Ocean", icon: Waves, colors: "from-cyan-400 to-blue-500", bg: "bg-gradient-to-r from-cyan-100 to-blue-100" },
  { id: "space", name: "Space", icon: Rocket, colors: "from-indigo-500 to-purple-600", bg: "bg-gradient-to-r from-indigo-100 to-purple-100" },
  { id: "jungle", name: "Jungle", icon: TreePine, colors: "from-green-400 to-emerald-500", bg: "bg-gradient-to-r from-green-100 to-emerald-100" },
  { id: "candy", name: "Candy", icon: Candy, colors: "from-pink-400 to-orange-400", bg: "bg-gradient-to-r from-pink-100 to-orange-100" },
];

const categories: { id: VideoCategory; name: string; icon: React.ElementType; emoji: string }[] = [
  { id: "music", name: "Music", icon: Music, emoji: "🎵" },
  { id: "animals", name: "Animals", icon: Heart, emoji: "🐾" },
  { id: "crafts", name: "Crafts", icon: Palette, emoji: "🎨" },
  { id: "stories", name: "Stories", icon: Book, emoji: "🏰" },
  { id: "science", name: "Science", icon: Beaker, emoji: "🔬" },
  { id: "games", name: "Games", icon: Gamepad2, emoji: "🎮" },
];

const SignUpPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<Theme>("rainbow");
  const [selectedCategories, setSelectedCategories] = useState<VideoCategory[]>([]);

  const toggleCategory = (category: VideoCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSignUp = async () => {
    if (!email || !password || !displayName) {
      toast.error("Please fill in all fields! 💖");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters! 🔐");
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
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Update profile with theme and age
        await supabase
          .from("profiles")
          .update({ 
            selected_theme: selectedTheme,
            age: age ? parseInt(age) : null,
          })
          .eq("user_id", data.user.id);

        // Insert video preferences
        if (selectedCategories.length > 0) {
          await supabase
            .from("user_video_preferences")
            .insert(
              selectedCategories.map(category => ({
                user_id: data.user!.id,
                category,
              }))
            );
        }

        toast.success("Welcome to SARATUBE! 🎉✨");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong! 😢");
    } finally {
      setLoading(false);
    }
  };

  const currentTheme = themes.find(t => t.id === selectedTheme);

  return (
    <div className={`min-h-screen ${currentTheme?.bg} flex items-center justify-center p-4 transition-all duration-500`}>
      <Card className="w-full max-w-lg shadow-card border-2 border-primary/20 overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-r from-primary to-secondary py-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-primary-foreground animate-pulse" />
            <CardTitle className="text-3xl font-display text-primary-foreground">
              Join SARATUBE!
            </CardTitle>
            <Star className="w-8 h-8 text-accent animate-bounce" />
          </div>
          <p className="text-primary-foreground/80">Create your fun account! ✨</p>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all ${
                  step >= s ? "bg-accent scale-110" : "bg-primary-foreground/30"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xl font-display text-center text-foreground">
                Tell us about you! 👋
              </h3>
              
              <div className="space-y-3">
                <Input
                  placeholder="Your cool name ✨"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-lg py-6 rounded-2xl border-2 border-primary/30 focus:border-primary"
                />
                <Input
                  type="number"
                  placeholder="Your age 🎂"
                  min={3}
                  max={16}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="text-lg py-6 rounded-2xl border-2 border-primary/30 focus:border-primary"
                />
                <Input
                  type="email"
                  placeholder="Parent's email 📧"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-lg py-6 rounded-2xl border-2 border-primary/30 focus:border-primary"
                />
                <Input
                  type="password"
                  placeholder="Secret password 🔐"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-lg py-6 rounded-2xl border-2 border-primary/30 focus:border-primary"
                />
              </div>

              <Button 
                onClick={() => setStep(2)} 
                className="w-full py-6 text-xl"
                variant="hero"
                disabled={!displayName || !email || !password}
              >
                Next Step! 🚀
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xl font-display text-center text-foreground">
                Pick your favorite theme! 🎨
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {themes.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-4 rounded-2xl border-3 transition-all transform hover:scale-105 ${
                        selectedTheme === theme.id
                          ? "border-primary shadow-glow scale-105"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <div className={`w-full h-16 rounded-xl bg-gradient-to-r ${theme.colors} flex items-center justify-center mb-2`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <p className="font-display text-sm">{theme.name}</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(1)} 
                  variant="outline"
                  className="flex-1 py-6"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1 py-6 text-lg"
                  variant="hero"
                >
                  Next! ✨
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xl font-display text-center text-foreground">
                What do you love to watch? 💖
              </h3>
              <p className="text-center text-muted-foreground text-sm">
                Pick as many as you like!
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`p-4 rounded-2xl border-3 transition-all transform hover:scale-105 ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-glow"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.emoji}</span>
                        <div className="text-left">
                          <p className="font-display text-sm">{category.name}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-2 text-primary text-sm font-medium">
                          ✓ Selected!
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => setStep(2)} 
                  variant="outline"
                  className="flex-1 py-6"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSignUp} 
                  className="flex-1 py-6 text-lg"
                  variant="hero"
                  disabled={loading}
                >
                  {loading ? "Creating... ✨" : "Let's Go! 🎉"}
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link to="/signin" className="text-primary hover:underline font-medium">
              Sign In! 💖
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
