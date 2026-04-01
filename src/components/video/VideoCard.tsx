import { Heart, MessageCircle, Play, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "@/hooks/useTheme";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { getAgeSuitability, getAgeBadgeStyle } from "@/utils/ageFilter";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  videoUrl,
}: VideoCardProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme } = useTheme();
  const { childSession } = useChildSession();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { triggerReward } = useReward();

  const isParent = profile?.is_parent === true;

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

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Check if this is a database video (uploaded) or a sample video (default)
      // Usually default videos have string IDs like "n1", "c1", "1", etc.
      // Uploaded videos have UUIDs.
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      if (isUuid) {
        // Delete child access records first
        await supabase
          .from("video_child_access")
          .delete()
          .eq("video_id", id);
        // Direct deletion of the uploaded video record
        const { error } = await supabase
          .from("videos")
          .delete()
          .eq("id", id);

        if (error) throw error;
        toast.success("Video removed successfully");
      } else {
        // Default video - hide it by adding to blocked_media
        const { error } = await (supabase as any)
          .from("blocked_media")
          .insert({
            media_id: id,
            parent_user_id: profile?.id
          });

        if (error) throw error;
        toast.success("Video hidden from feed");
      }
      
      // Refresh the page to reflect changes
      window.location.reload();
    } catch (error: any) {
      console.error("Error managing video:", error);
      toast.error(error.message || "Failed to remove video");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <Link to={`/watch/${id}`}>
      <div className={`group relative ${theme.cardBg} rounded-3xl overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1`}>
        {/* Media Container */}
        <div 
          className="relative aspect-video overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {thumbnail && thumbnail !== "/placeholder.svg" ? (
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : videoUrl ? (
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
              autoPlay={isHovering}
              onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
              onMouseOut={(e) => {
                const video = e.target as HTMLVideoElement;
                video.pause();
                video.currentTime = 0;
              }}
            />
          ) : (
            <img
              src="/placeholder.svg"
              alt={title}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Play overlay */}
          <div className={`absolute inset-0 bg-foreground/20 transition-opacity flex items-center justify-center ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
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

          {/* Delete button (Parents only) */}
          {isParent && (
            <button
              onClick={handleDelete}
              className="absolute top-2 right-12 p-2 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive backdrop-blur-sm transition-all hover:scale-110"
              title="Remove Video"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-2xl">
              <AlertTriangle className="text-destructive h-6 w-6" />
              Remove Video?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base py-2">
              Are you sure you want to remove "<strong>{title}</strong>"? This will delete it for everyone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full gap-2"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isDeleting ? "Removing..." : "Remove Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Link>
  );
};

export default VideoCard;
