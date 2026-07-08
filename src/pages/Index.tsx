import { useState, useEffect } from "react";
import ThemedLayout from "@/components/layout/ThemedLayout";
import HeroSection from "@/components/home/HeroSection";
import CategoryNav from "@/components/layout/CategoryNav";
import UnifiedMediaGrid from "@/components/home/UnifiedMediaGrid";
import GuidedQuizBot from "@/components/ai/GuidedQuizBot";
import KidsChatBot from "@/components/ai/KidsChatBot";
import MobileKidsHeader from "@/components/mobile/MobileKidsHeader";
import MobileSwipeCarousel from "@/components/mobile/MobileSwipeCarousel";
import { useTheme, themeCategoryMap, themeConfigs } from "@/hooks/useTheme";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Video, Image as ImageIcon } from "lucide-react";
import { sampleVideos } from "@/data/videoData";

interface LocalChildSession {
  id: string;
  userId: string;
  name: string;
  theme: string;
  age: number | null;
}

const Index = () => {
  const { theme, themeName } = useTheme();
  const [childSession, setChildSession] = useState<LocalChildSession | null>(null);
  const isChildActive = !!childSession;
  const [blockedCategories, setBlockedCategories] = useState<string[]>([]);
  const [blockedMediaIds, setBlockedMediaIds] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<"home" | "videos" | "photos">("home");

  // Determine the default category based on theme
  const themeCategory = themeCategoryMap[themeName] || null;
  const [category, setCategory] = useState(themeCategory && isChildActive ? themeCategory : "all");

  // Load local child session from browser localStorage
  useEffect(() => {
    const id = localStorage.getItem("activeChildId");
    const userId = localStorage.getItem("activeChildUserId");
    const name = localStorage.getItem("activeChildName");
    const theme = localStorage.getItem("activeChildTheme") || "rainbow";
    const age = localStorage.getItem("activeChildAge");

    if (id && userId && name) {
      setChildSession({
        id,
        userId,
        name,
        theme,
        age: age ? Number(age) : null
      });
    } else {
      setChildSession(null);
    }

    // Local blocked category/media APIs are not migrated yet.
    setBlockedCategories([]);
    setBlockedMediaIds([]);
  }, []);

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
      {/* Fun mobile kids header */}
      <MobileKidsHeader />

      {/* Mobile swipe carousel for trending */}
      {isChildActive && (
        <MobileSwipeCarousel
          items={sampleVideos.slice(0, 8).map(v => ({
            id: v.id,
            title: v.title,
            thumbnail: v.thumbnail,
            creator: v.creator,
            type: "video" as const,
            duration: v.duration,
          }))}
          title="Trending Now 🔥"
        />
      )}

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
                  variant={mediaType === "home" ? "default" : "ghost"}
                  onClick={() => setMediaType("home")}
                  className={`rounded-xl gap-2 ${mediaType === "home" ? `bg-gradient-to-r ${theme.primary} text-white` : ""}`}
                >
                  <span className="w-4 h-4 flex items-center justify-center">🏠</span>
                  Home
                </Button>
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
            {mediaType === "home" ? (
              <UnifiedMediaGrid filter="all" />
            ) : mediaType === "videos" ? (
              <UnifiedMediaGrid filter="video" />
            ) : (
              <UnifiedMediaGrid filter="photo" />
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
