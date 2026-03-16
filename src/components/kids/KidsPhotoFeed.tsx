import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Image as ImageIcon, X, ChevronLeft, ChevronRight, Play, Pause, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const KidsPhotoFeed = () => {
  const { childSession, isChildActive } = useChildSession();
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!isChildActive || !childSession?.userId) {
        setPhotos([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("kids_photos")
          .select("*")
          .eq("child_profile_id", childSession.userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPhotos(data || []);
      } catch (error) {
        console.error("Error fetching photos for kid:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [childSession?.userId, isChildActive]);

  const nextPhoto = useCallback(() => {
    if (currentIndex === null || photos.length === 0) return;
    setCurrentIndex((prev) => (prev! + 1) % photos.length);
  }, [currentIndex, photos.length]);

  const prevPhoto = useCallback(() => {
    if (currentIndex === null || photos.length === 0) return;
    setCurrentIndex((prev) => (prev! - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSlideshowActive && currentIndex !== null) {
      interval = setInterval(() => {
        nextPhoto();
      }, 5000); // 5 seconds per photo
    }
    return () => clearInterval(interval);
  }, [isSlideshowActive, currentIndex, nextPhoto]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentIndex === null) return;
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, nextPhoto, prevPhoto]);

  const closeLightbox = () => {
    setCurrentIndex(null);
    setIsSlideshowActive(false);
  };

  const startSlideshow = (index: number = 0) => {
    setCurrentIndex(index);
    setIsSlideshowActive(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-xl font-bold text-muted-foreground mb-2">
          No photos yet!
        </h3>
        <p className="text-sm text-muted-foreground">
          Ask your parents to share some fun photos with you! ✨
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Header with Slideshow Button */}
      <div className="flex justify-between items-center mb-8 bg-white/40 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-white/20">
        <p className="text-muted-foreground font-medium">
          {photos.length} wonderful memory{photos.length > 1 ? "ies" : ""} shared with you ✨
        </p>
        <Button 
          onClick={() => startSlideshow(0)}
          className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:scale-105 transition-transform px-6 shadow-lg gap-2"
        >
          <Play className="w-4 h-4 fill-current" />
          Play All
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="group cursor-pointer"
            onClick={() => setCurrentIndex(index)}
          >
            <Card className="overflow-hidden rounded-3xl shadow-card border-none hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-0 relative aspect-square">
                <img
                  src={photo.photo_url}
                  alt={photo.caption || "Photo"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Maximize2 className="text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300" />
                </div>
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-white text-xs font-medium drop-shadow-sm truncate">
                      {photo.caption}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Lightbox / Slideshow Overlay */}
      <AnimatePresence>
        {currentIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center backdrop-blur-sm"
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center text-white bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center gap-4">
                <p className="font-display font-medium text-lg">
                  {currentIndex + 1} / {photos.length}
                </p>
                {photos[currentIndex].caption && (
                  <span className="hidden md:inline text-white/70">|</span>
                )}
                <p className="hidden md:inline text-white/90">
                  {photos[currentIndex].caption}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full"
                  onClick={() => setIsSlideshowActive(!isSlideshowActive)}
                >
                  {isSlideshowActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full ml-2"
                  onClick={closeLightbox}
                >
                  <X className="w-8 h-8" />
                </Button>
              </div>
            </div>

            {/* Photo Container */}
            <div className="relative w-full h-full flex items-center justify-center px-4 md:px-20 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={photos[currentIndex].id}
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0, 
                    scale: [1, 1.05], // Ken Burns subtle zoom
                  }}
                  exit={{ opacity: 0, x: -20, scale: 1.1 }}
                  transition={{ 
                    duration: 0.8,
                    scale: { duration: 5, ease: "linear" } // Active during the 5s interval
                  }}
                  className="relative max-w-5xl max-h-[80vh] w-full h-full flex items-center justify-center"
                >
                  <img
                    src={photos[currentIndex].photo_url}
                    alt={photos[currentIndex].caption || "Photo"}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                  />
                  {photos[currentIndex].caption && (
                    <div className="absolute -bottom-16 left-0 right-0 text-center px-4 md:hidden">
                      <p className="text-white text-lg font-medium">
                        {photos[currentIndex].caption}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              {!isSlideshowActive && (
                <>
                  <button
                    className="absolute left-4 md:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    onClick={prevPhoto}
                  >
                    <ChevronLeft className="w-10 h-10" />
                  </button>
                  <button
                    className="absolute right-4 md:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    onClick={nextPhoto}
                  >
                    <ChevronRight className="w-10 h-10" />
                  </button>
                </>
              )}
            </div>

            {/* Subtitles / Caption for Slideshow */}
            {isSlideshowActive && photos[currentIndex].caption && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-12 px-6 py-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10"
              >
                <p className="text-white text-xl font-medium">
                  {photos[currentIndex].caption}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KidsPhotoFeed;
