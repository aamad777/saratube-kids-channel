import { useState, useEffect } from "react";
import ThemedLayout from "@/components/layout/ThemedLayout";
import HeroSection from "@/components/home/HeroSection";
import CategoryNav from "@/components/layout/CategoryNav";
import VideoGrid from "@/components/video/VideoGrid";
import KidsPhotoFeed from "@/components/kids/KidsPhotoFeed";
import UnifiedMediaGrid from "@/components/home/UnifiedMediaGrid";
import GuidedQuizBot from "@/components/ai/GuidedQuizBot";
import KidsChatBot from "@/components/ai/KidsChatBot";
import MobileKidsHeader from "@/components/mobile/MobileKidsHeader";
import MobileSwipeCarousel from "@/components/mobile/MobileSwipeCarousel";
import { useTheme, themeCategoryMap, themeConfigs } from "@/hooks/useTheme";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Video, Image as ImageIcon } from "lucide-react";
import { sampleVideos } from "@/data/videoData";

const Index = () => {
  const { theme, themeName } = useTheme();
  const { childSession, isChildActive } = useChildSession();
  const { user } = useAuth();
  const [blockedCategories, setBlockedCategories] = useState<string[]>([]);
  const [blockedMediaIds, setBlockedMediaIds] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<"home" | "videos" | "photos">("home");
  const [apiStatus, setApiStatus] = useState<{
  status: string;
  rows?: { id: number; message: string; created_at: string }[];
  error?: string;
} | null>(null);
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
      const { data: catData } = await supabase
        .from("blocked_categories")
        .select("category")
        .eq("child_user_id", childSession.userId);

      if (catData) {
        setBlockedCategories(catData.map((d) => d.category));
      }

      // Fetch blocked media IDs for this parent/child context
      const { data: mediaData } = await (supabase as any)
        .from("blocked_media")
        .select("media_id");
      
      if (mediaData) {
        setBlockedMediaIds((mediaData as any[]).map(m => m.media_id));
      }
    };

    fetchBlocked();
  }, [isChildActive, childSession?.userId, user]);
  // Test backend API connection to PostgreSQL
  useEffect(() => {
    const fetchApiStatus = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://192.168.0.113:30088";
        const response = await fetch(`${apiUrl}/persistence-test`);
        const data = await response.json();
        setApiStatus(data);
      } catch (error) {
        setApiStatus({
          status: "api connection failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };

    fetchApiStatus();
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
            {/* Backend API / PostgreSQL status card */}
      <section className="container relative z-10 mt-6 px-4">
        <div className="rounded-2xl border bg-card/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold">Database API Status</h3>
              <p className="text-sm text-muted-foreground">
                Frontend → Backend API → PostgreSQL in saratube-data namespace
              </p>
            </div>

            <div className="rounded-xl bg-muted px-4 py-2 text-sm">
              {apiStatus ? apiStatus.status : "Checking API..."}
            </div>
          </div>

          {apiStatus?.rows?.length ? (
            <div className="mt-3 rounded-xl bg-muted/50 p-3 text-sm">
              <strong>Database message:</strong> {apiStatus.rows[0].message}
            </div>
          ) : apiStatus?.error ? (
            <div className="mt-3 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              <strong>Error:</strong> {apiStatus.error}
            </div>
          ) : null}
        </div>
      </section>
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
              <UnifiedMediaGrid blockedMediaIds={blockedMediaIds} />
            ) : mediaType === "videos" ? (
              <VideoGrid 
                category={category} 
                blockedCategories={isChildActive ? blockedCategories : []} 
                blockedMediaIds={blockedMediaIds}
              />
            ) : (
              <KidsPhotoFeed blockedMediaIds={blockedMediaIds} />
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
