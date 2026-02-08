import VideoCard from "./VideoCard";
import { sampleVideos, getVideosByCategory } from "@/data/videoData";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { filterVideosByAge } from "@/utils/ageFilter";

interface VideoGridProps {
  category?: string;
}

const VideoGrid = ({ category = "all" }: VideoGridProps) => {
  const { childSession } = useChildSession();
  const categoryVideos = getVideosByCategory(category);
  
  // Filter by child's age when a child session is active
  const filteredVideos = childSession?.age
    ? filterVideosByAge(categoryVideos, childSession.age)
    : categoryVideos;

  if (filteredVideos.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="text-5xl mb-4">🔍</div>
        <h3 className="text-lg font-bold text-muted-foreground mb-2">
          No videos for this age group
        </h3>
        <p className="text-sm text-muted-foreground">
          {childSession?.name 
            ? `Try another category suitable for ${childSession.name}'s age (${childSession.age} years old)`
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
