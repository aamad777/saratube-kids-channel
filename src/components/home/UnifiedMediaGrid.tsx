import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import VideoCard from "@/components/video/VideoCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

interface UnifiedMediaGridProps {
  filter?: "all" | "video" | "photo";
}

const UnifiedMediaGrid = ({ filter = "all" }: UnifiedMediaGridProps) => {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getMediaUrl = (url: string) => {
    if (!url) return "";
    return url.replace("http://localhost:4000", API_BASE_URL);
  };

  useEffect(() => {
    const loadChildMedia = async () => {
      const activeChildId = localStorage.getItem("activeChildId");

      if (!activeChildId) {
        setMedia([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/child/${activeChildId}/media`);
        const data = await response.json();

        if (response.ok) {
          const loaded = data.media || [];
          const filtered =
            filter === "all"
              ? loaded
              : loaded.filter((item: any) => item.media_type === filter);

          setMedia(filtered);
        }
      } catch (error) {
        console.error("Failed to load child media:", error);
      } finally {
        setLoading(false);
      }
    };

    loadChildMedia();
  }, [filter]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading your videos and photos...
        </CardContent>
      </Card>
    );
  }

  if (media.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No {filter === "all" ? "media" : filter === "video" ? "videos" : "photos"} linked to this child yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {media.map((item, index) => {
        if (item.media_type === "photo") {
          return (
            <Card key={`${item.id}-${index}`} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <img
                  src={getMediaUrl(item.public_url)}
                  alt={item.title}
                  className="w-full max-h-72 object-contain rounded-xl border"
                />
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Photo | {item.category}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        }

        return (
          <VideoCard
            key={`${item.id}-${index}`}
            video={{
              id: item.id,
              title: item.title,
              thumbnail: item.thumbnail_url || "/placeholder.svg",
              creator: "SaraTube Local",
              views: 0,
              likes: 0,
              comments: 0,
              duration: "",
              videoUrl: getMediaUrl(item.public_url),
            }}
          />
        );
      })}
    </div>
  );
};

export default UnifiedMediaGrid;
