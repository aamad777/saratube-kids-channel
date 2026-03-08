import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface KidsPhoto {
  id: string;
  child_profile_id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
}

interface KidsPhotoGalleryProps {
  selectedChildId: string | null;
  childName?: string;
}

const KidsPhotoGallery = ({ selectedChildId, childName }: KidsPhotoGalleryProps) => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<KidsPhoto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPhotos = async () => {
    if (!user || !selectedChildId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("kids_photos")
        .select("*")
        .eq("child_profile_id", selectedChildId)
        .eq("parent_user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error("Error fetching photos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [selectedChildId, user]);

  const deletePhoto = async (photo: KidsPhoto) => {
    try {
      await supabase.from("kids_photos").delete().eq("id", photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      toast.success("Photo deleted");
    } catch {
      toast.error("Failed to delete photo");
    }
  };

  if (!selectedChildId) return null;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          {childName ? `${childName}'s Photos` : "Kid's Photos"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group rounded-xl overflow-hidden border border-border bg-muted"
              >
                <img
                  src={photo.photo_url}
                  alt={photo.caption || "Photo"}
                  className="w-full aspect-square object-cover"
                />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm px-2 py-1">
                    <p className="text-xs text-foreground truncate">{photo.caption}</p>
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deletePhoto(photo)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <p className="absolute top-2 left-2 text-[10px] bg-background/70 px-1.5 py-0.5 rounded-full text-muted-foreground">
                  {new Date(photo.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Image className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No photos shared yet 📷</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KidsPhotoGallery;
