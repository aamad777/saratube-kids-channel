import VideoCard from "./VideoCard";

import thumbMusic from "@/assets/thumb-music.png";
import thumbAnimals from "@/assets/thumb-animals.png";
import thumbCrafts from "@/assets/thumb-crafts.png";
import thumbStories from "@/assets/thumb-stories.png";
import thumbScience from "@/assets/thumb-science.png";
import thumbGames from "@/assets/thumb-games.png";

const sampleVideos = [
  {
    id: "1",
    title: "🎵 Rainbow Dance Party with Friends!",
    thumbnail: thumbMusic,
    creator: "Sara's World",
    views: 125000,
    likes: 8500,
    comments: 234,
    duration: "4:32",
    category: "music",
  },
  {
    id: "2",
    title: "🐾 Learn Animal Sounds - Fun for Kids!",
    thumbnail: thumbAnimals,
    creator: "Little Learners",
    views: 89000,
    likes: 5200,
    comments: 156,
    duration: "6:15",
    category: "science",
  },
  {
    id: "3",
    title: "🎨 Easy DIY Crafts - Make a Rainbow!",
    thumbnail: thumbCrafts,
    creator: "Crafty Kids",
    views: 67000,
    likes: 4100,
    comments: 89,
    duration: "8:45",
    category: "crafts",
  },
  {
    id: "4",
    title: "🏰 The Princess and the Magic Castle",
    thumbnail: thumbStories,
    creator: "Story Time",
    views: 234000,
    likes: 12000,
    comments: 567,
    duration: "12:30",
    category: "stories",
  },
  {
    id: "5",
    title: "🔬 Cool Science Experiments at Home!",
    thumbnail: thumbScience,
    creator: "Science Fun",
    views: 156000,
    likes: 9800,
    comments: 345,
    duration: "7:22",
    category: "science",
  },
  {
    id: "6",
    title: "🎮 Fun Games for Kids - Play Along!",
    thumbnail: thumbGames,
    creator: "Game Time",
    views: 198000,
    likes: 11200,
    comments: 678,
    duration: "15:00",
    category: "games",
  },
];

interface VideoGridProps {
  category?: string;
}

const VideoGrid = ({ category = "all" }: VideoGridProps) => {
  const filteredVideos =
    category === "all" || category === "favorites"
      ? sampleVideos
      : sampleVideos.filter((v) => v.category === category);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
      {filteredVideos.map((video) => (
        <VideoCard key={video.id} {...video} />
      ))}
    </div>
  );
};

export default VideoGrid;
