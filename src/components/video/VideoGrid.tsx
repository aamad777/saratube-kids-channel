import { useState, useEffect } from "react";
import VideoCard from "./VideoCard";
import { sampleVideos, getVideosByCategory, VideoItem } from "@/data/videoData";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { filterVideosByAge } from "@/utils/ageFilter";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface VideoGridProps {
  category?: string;
  blockedCategories?: string[];
}

const VideoGrid = ({ category = "all", blockedCategories = [] }: VideoGridProps) => {
  const { childSession, isChildActive } = useChildSession();
  const [dbVideos, setDbVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDbVideos = async () => {
      if (!isChildActive || !childSession?.userId) {
        setDbVideos([]);
        return;
      }

      setLoading(true);
      try {
        // Fetch videos that this child has access to
        const { data: accessData, error: accessError } = await supabase
          .from("video_child_access")
          .select("video_id")
          .eq("child_user_id", childSession.userId);

        if (accessError) throw accessError;

        if (accessData && accessData.length > 0) {
          const videoIds = accessData.map(a => a.video_id);
          
          let query = supabase
            .from("videos")
            .select("*")
            .in("id", videoIds);

          if (category !== "all") {
            query = query.eq("category", category);
          }

          const { data: videos, error: videosError } = await query;

          if (videosError) throw videosError;

          const mappedVideos: VideoItem[] = (videos || []).map(v => ({
            id: v.id,
            title: v.title,
            thumbnail: v.thumbnail_url || "/placeholder.svg",
            creator: "Parent Upload",
            views: 0,
            likes: 0,
            comments: 0,
            duration: "Video",
            category: v.category,
            description: v.description || "",
            youtubeId: v.video_url.includes("youtube.com") || v.video_url.includes("youtu.be") 
              ? (v.video_url.split("v=")[1]?.split("&")[0] || v.video_url.split("/").pop() || "")
              : "",
            ageRecommendation: "", // DB videos don't have age rec yet
            // Add extra field to distinguish uploaded videos
            isUploaded: true,
            videoUrl: v.video_url
          }));

          setDbVideos(mappedVideos);
        } else {
          setDbVideos([]);
        }
      } catch (error) {
        console.error("Error fetching database videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDbVideos();
  }, [childSession?.id, isChildActive, category]);

  let categoryVideos = getVideosByCategory(category);
  
  // Combine sample videos with database videos
  let allVideos = [...dbVideos, ...categoryVideos];

  // If showing "all", filter out blocked categories
  if (category === "all" && blockedCategories.length > 0) {
    allVideos = allVideos.filter(
      (v) => !blockedCategories.includes(v.category)
    );
  }

  // Filter by child's age when a child session is active
  const filteredVideos = childSession?.age
    ? filterVideosByAge(allVideos, childSession.age)
    : allVideos;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredVideos.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-bold text-muted-foreground mb-2">
          No videos for this category
        </h3>
        <p className="text-sm text-muted-foreground">
          {childSession?.name 
            ? `Ask a parent to add more categories for ${childSession.name}!`
            : "Try another category!"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
      {filteredVideos.map((video) => (
        <VideoCard key={video.id} {...video} />
      ))}
    </div>
  );
};

export default VideoGrid;
