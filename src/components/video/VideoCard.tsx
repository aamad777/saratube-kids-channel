import { Heart, MessageCircle, Play } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { getAgeSuitability, getAgeBadgeStyle } from "@/utils/ageFilter";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail: string;
  creator: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  ageRecommendation?: string;
}

const VideoCard = ({
  id,
  title,
  thumbnail,
  creator,
  views,
  likes,
  comments,
  duration,
  ageRecommendation,
}: VideoCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const { theme } = useTheme();
  const { childSession } = useChildSession();

  const suitability = ageRecommendation 
    ? getAgeSuitability(childSession?.age ?? null, ageRecommendation) 
    : "unknown";
  const ageBadge = getAgeBadgeStyle(suitability);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const formatViews = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Link to={`/watch/${id}`}>
      <div className={`group relative ${theme.cardBg} rounded-3xl overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1`}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${theme.primary} flex items-center justify-center shadow-button animate-pulse-glow`}>
              <Play className="h-8 w-8 text-white fill-current ml-1" />
            </div>
          </div>

          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-foreground/80 text-primary-foreground rounded-lg text-sm font-bold">
            {duration}
          </div>

          {/* Age badge */}
          {ageRecommendation && childSession?.age && (
            <div className={`absolute top-2 left-2 px-2 py-1 ${ageBadge.bg} ${ageBadge.text} rounded-lg text-xs font-bold flex items-center gap-1 backdrop-blur-sm`}>
              <span>{ageBadge.icon}</span>
              <span>Ages {ageRecommendation}</span>
            </div>
          )}

          {/* Like button */}
          <button
            onClick={handleLike}
            className="absolute top-2 right-2 p-2 rounded-full bg-card/80 backdrop-blur-sm transition-all hover:scale-110"
          >
            <Heart
              className={`h-5 w-5 transition-all ${
                isLiked
                  ? "fill-red-500 text-red-500 scale-110"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className={`font-display font-bold text-lg line-clamp-2 group-hover:bg-gradient-to-r group-hover:${theme.primary} group-hover:bg-clip-text group-hover:text-transparent transition-colors`}>
            {title}
          </h3>
          
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${theme.primary} flex items-center justify-center`}>
              <span className="text-xs">{theme.emoji}</span>
            </div>
            <span className="text-sm text-muted-foreground font-medium">
              {creator}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              {formatViews(views)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className={`h-4 w-4 ${isLiked ? "text-red-500 fill-red-500" : ""}`} />
              {formatViews(likeCount)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {comments}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
