import { useState, useEffect } from "react";
import { Upload, Video, Image, Sparkles, X, Check, Clock, Users, Calendar, Loader2, Link as LinkIcon } from "lucide-react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface LinkedChild {
  child_user_id: string;
  display_name: string;
}

const CATEGORIES = ["Music & Dance", "Stories", "Art & Crafts", "Science", "Games", "Animals"];

const UploadPage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [urlConfirmed, setUrlConfirmed] = useState(false);
  const hasVideo = videoFile !== null || (uploadMode === "url" && urlConfirmed && videoUrl.trim() !== "");

  // Fetch linked children for parent
  useEffect(() => {
    const fetchLinkedChildren = async () => {
      if (!user || !profile?.is_parent) return;
      
      const { data: links } = await supabase
        .from("parent_child_links")
        .select("child_user_id")
        .eq("parent_user_id", user.id);

      if (links && links.length > 0) {
        const childIds = links.map(l => l.child_user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", childIds);

        if (profiles) {
          setLinkedChildren(profiles.map(p => ({
            child_user_id: p.user_id,
            display_name: p.display_name
          })));
        }
      }
    };

    fetchLinkedChildren();
  }, [user, profile]);

  // Redirect non-parents
  useEffect(() => {
    if (profile && !profile.is_parent) {
      toast.error("Only parents can upload videos");
      navigate("/");
    }
  }, [profile, navigate]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("video/")) {
        setVideoFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setThumbnailFile(file);
    }
  };

  const toggleChildSelection = (childId: string) => {
    setSelectedChildren(prev => 
      prev.includes(childId) 
        ? prev.filter(id => id !== childId)
        : [...prev, childId]
    );
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoUrl("");
    setUrlConfirmed(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !title || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!hasVideo) {
      toast.error("Please upload a video file or enter a video URL");
      return;
    }

    if (selectedChildren.length === 0) {
      toast.error("Please select at least one child who can watch this video");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let finalVideoUrl = videoUrl.trim();

      // Upload video file if using file mode
      if (uploadMode === "file" && videoFile) {
        const videoPath = `${user.id}/${Date.now()}-${videoFile.name}`;
        setUploadProgress(20);
        
        const { error: videoError } = await supabase.storage
          .from("videos")
          .upload(videoPath, videoFile);

        if (videoError) throw videoError;
        setUploadProgress(60);

        const { data: videoUrlData } = supabase.storage
          .from("videos")
          .getPublicUrl(videoPath);

        finalVideoUrl = videoUrlData.publicUrl;
      } else {
        setUploadProgress(60);
      }

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbPath = `${user.id}/thumbs/${Date.now()}-${thumbnailFile.name}`;
        const { error: thumbError } = await supabase.storage
          .from("videos")
          .upload(thumbPath, thumbnailFile);

        if (!thumbError) {
          const { data: thumbUrlData } = supabase.storage
            .from("videos")
            .getPublicUrl(thumbPath);
          thumbnailUrl = thumbUrlData.publicUrl;
        }
      }
      setUploadProgress(80);

      // Insert video record
      const { data: video, error: insertError } = await supabase
        .from("videos")
        .insert({
          title,
          description,
          category,
          video_url: finalVideoUrl,
          thumbnail_url: thumbnailUrl,
          uploaded_by: user.id,
          available_from: availableFrom || null,
          available_until: availableUntil || null,
          is_public: false
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Grant access to selected children
      const accessRecords = selectedChildren.map(childId => ({
        video_id: video.id,
        child_user_id: childId,
        granted_by: user.id
      }));

      const { error: accessError } = await supabase
        .from("video_child_access")
        .insert(accessRecords);

      if (accessError) throw accessError;

      setUploadProgress(100);
      toast.success("Video added successfully! 🎉");
      navigate("/parent");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to add video");
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8 text-center">
          <p className="text-muted-foreground">Please sign in to upload videos.</p>
          <Button asChild className="mt-4">
            <Link to="/signin">Sign In</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-button mb-4">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Upload Your Video! 🎬
            </h1>
            <p className="text-muted-foreground">
              Share your awesome creations with friends!
            </p>
          </div>

          {!hasVideo ? (
            /* Upload mode selection and input */
            <div className="space-y-6">
              {/* Mode toggle */}
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant={uploadMode === "file" ? "default" : "outline"}
                  onClick={() => setUploadMode("file")}
                  className="rounded-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={uploadMode === "url" ? "default" : "outline"}
                  onClick={() => setUploadMode("url")}
                  className="rounded-full"
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Paste URL
                </Button>
              </div>

              {uploadMode === "file" ? (
                /* File upload area */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`relative border-4 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-primary bg-primary/10 scale-[1.02]"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  onClick={() => document.getElementById("video-input")?.click()}
                >
                  <input
                    id="video-input"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-sara-pink-light flex items-center justify-center">
                      <Video className="h-10 w-10 text-sara-pink" />
                    </div>
                    <div>
                      <p className="font-display text-xl font-bold mb-2">
                        Drag & Drop Your Video Here
                      </p>
                      <p className="text-muted-foreground">
                        or click to browse files
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        MP4, MOV
                      </span>
                      <span className="flex items-center gap-1">
                        <Image className="h-4 w-4" />
                        Max 500MB
                      </span>
                    </div>
                  </div>

                  {/* Floating decorations */}
                  <div className="absolute top-4 right-4 animate-float">
                    <Sparkles className="h-6 w-6 text-sara-yellow" />
                  </div>
                  <div className="absolute bottom-4 left-4 animate-float" style={{ animationDelay: "1s" }}>
                    <Sparkles className="h-5 w-5 text-sara-purple" />
                  </div>
                </div>
              ) : (
                /* URL input area */
                <div className="relative border-4 border-dashed rounded-3xl p-8 text-center transition-all border-border hover:border-primary/50 hover:bg-muted/50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-sara-blue-light flex items-center justify-center">
                      <LinkIcon className="h-10 w-10 text-sara-blue" />
                    </div>
                    <div>
                      <p className="font-display text-xl font-bold mb-2">
                        Paste Video URL
                      </p>
                      <p className="text-muted-foreground mb-4">
                        YouTube, Vimeo, or direct video link
                      </p>
                    </div>
                    <Input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="max-w-md rounded-2xl text-center"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (videoUrl.trim()) {
                          setUrlConfirmed(true);
                        }
                      }}
                      disabled={!videoUrl.trim()}
                      className="rounded-full"
                    >
                      Continue with URL
                    </Button>
                  </div>

                  {/* Floating decorations */}
                  <div className="absolute top-4 right-4 animate-float">
                    <Sparkles className="h-6 w-6 text-sara-yellow" />
                  </div>
                  <div className="absolute bottom-4 left-4 animate-float" style={{ animationDelay: "1s" }}>
                    <Sparkles className="h-5 w-5 text-sara-purple" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Upload form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Video preview */}
              <div className="relative bg-card rounded-3xl p-4 shadow-card">
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 rounded-xl bg-gradient-hero flex items-center justify-center">
                    {uploadMode === "url" ? (
                      <LinkIcon className="h-8 w-8 text-primary-foreground" />
                    ) : (
                      <Video className="h-8 w-8 text-primary-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {videoFile ? (
                      <>
                        <p className="font-display font-bold truncate">{videoFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-display font-bold text-sm">Video URL</p>
                        <p className="text-sm text-muted-foreground truncate">{videoUrl}</p>
                      </>
                    )}
                    {isUploading && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-button rounded-full transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={clearVideo}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                    disabled={isUploading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Thumbnail */}
              <div>
                <label className="font-display font-bold text-sm mb-2 block">
                  Thumbnail 🖼️ (optional)
                </label>
                <div className="flex items-center gap-4">
                  {thumbnailFile ? (
                    <div className="relative">
                      <img 
                        src={URL.createObjectURL(thumbnailFile)} 
                        alt="Thumbnail preview"
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setThumbnailFile(null)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleThumbnailSelect}
                      />
                      <div className="w-24 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary transition-colors">
                        <Image className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </label>
                  )}
                  <span className="text-sm text-muted-foreground">
                    Add a thumbnail image for your video
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="font-display font-bold text-sm mb-2 block">
                  Video Title ✨
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your video an awesome title!"
                  className="rounded-2xl"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-display font-bold text-sm mb-2 block">
                  Description 📝
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell everyone what your video is about..."
                  className="rounded-2xl min-h-[100px]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="font-display font-bold text-sm mb-2 block">
                  Category 🎨
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={category === cat ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Who can watch */}
              <div className="bg-card rounded-3xl p-6 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <label className="font-display font-bold text-sm">
                    Who can watch? 👀
                  </label>
                </div>
                {linkedChildren.length > 0 ? (
                  <div className="space-y-3">
                    {linkedChildren.map((child) => (
                      <div key={child.child_user_id} className="flex items-center gap-3">
                        <Checkbox
                          id={child.child_user_id}
                          checked={selectedChildren.includes(child.child_user_id)}
                          onCheckedChange={() => toggleChildSelection(child.child_user_id)}
                        />
                        <Label 
                          htmlFor={child.child_user_id}
                          className="cursor-pointer font-medium"
                        >
                          {child.display_name}
                        </Label>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={() => setSelectedChildren(linkedChildren.map(c => c.child_user_id))}
                    >
                      Select All
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No linked children found. <Link to="/parent" className="text-primary underline">Link a child account</Link> first.
                  </p>
                )}
              </div>

              {/* Scheduling */}
              <div className="bg-card rounded-3xl p-6 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-primary" />
                  <label className="font-display font-bold text-sm">
                    When can they watch? ⏰
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="available-from" className="text-sm text-muted-foreground">
                      Available from (optional)
                    </Label>
                    <Input
                      id="available-from"
                      type="datetime-local"
                      value={availableFrom}
                      onChange={(e) => setAvailableFrom(e.target.value)}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="available-until" className="text-sm text-muted-foreground">
                      Available until (optional)
                    </Label>
                    <Input
                      id="available-until"
                      type="datetime-local"
                      value={availableUntil}
                      onChange={(e) => setAvailableUntil(e.target.value)}
                      className="mt-1 rounded-xl"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Leave empty for no time restrictions
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" asChild disabled={isUploading}>
                  <Link to="/">Cancel</Link>
                </Button>
                <Button 
                  variant="hero" 
                  className="flex-1 gap-2"
                  disabled={isUploading || !category || selectedChildren.length === 0 || !hasVideo}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {uploadMode === "url" ? "Saving..." : "Uploading..."}
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      {uploadMode === "url" ? "Add Video!" : "Publish Video!"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
