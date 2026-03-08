import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useTheme, themeConfigs, AppTheme } from "@/hooks/useTheme";
import { useChildSession } from "@/contexts/ChildSessionContext";
import ThemedLayout from "@/components/layout/ThemedLayout";
import ThemeTransitionEffect from "@/components/effects/ThemeTransitionEffect";
import KidsPhotoUpload from "@/components/kids/KidsPhotoUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Sparkles, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const { profile, refreshProfile } = useAuth();
  const { theme, themeName } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(
    (profile?.selected_theme as AppTheme) || "rainbow"
  );
  const [saving, setSaving] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  const themeOptions: { id: AppTheme; name: string; emoji: string }[] = [
    { id: "rainbow", name: "Rainbow", emoji: "🌈" },
    { id: "princess", name: "Princess", emoji: "👑" },
    { id: "ocean", name: "Ocean", emoji: "🌊" },
    { id: "space", name: "Space", emoji: "🚀" },
    { id: "jungle", name: "Jungle", emoji: "🌴" },
    { id: "candy", name: "Candy", emoji: "🍭" },
    { id: "superhero", name: "Superhero", emoji: "⚡" },
    { id: "dinosaur", name: "Dinosaur", emoji: "🦖" },
  ];

  const handleSaveTheme = async () => {
    if (!profile) return;
    
    setSaving(true);
    setShowTransition(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ selected_theme: selectedTheme })
        .eq("id", profile.id);

      if (error) throw error;

      await refreshProfile();
      
      toast({
        title: "Theme Updated! ✨",
        description: `Your theme is now ${themeOptions.find(t => t.id === selectedTheme)?.name}!`,
      });
    } catch (error) {
      toast({
        title: "Oops!",
        description: "Couldn't save your theme. Try again!",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const previewConfig = themeConfigs[selectedTheme];

  return (
    <ThemedLayout>
      <ThemeTransitionEffect 
        isActive={showTransition} 
        onComplete={() => setShowTransition(false)} 
      />
      <div className="min-h-screen p-4 md:p-8 theme-transition">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 
              className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}
            >
              My Profile ✨
            </h1>
          </div>

          {/* Profile Card */}
          <Card className={`mb-8 overflow-hidden border-2 ${theme.cardBg}`}>
            <CardHeader className="pb-4">
              <CardTitle className={`flex items-center gap-2 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                <Sparkles className="w-5 h-5" />
                Hello, {profile?.display_name || "Friend"}!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Age: {profile?.age || "Not set"} years old
              </p>

              {/* Avatar display */}
              {profile?.avatar_url && (
                <div className="flex items-center gap-4">
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo Upload */}
          <Card className={`mb-8 border-2 ${theme.cardBg}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                <Camera className="w-5 h-5" />
                📸 My Photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <KidsPhotoUpload onAvatarUpdated={refreshProfile} />
            </CardContent>
          </Card>

          {/* Theme Selector */}
          <Card className={`border-2 ${theme.cardBg}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                🎨 Choose Your Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Theme Preview */}
              <div 
                className="mb-6 p-6 rounded-2xl transition-all duration-500"
                style={{ background: previewConfig.gradient }}
              >
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">{previewConfig.emoji}</div>
                  <h3 className="text-xl font-bold mb-1">
                    {themeOptions.find(t => t.id === selectedTheme)?.name} Theme
                  </h3>
                  <p className="text-white/80 text-sm">Preview how your app will look!</p>
                </div>
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {themeOptions.map((themeOption) => {
                  const config = themeConfigs[themeOption.id];
                  const isSelected = selectedTheme === themeOption.id;
                  const isCurrent = profile?.selected_theme === themeOption.id;
                  
                  return (
                    <button
                      key={themeOption.id}
                      onClick={() => setSelectedTheme(themeOption.id)}
                      className={`
                        relative p-4 rounded-xl transition-all duration-300 
                        hover:scale-105 hover:shadow-lg
                        ${isSelected ? "ring-4 ring-offset-2 ring-white/50" : ""}
                      `}
                      style={{ background: config.gradient }}
                    >
                      <div className="text-center text-white">
                        <div className="text-2xl mb-1">{themeOption.emoji}</div>
                        <div className="text-sm font-medium">{themeOption.name}</div>
                      </div>
                      
                      {isSelected && (
                        <div 
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ background: config.primary }}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      {isCurrent && !isSelected && (
                        <div className="absolute -top-1 -right-1 text-xs bg-white/90 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                          Current
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSaveTheme}
                disabled={saving || selectedTheme === profile?.selected_theme}
                className="w-full text-lg py-6 rounded-xl font-bold transition-all hover:scale-[1.02]"
                style={{ 
                  background: previewConfig.gradient,
                  opacity: selectedTheme === profile?.selected_theme ? 0.5 : 1
                }}
              >
                {saving ? (
                  "Saving..."
                ) : selectedTheme === profile?.selected_theme ? (
                  "This is your current theme ✓"
                ) : (
                  <>Save My Theme {previewConfig.emoji}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ThemedLayout>
  );
};

export default ProfilePage;
