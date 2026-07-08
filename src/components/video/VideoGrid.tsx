import VideoCard from "./VideoCard";
import { getVideosByCategory } from "@/data/videoData";
import { filterVideosByAge } from "@/utils/ageFilter";

interface VideoGridProps {
  category?: string;
  blockedCategories?: string[];
  blockedMediaIds?: string[];
  limit?: number;
}

const VideoGrid = ({
  category = "all",
  blockedCategories = [],
  blockedMediaIds = [],
  limit
}: VideoGridProps) => {
  const activeChildAge = localStorage.getItem("activeChildAge");
  const childAge = activeChildAge ? Number(activeChildAge) : null;

  let videos = getVideosByCategory(category);

  if (category === "all" && blockedCategories.length > 0) {
    videos = videos.filter((v) => !blockedCategories.includes(v.category));
  }

  if (childAge) {
    videos = filterVideosByAge(videos, childAge);
  }

  if (blockedMediaIds.length > 0) {
    videos = videos.filter((v) => !blockedMediaIds.includes(v.id));
  }

  if (limit) {
    videos = videos.slice(0, limit);
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No videos found for this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
      {videos.map((video, index) => (
        <VideoCard key={video.id} video={video} index={index} />
      ))}
    </div>
  );
};

export default VideoGrid;
