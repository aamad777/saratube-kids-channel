import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Download, Eye, Clock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import ThemedLayout from "@/components/layout/ThemedLayout";
import AIChatBox from "@/components/ai/AIChatBox";
import CommentSection from "@/components/video/CommentSection";
import { Button } from "@/components/ui/button";
import UnifiedMediaGrid from "@/components/home/UnifiedMediaGrid";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/contexts/LanguageContext";
import { getVideoById, VideoItem } from "@/data/videoData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

type LocalMedia = {
  id: string;
  media_type: "video" | "photo";
  title: string;
  description?: string;
  category?: string;
  public_url: string;
  thumbnail_url?: string;
  original_filename?: string;
};

const WatchPage = () => {
  const { id } = useParams<{ id: string }>();

  const [video, setVideo] = useState<VideoItem | null>(null);
  const [localMedia, setLocalMedia] = useState<LocalMedia | null>(null);

  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  const { theme } = useTheme();
  const { t } = useLanguage();

  const getMediaUrl = (url: string) => {
    if (!url) return "";
    return url.replace("http://localhost:4000", API_BASE_URL);
  };

  useEffect(() => {
    const loadMedia = async () => {
      if (!id) return;

      setLoading(true);
      setLocalMedia(null);
      setVideo(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/media/${id}`);
        const data = await response.json();

        if (response.ok && data.media) {
          setLocalMedia(data.media);
          setLikes(0);
          setLoading(false);
          return;
        }
      } catch {
        // fallback to sample video below
      }

      const sampleVideo = getVideoById(id);

      if (sampleVideo) {
        setVideo(sampleVideo);
        setLikes(sampleVideo.likes);
      }

      setLoading(false);
    };

    loadMedia();
  }, [id]);

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

  if (!video && !localMedia) {
    return (
      <ThemedLayout showFooter={false}>
        <div className="container px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Media not found</h1>
          <Link to="/">
            <Button className="mt-4">Go Back Home</Button>
          </Link>
        </div>
      </ThemedLayout>
    );
  }

  const title = localMedia?.title || video?.title || "Untitled";
  const description = localMedia?.description || video?.description || "";
  const category = localMedia?.category || video?.category || "general";
  const creator = video?.creator || "SaraTube Local";

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
              {localMedia ? (
                localMedia.media_type === "photo" ? (
                  <img
                    src={getMediaUrl(localMedia.public_url)}
                    alt={localMedia.title}
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <video
                    src={getMediaUrl(localMedia.public_url)}
                    controls
                    autoPlay
                    className="w-full h-full object-contain bg-black"
                  />
                )
              ) : video?.youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&autoplay=1`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              ) : (
                <video
                  src={(video as any)?.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain bg-black"
                />
              )}
            </div>

            <div className={`${theme.cardBg} rounded-3xl shadow-card p-6`}>
              <h1 className={`font-display text-2xl md:text-3xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatViews(video?.views || 0)} {t("watch.views")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Local media
                </span>
              </div>

              <div className="flex items-center gap-3 mt-4 p-3 bg-muted/50 rounded-2xl">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${theme.primary} flex items-center justify-center text-white font-bold text-lg`}>
                  {creator[0]}
                </div>
                <div>
                  <h3 className="font-display font-bold">{creator}</h3>
                  <p className="text-sm text-muted-foreground">{category}</p>
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
                <p className="text-sm">{description || "No description."}</p>
              </div>
            </div>

            <CommentSection />
          </div>

          <div className="space-y-6">
            <AIChatBox videoTitle={title} />

            <div className={`${theme.cardBg} rounded-3xl shadow-card p-4`}>
              <h3 className={`font-display text-lg font-bold flex items-center gap-2 mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                <span>{theme.emoji}</span>
                {t("watch.next")}
              </h3>

              <div className="space-y-4">
                <UnifiedMediaGrid filter="video" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ThemedLayout>
  );
};

export default WatchPage;
