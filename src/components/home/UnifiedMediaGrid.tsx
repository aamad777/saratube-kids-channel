import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { VideoItem, sampleVideos } from "@/data/videoData";
import { filterVideosByAge } from "@/utils/ageFilter";
import VideoCard from "../video/VideoCard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Maximize2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface UnifiedMediaGridProps {
  blockedMediaIds?: string[];
  limit?: number;
}

const UnifiedMediaGrid = ({ blockedMediaIds = [], limit }: UnifiedMediaGridProps) => {
  const { childSession, isChildActive } = useChildSession();
  const { profile } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllMedia = async () => {
      if (!isChildActive || !childSession?.userId) {
        setItems([]);
        return;
      }

      setLoading(true);
      try {
        // 1. Fetch DB Videos
        const { data: accessData } = await supabase
          .from("video_child_access")
          .select("video_id")
          .eq("child_user_id", childSession.userId);

        let dbVideos: any[] = [];
        if (accessData && accessData.length > 0) {
          const videoIds = accessData.map(a => a.video_id);
          const { data: videos } = await supabase
            .from("videos")
            .select("*")
            .in("id", videoIds);
          
          if (videos) {
            dbVideos = videos.map(v => ({
              ...v,
              type: 'video',
              id: v.id,
              title: v.title,
              thumbnail: v.thumbnail_url,
              videoUrl: v.video_url,
              creator: "Parent Upload",
              views: 0,
              likes: 0,
              comments: 0,
              duration: "Video",
              created_at: v.created_at
            }));
          }
        }

        // 2. Fetch Photos
        const { data: photos } = await supabase
          .from("kids_photos")
          .select("*")
          .eq("child_profile_id", childSession.userId);

        const mappedPhotos = (photos || []).map(p => ({
          ...p,
          type: 'photo',
          id: p.id,
          title: p.caption || "Shared Memory",
          thumbnail: p.photo_url,
          created_at: p.created_at
        }));

        // 3. Add Sample Videos (Filtered by Age)
        const ageFilteredSamples = filterVideosByAge(sampleVideos, childSession.age || 5).map(v => ({
          ...v,
          type: 'video',
          created_at: new Date(0).toISOString() // Put samples at the end
        }));

        // Combine and Sort
        let allItems = [...dbVideos, ...mappedPhotos, ...ageFilteredSamples];

        // Filter blocked media
        if (blockedMediaIds.length > 0) {
          allItems = allItems.filter(item => !blockedMediaIds.includes(item.id));
        }

        // Sort by created_at desc
        allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        if (limit) {
          allItems = allItems.slice(0, limit);
        }

        setItems(allItems);
      } catch (error) {
        console.error("Error fetching unified media:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMedia();
  }, [childSession?.userId, isChildActive, blockedMediaIds.length]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No media found for your feed yet! ✨</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {item.type === 'video' ? (
            <VideoCard {...item} />
          ) : (
            <div className="group relative bg-card rounded-3xl overflow-hidden shadow-card transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Maximize2 className="text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">📸</span>
                  <h3 className="font-display font-bold text-lg line-clamp-1">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">Shared Photo</p>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default UnifiedMediaGrid;
