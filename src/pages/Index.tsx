import { useState, useEffect } from "react";
import ThemedLayout from "@/components/layout/ThemedLayout";
import HeroSection from "@/components/home/HeroSection";
import CategoryNav from "@/components/layout/CategoryNav";
import VideoGrid from "@/components/video/VideoGrid";
import KidsPhotoFeed from "@/components/kids/KidsPhotoFeed";
import GuidedQuizBot from "@/components/ai/GuidedQuizBot";
import KidsChatBot from "@/components/ai/KidsChatBot";
import { useTheme, themeCategoryMap, themeConfigs } from "@/hooks/useTheme";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Video, Image as ImageIcon } from "lucide-react";

const Index = () => {
  const { theme, themeName } = useTheme();
  const { childSession, isChildActive } = useChildSession();
  const { user } = useAuth();
  const [blockedCategories, setBlockedCategories] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<"videos" | "photos">("videos");

  // Determine the default category based on theme
  const themeCategory = themeCategoryMap[themeName] || null;
  const [category, setCategory] = useState(themeCategory && isChildActive ? themeCategory : "all");

  // Fetch blocked categories when child session is active
  useEffect(() => {
    if (!isChildActive || !childSession?.userId || !user) {
      setBlockedCategories([]);
      return;
    }

    const fetchBlocked = async () => {
      const { data } = await supabase
        .from("blocked_categories")
        .select("category")
        .eq("child_user_id", childSession.userId);

      if (data) {
        setBlockedCategories(data.map((d) => d.category));
      }
    };

    fetchBlocked();
  }, [isChildActive, childSession?.userId, user]);

  // Reset category when theme changes for child sessions
  useEffect(() => {
    if (isChildActive && themeCategory) {
      setCategory(themeCategory);
    } else if (!isChildActive) {
      setCategory("all");
    }
  }, [themeName, isChildActive, themeCategory]);

  return (
    <ThemedLayout>
      <HeroSection />
      
      {/* Trending Section */}
      <section id="videos" className="py-16 relative overflow-hidden">
        {/* Fun background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,hsl(var(--secondary)/0.15)_0%,transparent_50%)]" />
        </div>
        
        <div className="container space-y-6 relative z-10">
          <motion.div 
            className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4 mb-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3">
              <motion.span 
                className="text-3xl"
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {theme.emoji}
              </motion.span>
              <h2 className={`font-display text-3xl md:text-4xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                {isChildActive && themeCategory
                  ? `${theme.emoji} ${themeConfigs[themeName]?.name || "Videos"} ✨`
                  : "Trending Now ✨"
                }
              </h2>
            </div>

            {isChildActive && (
              <div className="flex bg-muted/50 p-1 rounded-2xl backdrop-blur-sm self-start md:self-center">
                <Button
                  variant={mediaType === "videos" ? "default" : "ghost"}
                  onClick={() => setMediaType("videos")}
                  className={`rounded-xl gap-2 ${mediaType === "videos" ? `bg-gradient-to-r ${theme.primary} text-white` : ""}`}
                >
                  <Video className="w-4 h-4" />
                  Videos
                </Button>
                <Button
                  variant={mediaType === "photos" ? "default" : "ghost"}
                  onClick={() => setMediaType("photos")}
                  className={`rounded-xl gap-2 ${mediaType === "photos" ? `bg-gradient-to-r ${theme.secondary} text-white` : ""}`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Photos
                </Button>
              </div>
            )}
          </motion.div>
          
          {mediaType === "videos" && (
            <CategoryNav
              onCategoryChange={setCategory}
              blockedCategories={blockedCategories}
              defaultCategory={isChildActive && themeCategory ? themeCategory : "all"}
            />
          )}
          
          <motion.div 
            key={`${category}-${mediaType}`}
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {mediaType === "videos" ? (
              <VideoGrid category={category} blockedCategories={isChildActive ? blockedCategories : []} />
            ) : (
              <KidsPhotoFeed />
            )}
          </motion.div>
        </div>
      </section>

      {/* Floating AI Chatbots */}
      {isChildActive ? <KidsChatBot /> : <GuidedQuizBot />}
    </ThemedLayout>
  );
};

export default Index;
