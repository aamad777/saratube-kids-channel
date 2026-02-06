import VideoCard from "./VideoCard";
import { sampleVideos, getVideosByCategory } from "@/data/videoData";

interface VideoGridProps {
  category?: string;
}

const VideoGrid = ({ category = "all" }: VideoGridProps) => {
  const filteredVideos = getVideosByCategory(category);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
      {filteredVideos.map((video) => (
        <VideoCard key={video.id} {...video} />
      ))}
    </div>
  );
};

export default VideoGrid;
