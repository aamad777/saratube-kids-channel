import { Heart, MessageCircle, Play, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { getAgeSuitability, getAgeBadgeStyle } from "@/utils/ageFilter";
import { toast } from "sonner";
import { useReward } from "@/components/effects/RewardBurst";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VideoCardProps {
  video?: {
    id: string;
    title: string;
    thumbnail: string;
    creator: string;
    views: number;
    likes: number;
    comments: number;
    duration: string;
    ageRecommendation?: string;
    videoUrl?: string;
  };
  index?: number;
  id?: string;
  title?: string;
  thumbnail?: string;
  creator?: string;
  views?: number;
  likes?: number;
  comments?: number;
  duration?: string;
  ageRecommendation?: string;
  videoUrl?: string;
}

const VideoCard = (props: VideoCardProps) => {
  const video = props.video || props;

  const id = video.id || "";
  const title = video.title || "Untitled";
  const thumbnail = video.thumbnail || "/placeholder.svg";
  const creator = video.creator || "SaraTube";
  const views = video.views || 0;
  const likes = video.likes || 0;
  const comments = video.comments || 0;
  const duration = video.duration || "";
  const ageRecommendation = video.ageRecommendation;

  const [isHovering, setIsHovering] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { theme } = useTheme();
  const { triggerReward } = useReward();

  const activeChildAge = localStorage.getItem("activeChildAge");
  const childAge = activeChildAge ? Number(activeChildAge) : null;
  const isParent = !!localStorage.getItem("saratube_token");

  const suitability = ageRecommendation
    ? getAgeSuitability(childAge, ageRecommendation)
    : "unknown";

  const ageBadge = getAgeBadgeStyle(suitability);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    triggerReward(rect.left + rect.width / 2, rect.top, "like");

    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    toast.info("Local hide/delete is not connected yet.");
    setShowDeleteDialog(false);
  };

  const formatViews = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <>
      <Link to={`/watch/${id}`}>
        <motion.div
          className={`group relative ${theme.cardBg} rounded-3xl overflow-hidden shadow-card hover:shadow-glow transition-all duration-300`}
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <div
            className="relative aspect-video overflow-hidden"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${theme.primary} flex items-center justify-center text-white shadow-lg transform transition-all duration-300 ${isHovering ? "scale-110 opacity-100" : "scale-90 opacity-80"}`}>
                <Play className="w-8 h-8 ml-1" fill="currentColor" />
              </div>
            </div>

            {duration && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                {duration}
              </div>
            )}

            {ageRecommendation && (
              <div className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-lg ${ageBadge}`}>
                {ageRecommendation}
              </div>
            )}

            {isParent && (
              <button
                onClick={handleDelete}
                className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Hide/delete later"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-4 space-y-3">
            <h3 className="font-display text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>

            <p className="text-sm text-muted-foreground">
              {creator}
            </p>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatViews(views)} views</span>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 ${isLiked ? "text-red-500" : "hover:text-red-500"} transition-colors`}
                >
                  <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
                  <span>{likeCount}</span>
                </button>

                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{comments}</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Local media action not ready
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hide/delete will be connected after local upload and media storage are migrated.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default VideoCard;
