import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { VideoItem, sampleVideos } from "@/data/videoData";
import { filterVideosByAge } from "@/utils/ageFilter";
import VideoCard from "../video/VideoCard";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getOptimizedImageUrl, MEDIA_SIZES } from "@/utils/mediaUtils";

interface UnifiedMediaGridProps {
  blockedMediaIds?: string[];
  limit?: number;
}

const UnifiedMediaGrid = ({ blockedMediaIds = [], limit }: UnifiedMediaGridProps) => {
  const { childSession, isChildActive } = useChildSession();
  const { profile } = useAuth();

  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: ['unified-media', childSession?.userId, isChildActive, blockedMediaIds.length],
    queryFn: async () => {
      if (!isChildActive || !childSession?.userId) {
        return [];
      }

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

      return allItems;
    },
    enabled: !!childSession?.userId && isChildActive,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const photoItems = items.filter((item: any) => item.type === 'photo');
  const closeLightbox = () => setSelectedPhotoIndex(null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card rounded-3xl overflow-hidden shadow-card animate-pulse h-64">
            <div className="aspect-video bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
        {items.map((item: any, index: number) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {item.type === 'video' ? (
              <VideoCard 
                {...item} 
                thumbnail={getOptimizedImageUrl(item.thumbnail, MEDIA_SIZES.THUMBNAIL)} 
              />
            ) : (
              <div 
                className="group relative bg-card rounded-3xl overflow-hidden shadow-card transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer"
                onClick={() => {
                  const pIndex = photoItems.findIndex((p: any) => p.id === item.id);
                  setSelectedPhotoIndex(pIndex);
                }}
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={getOptimizedImageUrl(item.thumbnail, MEDIA_SIZES.THUMBNAIL)}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300 h-10 w-10" />
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

      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center backdrop-blur-md"
            onClick={closeLightbox}
          >
            <div className="absolute top-6 right-6 z-[110]">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 bg-white/10 rounded-full h-12 w-12"
                onClick={(e) => {
                  e.stopPropagation();
                  closeLightbox();
                }}
              >
                <X className="w-8 h-8" />
              </Button>
            </div>

            <motion.div
              layoutId={photoItems[selectedPhotoIndex].id}
              className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getOptimizedImageUrl(photoItems[selectedPhotoIndex].thumbnail, MEDIA_SIZES.LIGHTBOX)}
                alt={photoItems[selectedPhotoIndex].title}
                decoding="async"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-12 left-0 right-0 text-center">
                <p className="text-white text-xl font-medium">
                  {photoItems[selectedPhotoIndex].title}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnifiedMediaGrid;
