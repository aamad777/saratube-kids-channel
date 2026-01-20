import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Download, Eye, Clock } from "lucide-react";
import { useState } from "react";
import ThemedLayout from "@/components/layout/ThemedLayout";
import AIChatBox from "@/components/ai/AIChatBox";
import CommentSection from "@/components/video/CommentSection";
import { Button } from "@/components/ui/button";
import VideoGrid from "@/components/video/VideoGrid";
import { useTheme } from "@/hooks/useTheme";
import { useScreenTimeTracker } from "@/hooks/useScreenTimeTracker";
import thumbMusic from "@/assets/thumb-music.png";
import thumbAnimals from "@/assets/thumb-animals.png";
import thumbCrafts from "@/assets/thumb-crafts.png";
import thumbStories from "@/assets/thumb-stories.png";
import thumbScience from "@/assets/thumb-science.png";
import thumbGames from "@/assets/thumb-games.png";

const videoData: Record<string, { title: string; thumbnail: string; creator: string; views: number; description: string; youtubeId: string }> = {
  "1": {
    title: "🎵 Rainbow Dance Party with Friends!",
    thumbnail: thumbMusic,
    creator: "Sara's World",
    views: 125000,
    description: "Join us for the most colorful dance party ever! Learn fun dance moves and sing along with your favorite rainbow characters! Perfect for kids who love music and dancing! 💃🌈",
    youtubeId: "L_jWHffIx5E",
  },
  "2": {
    title: "🐾 Learn Animal Sounds - Fun for Kids!",
    thumbnail: thumbAnimals,
    creator: "Little Learners",
    views: 89000,
    description: "Discover all the amazing sounds that animals make! From dogs and cats to elephants and lions - learn them all in this fun educational video! 🐕🦁",
    youtubeId: "t99ULJjCsaM",
  },
  "3": {
    title: "🎨 Easy DIY Crafts - Make a Rainbow!",
    thumbnail: thumbCrafts,
    creator: "Crafty Kids",
    views: 67000,
    description: "Get creative with us! Learn how to make beautiful rainbow crafts with simple materials you can find at home! 🎨✨",
    youtubeId: "0TgLtF3PMOc",
  },
  "4": {
    title: "🏰 The Princess and the Magic Castle",
    thumbnail: thumbStories,
    creator: "Story Time",
    views: 234000,
    description: "Once upon a time in a magical kingdom... Join us for an enchanting story about a brave princess and her magical castle! 👑🏰",
    youtubeId: "RQmEERvqq70",
  },
  "5": {
    title: "🔬 Cool Science Experiments at Home!",
    thumbnail: thumbScience,
    creator: "Science Fun",
    views: 156000,
    description: "Science is amazing! Learn cool experiments you can try at home with mom and dad! Safe, fun, and educational! 🧪✨",
    youtubeId: "js0hVFCHPOo",
  },
  "6": {
    title: "🎮 Fun Games for Kids - Play Along!",
    thumbnail: thumbGames,
    creator: "Game Time",
    views: 198000,
    description: "Join the fun gaming adventure! Learn new games and play along with us! Perfect for family game time! 🎮🎉",
    youtubeId: "nKIu9yen5nc",
  },
};

const WatchPage = () => {
  const { id } = useParams<{ id: string }>();
  const video = videoData[id || "1"] || videoData["1"];
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(8500);
  const { theme } = useTheme();

  // Track screen time for children
  useScreenTimeTracker({
    videoId: id || "1",
    videoTitle: video.title,
    category: video.title.includes("🎵") ? "music" : 
              video.title.includes("🐾") ? "animals" :
              video.title.includes("🎨") ? "crafts" :
              video.title.includes("🏰") ? "stories" :
              video.title.includes("🔬") ? "science" : "games",
  });

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };
  const formatViews = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <ThemedLayout showFooter={false}>
      <div className="container px-4 py-6">
        {/* Back button */}
        <Link to="/">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video player */}
            <div className="relative aspect-video bg-foreground/10 rounded-3xl overflow-hidden shadow-card">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Video info */}
            <div className={`${theme.cardBg} rounded-3xl shadow-card p-6`}>
              <h1 className={`font-display text-2xl md:text-3xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                {video.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatViews(video.views)} views
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  2 days ago
                </span>
              </div>

              {/* Creator */}
              <div className="flex items-center gap-3 mt-4 p-3 bg-muted/50 rounded-2xl">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${theme.primary} flex items-center justify-center text-white font-bold text-lg`}>
                  {video.creator[0]}
                </div>
                <div>
                  <h3 className="font-display font-bold">{video.creator}</h3>
                  <p className="text-sm text-muted-foreground">1.2K subscribers</p>
                </div>
                <Button className={`ml-auto bg-gradient-to-r ${theme.primary} text-white hover:opacity-90`}>
                  Subscribe
                </Button>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-4">
                <Button
                  variant={isLiked ? "coral" : "outline"}
                  onClick={handleLike}
                  className="gap-2"
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                  {formatViews(likes)}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-5 w-5" />
                  Share
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-5 w-5" />
                  Save
                </Button>
              </div>

              {/* Description */}
              <div className="mt-4 p-4 bg-muted/50 rounded-2xl">
                <p className="text-sm">{video.description}</p>
              </div>
            </div>

            {/* Comments */}
            <CommentSection />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Chat */}
            <AIChatBox videoTitle={video.title} />

            {/* More videos */}
            <div className={`${theme.cardBg} rounded-3xl shadow-card p-4`}>
              <h3 className={`font-display text-lg font-bold flex items-center gap-2 mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                <span>{theme.emoji}</span>
                Watch Next
              </h3>
              <div className="space-y-4">
                <VideoGrid />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemedLayout>
  );
};

export default WatchPage;
