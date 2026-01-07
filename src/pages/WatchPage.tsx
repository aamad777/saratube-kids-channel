import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Download, Eye, Clock, Sparkles } from "lucide-react";
import { useState } from "react";
import Header from "@/components/layout/Header";
import AIChatBox from "@/components/ai/AIChatBox";
import CommentSection from "@/components/video/CommentSection";
import { Button } from "@/components/ui/button";
import VideoGrid from "@/components/video/VideoGrid";

import thumbMusic from "@/assets/thumb-music.png";
import thumbAnimals from "@/assets/thumb-animals.png";
import thumbCrafts from "@/assets/thumb-crafts.png";
import thumbStories from "@/assets/thumb-stories.png";
import thumbScience from "@/assets/thumb-science.png";
import thumbGames from "@/assets/thumb-games.png";

const videoData: Record<string, { title: string; thumbnail: string; creator: string; views: number; description: string }> = {
  "1": {
    title: "🎵 Rainbow Dance Party with Friends!",
    thumbnail: thumbMusic,
    creator: "Sara's World",
    views: 125000,
    description: "Join us for the most colorful dance party ever! Learn fun dance moves and sing along with your favorite rainbow characters! Perfect for kids who love music and dancing! 💃🌈",
  },
  "2": {
    title: "🐾 Learn Animal Sounds - Fun for Kids!",
    thumbnail: thumbAnimals,
    creator: "Little Learners",
    views: 89000,
    description: "Discover all the amazing sounds that animals make! From dogs and cats to elephants and lions - learn them all in this fun educational video! 🐕🦁",
  },
  "3": {
    title: "🎨 Easy DIY Crafts - Make a Rainbow!",
    thumbnail: thumbCrafts,
    creator: "Crafty Kids",
    views: 67000,
    description: "Get creative with us! Learn how to make beautiful rainbow crafts with simple materials you can find at home! 🎨✨",
  },
  "4": {
    title: "🏰 The Princess and the Magic Castle",
    thumbnail: thumbStories,
    creator: "Story Time",
    views: 234000,
    description: "Once upon a time in a magical kingdom... Join us for an enchanting story about a brave princess and her magical castle! 👑🏰",
  },
  "5": {
    title: "🔬 Cool Science Experiments at Home!",
    thumbnail: thumbScience,
    creator: "Science Fun",
    views: 156000,
    description: "Science is amazing! Learn cool experiments you can try at home with mom and dad! Safe, fun, and educational! 🧪✨",
  },
  "6": {
    title: "🎮 Fun Games for Kids - Play Along!",
    thumbnail: thumbGames,
    creator: "Game Time",
    views: 198000,
    description: "Join the fun gaming adventure! Learn new games and play along with us! Perfect for family game time! 🎮🎉",
  },
};

const WatchPage = () => {
  const { id } = useParams<{ id: string }>();
  const video = videoData[id || "1"] || videoData["1"];
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(8500);

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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6">
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
            {/* Video player placeholder */}
            <div className="relative aspect-video bg-foreground/10 rounded-3xl overflow-hidden shadow-card">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-glow animate-pulse-glow cursor-pointer hover:scale-110 transition-transform">
                  <div className="w-0 h-0 border-t-[20px] border-t-transparent border-l-[35px] border-l-primary-foreground border-b-[20px] border-b-transparent ml-2" />
                </div>
              </div>
            </div>

            {/* Video info */}
            <div className="bg-card rounded-3xl shadow-card p-6">
              <h1 className="font-display text-2xl md:text-3xl font-bold">
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
              <div className="flex items-center gap-3 mt-4 p-3 bg-muted rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-gradient-button flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {video.creator[0]}
                </div>
                <div>
                  <h3 className="font-display font-bold">{video.creator}</h3>
                  <p className="text-sm text-muted-foreground">1.2K subscribers</p>
                </div>
                <Button variant="hero" className="ml-auto">
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
              <div className="mt-4 p-4 bg-muted rounded-2xl">
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
            <div className="bg-card rounded-3xl shadow-card p-4">
              <h3 className="font-display text-lg font-bold flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-sara-yellow" />
                Watch Next
              </h3>
              <div className="space-y-4">
                <VideoGrid />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WatchPage;
