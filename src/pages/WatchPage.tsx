import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Download, Eye, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import ThemedLayout from "@/components/layout/ThemedLayout";
import AIChatBox from "@/components/ai/AIChatBox";
import CommentSection from "@/components/video/CommentSection";
import { Button } from "@/components/ui/button";
import VideoGrid from "@/components/video/VideoGrid";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getVideoById, sampleVideos, VideoItem } from "@/data/videoData";

const WatchPage = () => {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const { theme } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    if (!id) return;

    const sampleVideo = getVideoById(id);

    if (sampleVideo) {
      setVideo(sampleVideo);
      setLikes(sampleVideo.likes);
    } else {
      setVideo(null);
    }

    setLoading(false);
  }, [id]);

  // Local screen-time tracking will be migrated later.


  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };
  
  const formatViews = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <ThemedLayout showFooter={false}>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </ThemedLayout>
    );
  }

  if (!video) {
    return (
      <ThemedLayout showFooter={false}>
        <div className="container px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Video not found</h1>
          <Link to="/">
            <Button className="mt-4">Go Back Home</Button>
          </Link>
        </div>
      </ThemedLayout>
    );
  }

  const isYoutube = !!video.youtubeId;

  return (
    <ThemedLayout showFooter={false}>
      <div className="container px-4 py-6">
        <Link to="/">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            {t("watch.back")}
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-video bg-foreground/10 rounded-3xl overflow-hidden shadow-card">
              {isYoutube ? (
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&autoplay=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <video 
                  src={(video as any).videoUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain bg-black"
                />
              )}
            </div>

            <div className={`${theme.cardBg} rounded-3xl shadow-card p-6`}>
              <h1 className={`font-display text-2xl md:text-3xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                {video.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatViews(video.views)} {t("watch.views")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {t("watch.ago")}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-4 p-3 bg-muted/50 rounded-2xl">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${theme.primary} flex items-center justify-center text-white font-bold text-lg`}>
                  {video.creator[0]}
                </div>
                <div>
                  <h3 className="font-display font-bold">{video.creator}</h3>
                  <p className="text-sm text-muted-foreground">Parent Content</p>
                </div>
              </div>

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
                  {t("watch.share")}
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-5 w-5" />
                  {t("watch.save")}
                </Button>
              </div>

              <div className="mt-4 p-4 bg-muted/50 rounded-2xl">
                <p className="text-sm">{video.description}</p>
              </div>
            </div>

            <CommentSection />
          </div>

          <div className="space-y-6">
            <AIChatBox videoTitle={video.title} />

            <div className={`${theme.cardBg} rounded-3xl shadow-card p-4`}>
              <h3 className={`font-display text-lg font-bold flex items-center gap-2 mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                <span>{theme.emoji}</span>
                {t("watch.next")}
              </h3>
              <div className="space-y-4">
                <VideoGrid category={video.category} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemedLayout>
  );
};

export default WatchPage;
