import { useState, useRef } from "react";
import { Camera, Upload, Image, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface KidsPhotoUploadProps {
  onAvatarUpdated?: () => void;
}

const KidsPhotoUpload = ({ onAvatarUpdated }: KidsPhotoUploadProps) => {
  const { childSession } = useChildSession();
  const { user, profile, refreshProfile } = useAuth();
  const { theme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [mode, setMode] = useState<"avatar" | "share" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isChild = !!childSession;
  const activeId = isChild ? childSession.id : profile?.id;
  const parentId = isChild ? (profile?.user_id || user?.id) : user?.id;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file 📷");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !activeId) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${activeId}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      if (isChild) {
        await supabase
          .from("profiles")
          .update({ avatar_url: avatarUrl })
          .eq("id", childSession.id);
      } else {
        await supabase
          .from("profiles")
          .update({ avatar_url: avatarUrl })
          .eq("user_id", user?.id);
        await refreshProfile();
      }

      toast.success("Profile picture updated! 🎉");
      setPreview(null);
      setMode(null);
      onAvatarUpdated?.();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const uploadSharedPhoto = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file || !activeId || !parentId) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${activeId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("kids-photos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("kids-photos")
        .getPublicUrl(fileName);

      await supabase.from("kids_photos").insert({
        child_profile_id: activeId,
        parent_user_id: parentId,
        photo_url: urlData.publicUrl,
        caption: caption.trim() || null,
      });

      toast.success("Photo shared with parents! 📸");
      setPreview(null);
      setCaption("");
      setMode(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to share photo");
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = () => {
    if (mode === "avatar") uploadAvatar();
    else if (mode === "share") uploadSharedPhoto();
  };

  const resetState = () => {
    setPreview(null);
    setCaption("");
    setMode(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Mode selection */}
      {!mode && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => {
              setMode("avatar");
              fileInputRef.current?.click();
            }}
            className={`flex-1 gap-2 bg-gradient-to-r ${theme.primary} text-white hover:opacity-90`}
            size="lg"
          >
            <Camera className="w-5 h-5" />
            Change My Picture
          </Button>
          <Button
            onClick={() => {
              setMode("share");
              fileInputRef.current?.click();
            }}
            variant="outline"
            className="flex-1 gap-2"
            size="lg"
          >
            <Image className="w-5 h-5" />
            Share a Photo
          </Button>
        </div>
      )}

      {/* Preview */}
      <AnimatePresence>
        {preview && mode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative rounded-2xl overflow-hidden border-2 border-border bg-muted"
          >
            <button
              onClick={resetState}
              className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={preview}
              alt="Preview"
              className={`w-full ${mode === "avatar" ? "max-h-64 object-cover" : "max-h-80 object-contain"}`}
            />

            <div className="p-4 space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                {mode === "avatar" ? "🖼️ This will be your new profile picture" : "📸 Share this photo with your parents"}
              </p>

              {mode === "share" && (
                <Input
                  placeholder="Add a caption... (optional)"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  maxLength={200}
                />
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`flex-1 gap-2 bg-gradient-to-r ${theme.primary} text-white hover:opacity-90`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      {mode === "avatar" ? "Set as Profile Picture" : "Share Photo"}
                    </>
                  )}
                </Button>
                <Button variant="ghost" onClick={resetState}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KidsPhotoUpload;
