import { useState, useEffect } from "react";
import { Upload, Video, Image as ImageIcon, Sparkles, X, Check, Clock, Users, Calendar, Loader2, Link as LinkIcon, AlertCircle } from "lucide-react";
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
import { useLanguage } from "@/contexts/LanguageContext";

interface LinkedChild {
  child_user_id: string;
  display_name: string;
}

const CATEGORIES = ["Music & Dance", "Stories", "Art & Crafts", "Science", "Games", "Animals"];

const UploadPage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [mediaType, setMediaType] = useState<"video" | "photo" | "mixed">("video");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url" | "bulk">("file");
  
  const [files, setFiles] = useState<File[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [urlConfirmed, setUrlConfirmed] = useState(false);
  
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [caption, setCaption] = useState("");
  
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  
  // Bulk Scan state
  const [bulkBaseUrl, setBulkBaseUrl] = useState("");
  const [bulkContent, setBulkContent] = useState("");
  const [detectedItems, setDetectedItems] = useState<{url: string, type: 'video' | 'photo', name: string}[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  
  const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const hasMedia = files.length > 0 || 
    (uploadMode === "url" && urlConfirmed && (mediaType === "video" ? videoUrl.trim() !== "" : photoUrl.trim() !== "")) ||
    (uploadMode === "bulk" && urlConfirmed && detectedItems.length > 0);

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

  // Refresh profile and redirect non-parents
  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user]);

  useEffect(() => {
    if (profile && !profile.is_parent) {
      toast.error("Only parents can upload media");
      navigate("/");
    }
  }, [profile, navigate]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (mediaType === "video") return file.type.startsWith("video/") || file.name.endsWith(".mkv");
      if (mediaType === "photo") return file.type.startsWith("image/");
      return false;
    });

    if (validFiles.length !== newFiles.length) {
      toast.error(`Some files were ignored because they are not ${mediaType}s.`);
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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

  const clearAll = () => {
    setFiles([]);
    setVideoUrl("");
    setPhotoUrl("");
    setUrlConfirmed(false);
    setThumbnailFile(null);
    setBulkBaseUrl("");
    setBulkContent("");
    setDetectedItems([]);
  };

  const handleScanLinks = async () => {
    if (!bulkBaseUrl.trim()) return;
    setIsScanning(true);
    
    try {
        // Since we can't truly scan a private NAS folder via CORS, 
        // we'll provide a way for the user to paste text and we'll extract URLs/filenames
        const lines = bulkContent.split('\n').map(l => l.trim()).filter(l => l);
        const baseUrl = bulkBaseUrl.endsWith('/') ? bulkBaseUrl : bulkBaseUrl + '/';
        
        const items = lines.map(line => {
            const isVideo = line.match(/\.(mp4|mkv|mov|webm)$/i);
            const isPhoto = line.match(/\.(jpg|jpeg|png|webp|gif)$/i);
            
            let url = line;
            if (!line.startsWith('http')) {
                url = baseUrl + line;
            }
            
            return {
                url,
                type: isVideo ? 'video' : 'photo' as 'video' | 'photo',
                name: line.split('/').pop() || 'Media Item'
            };
        }).filter(item => item.type);

        if (items.length === 0) {
            toast.error("No media files detected in the text below. Make sure to list filenames with extensions (like .mp4 or .jpg)");
        } else {
            setDetectedItems(items);
            toast.success(`Detected ${items.length} media items!`);
        }
    } catch (error) {
        toast.error("Failed to scan links");
    } finally {
        setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (!hasMedia) {
      toast.error("Please select files before uploading");
      return;
    }

    if (selectedChildren.length === 0) {
      toast.error("Please select at least one child who can view this");
      return;
    }

    if (mediaType === "video" && !category) {
      toast.error("Please select a category for the video(s)");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (uploadMode === "bulk" || mediaType === "mixed") {
          // Handle both files and links in mixed/bulk mode
          const allItems = [
              ...files.map(f => ({ file: f, url: null, type: f.type.startsWith('image/') ? 'photo' : 'video' })),
              ...detectedItems.map(d => ({ file: null, url: d.url, type: d.type }))
          ];

          for (let i = 0; i < allItems.length; i++) {
              const item = allItems[i];
              let finalUrl = item.url;
              
              if (item.file) {
                  const ext = item.file.name.split('.').pop() || 'tmp';
                  const storageBucket = item.type === 'photo' ? 'kids-photos' : 'videos';
                  const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
                  
                  const { error: uploadError } = await supabase.storage
                    .from(storageBucket)
                    .upload(filePath, item.file);
                    
                  if (uploadError) throw uploadError;
                  
                  const { data: urlData } = supabase.storage
                    .from(storageBucket)
                    .getPublicUrl(filePath);
                    
                  finalUrl = urlData.publicUrl;
              }

              if (!finalUrl) continue;

              if (item.type === 'photo') {
                  const photoRecords = selectedChildren.map(childId => ({
                    child_profile_id: childId,
                    parent_user_id: user.id,
                    photo_url: finalUrl as string,
                    caption: caption || null
                  }));
                  const { error } = await supabase.from("kids_photos").insert(photoRecords);
                  if (error) throw error;
              } else {
                  const itemTitle = item.file ? item.file.name.split('.')[0] : (item.url ? item.url.split('/').pop()?.split('.')[0] : 'Video');
                  const { data: video, error } = await (supabase as any)
                    .from("videos")
                    .insert({
                      title: title || itemTitle,
                      description,
                      category: category || CATEGORIES[0],
                      video_url: finalUrl,
                      uploaded_by: user.id,
                      available_from: availableFrom || null,
                      available_until: availableUntil || null,
                      is_public: false
                    })
                    .select()
                    .single();
                  if (error) throw error;
                  
                  const accessRecords = selectedChildren.map(childId => ({
                    video_id: video.id,
                    child_user_id: childId,
                    granted_by: user.id
                  }));
                  await supabase.from("video_child_access").insert(accessRecords);
              }
              setUploadProgress(Math.round(((i + 1) / allItems.length) * 100));
          }
          toast.success(`Successfully added ${allItems.length} media items! 🎉`);
      } 
      else if (mediaType === "photo") {
        if (uploadMode === "url") {
          const photoRecords = selectedChildren.map(childId => ({
            child_profile_id: childId,
            parent_user_id: user.id,
            photo_url: photoUrl,
            caption: caption || null
          }));

          const { error: insertError } = await supabase.from("kids_photos").insert(photoRecords);
          if (insertError) throw insertError;
          setUploadProgress(100);
        } else {
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const ext = file.name.split('.').pop() || 'jpg';
            const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            
            const { error: uploadError } = await supabase.storage
              .from("kids-photos")
              .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
              .from("kids-photos")
              .getPublicUrl(filePath);

            const photoRecords = selectedChildren.map(childId => ({
              child_profile_id: childId,
              parent_user_id: user.id,
              photo_url: urlData.publicUrl,
              caption: caption || null
            }));

            const { error: insertError } = await supabase.from("kids_photos").insert(photoRecords);
            if (insertError) throw insertError;

            setUploadProgress(Math.round(((i + 1) / files.length) * 100));
          }
        }
        toast.success(`Successfully added photo(s)! 🎉`);
        
      } else if (mediaType === "video") {
        if (uploadMode === "url") {
            const { data: video, error: insertError } = await supabase
                .from("videos")
                .insert({
                  title: title || "Linked Video",
                  description,
                  category,
                  video_url: videoUrl,
                  thumbnail_url: null,
                  uploaded_by: user.id,
                  available_from: availableFrom || null,
                  available_until: availableUntil || null,
                  is_public: false
                })
                .select()
                .single();
    
            if (insertError) throw insertError;
    
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
            
        } else {
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
              const filePath = `${user.id}/${Date.now()}-${safeName}`;
              
              const { error: uploadError } = await supabase.storage
                .from("videos")
                .upload(filePath, file);
    
              if (uploadError) throw uploadError;
    
              const { data: urlData } = supabase.storage
                .from("videos")
                .getPublicUrl(filePath);
    
              let thumbnailUrl = null;
              if (files.length === 1 && thumbnailFile) {
                const thumbSafeName = thumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const thumbPath = `${user.id}/thumbs/${Date.now()}-${thumbSafeName}`;
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
    
              const finalTitle = files.length === 1 && title ? title : (title ? `${title} - ${file.name}` : file.name.split('.')[0]);
    
              const { data: video, error: insertError } = await supabase
                .from("videos")
                .insert({
                  title: finalTitle,
                  description,
                  category,
                  video_url: urlData.publicUrl,
                  thumbnail_url: thumbnailUrl,
                  uploaded_by: user.id,
                  available_from: availableFrom || null,
                  available_until: availableUntil || null,
                  is_public: false
                })
                .select()
                .single();
    
              if (insertError) throw insertError;
    
              const accessRecords = selectedChildren.map(childId => ({
                video_id: video.id,
                child_user_id: childId,
                granted_by: user.id
              }));
    
              const { error: accessError } = await supabase
                .from("video_child_access")
                .insert(accessRecords);
    
              if (accessError) throw accessError;
              
              setUploadProgress(Math.round(((i + 1) / files.length) * 100));
            }
        }
        toast.success(`Successfully added video(s)! 🎉`);
      }

      navigate("/parent");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload");
    } finally {
      setIsUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-8 text-center">
          <p className="text-muted-foreground">{t("upload.signin.prompt")}</p>
          <Button asChild className="mt-4">
            <Link to="/signin">{t("sign.in")}</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-button mb-4">
              <Upload className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Parent Upload
            </h1>
            <p className="text-muted-foreground">
              Add new videos or photos for your kids to enjoy
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <Button 
                variant={mediaType === "video" ? "default" : "outline"} 
                onClick={() => { setMediaType("video"); clearAll(); }}
                className="w-32 rounded-full"
            >
                <Video className="w-4 h-4 mr-2" /> Videos
            </Button>
             <Button 
                variant={mediaType === "photo" ? "default" : "outline"} 
                onClick={() => { setMediaType("photo"); clearAll(); }}
                className="w-32 rounded-full"
            >
                <ImageIcon className="w-4 h-4 mr-2" /> Photos
            </Button>
            <Button 
                variant={mediaType === "mixed" ? "default" : "outline"} 
                onClick={() => { setMediaType("mixed"); clearAll(); }}
                className="w-32 rounded-full"
            >
                <Sparkles className="w-4 h-4 mr-2" /> Mixed
            </Button>
          </div>

          {!hasMedia ? (
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
                {t("upload.file")}
                </Button>
                <Button
                type="button"
                variant={uploadMode === "url" ? "default" : "outline"}
                onClick={() => setUploadMode("url")}
                className="rounded-full"
                >
                <LinkIcon className="h-4 w-4 mr-2" />
                {t("upload.paste.url")}
                </Button>
                <Button
                type="button"
                variant={uploadMode === "bulk" ? "default" : "outline"}
                onClick={() => setUploadMode("bulk")}
                className="rounded-full"
                >
                <Users className="h-4 w-4 mr-2" />
                Bulk Import
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
                  onClick={() => document.getElementById("media-input")?.click()}
                >
                  <input
                    id="media-input"
                    type="file"
                    accept={mediaType === "video" ? "video/*,.mkv,.webm" : "image/*"}
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-sara-blue-light flex items-center justify-center">
                      {mediaType === "video" ? (
                          <Video className="h-10 w-10 text-sara-blue" />
                      ) : (
                          <ImageIcon className="h-10 w-10 text-sara-blue" />
                      )}
                    </div>
                    <div>
                      <p className="font-display text-xl font-bold mb-2">
                        {t("upload.drag")} {mediaType}s
                      </p>
                      <p className="text-muted-foreground">
                        {t("upload.browse")} (multiple allowed)
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground justify-center">
                      <span className="flex items-center gap-1">
                        {mediaType === "video" ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                        {mediaType === "video" ? "MP4, MOV, MKV" : "JPG, PNG"}
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
              ) : uploadMode === "url" ? (
                /* URL input area */
                <div className="relative border-4 border-dashed rounded-3xl p-8 text-center transition-all border-border hover:border-primary/50 hover:bg-muted/50">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-sara-blue-light flex items-center justify-center">
                      <LinkIcon className="h-10 w-10 text-sara-blue" />
                    </div>
                    <div>
                      <p className="font-display text-xl font-bold mb-2">
                        {mediaType === "video" ? t("upload.paste.title") : "Paste Photo URL"}
                      </p>
                      <p className="text-muted-foreground mb-4">
                        {mediaType === "video" ? t("upload.paste.desc") : "Paste a link to a photo from your NAS or the web"}
                      </p>
                    </div>
                    <Input
                      type="url"
                      value={mediaType === "video" ? videoUrl : photoUrl}
                      onChange={(e) => mediaType === "video" ? setVideoUrl(e.target.value) : setPhotoUrl(e.target.value)}
                      placeholder={mediaType === "video" ? "https://your-nas-ip/videos/movie.mp4" : "https://your-nas-ip/photos/family.jpg"}
                      className="max-w-md rounded-2xl text-center"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if ((mediaType === "video" && videoUrl.trim()) || (mediaType === "photo" && photoUrl.trim())) {
                          setUrlConfirmed(true);
                        }
                      }}
                      disabled={(mediaType === "video" && !videoUrl.trim()) || (mediaType === "photo" && !photoUrl.trim())}
                      className="rounded-full"
                    >
                      {t("upload.continue.url")}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Bulk Import area */
                <div className="relative border-4 border-dashed rounded-3xl p-8 text-center transition-all border-border hover:border-primary/50 hover:bg-muted/50">
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-sara-purple-light flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-sara-purple" />
                    </div>
                    <div className="max-w-md w-full text-center">
                      <p className="font-display text-xl font-bold mb-2">Bulk NAS Scanner</p>
                      <p className="text-muted-foreground mb-6">
                        Paste your folder link and list the filenames you want to import.
                      </p>
                      
                      <div className="space-y-4 text-left">
                        <div>
                          <Label className="text-xs ml-2 mb-1">Base URL (Folder Path)</Label>
                          <Input
                            value={bulkBaseUrl}
                            onChange={(e) => setBulkBaseUrl(e.target.value)}
                            placeholder="http://QuickConnect.to/aamad777/family-media/"
                            className="rounded-2xl"
                          />
                        </div>
                        <div>
                          <Label className="text-xs ml-2 mb-1">Filenames (One per line)</Label>
                          <Textarea
                            value={bulkContent}
                            onChange={(e) => setBulkContent(e.target.value)}
                            placeholder="video1.mp4&#10;photo1.jpg&#10;movie2.mkv"
                            className="rounded-2xl min-h-[150px] font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      onClick={handleScanLinks}
                      disabled={!bulkBaseUrl.trim() || !bulkContent.trim() || isScanning}
                      className="rounded-full w-full max-w-xs gap-2"
                    >
                      {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Scan and Detect Media
                    </Button>
                    
                    {detectedItems.length > 0 && (
                        <div className="w-full mt-4 p-4 bg-muted/50 rounded-2xl border border-border">
                            <p className="font-bold text-sm mb-2 flex items-center justify-center gap-2">
                                <Check className="w-4 h-4 text-green-500" />
                                {detectedItems.length} items ready to import
                            </p>
                            <Button 
                                variant="hero" 
                                className="w-full rounded-full"
                                onClick={() => setUrlConfirmed(true)}
                            >
                                Continue with {detectedItems.length} Items
                            </Button>
                        </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Upload form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Files Preview */}
              <div className="bg-card rounded-3xl p-6 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">Selected Files ({files.length || 1})</h3>
                      <Button type="button" variant="ghost" size="sm" onClick={clearAll} disabled={isUploading}>
                          Clear All
                      </Button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {files.map((file, i) => (
                           <div key={i} className="flex items-center gap-4 bg-muted p-2 rounded-lg">
                                <div className="w-12 h-12 rounded bg-background flex items-center justify-center overflow-hidden shrink-0">
                                     {file.type.startsWith('image/') ? (
                                         <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                     ) : (
                                         <Video className="text-muted-foreground w-6 h-6" />
                                     )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / (1024*1024)).toFixed(1)} MB</p>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(i)} disabled={isUploading}>
                                    <X className="w-4 h-4" />
                                </Button>
                           </div>
                      ))}
                      {uploadMode === "url" && urlConfirmed && (
                           <div className="flex items-center gap-4 bg-muted p-2 rounded-lg">
                                <div className="w-12 h-12 rounded bg-background flex items-center justify-center overflow-hidden shrink-0">
                                     <LinkIcon className="text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{mediaType === "video" ? videoUrl : photoUrl}</p>
                                    <p className="text-xs text-muted-foreground">External URL</p>
                                </div>
                           </div>
                      )}
                  </div>
                  
                  {isUploading && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-button transition-all" style={{width: `${uploadProgress}%`}} />
                        </div>
                      </div>
                  )}
              </div>

              {/* Title & Description for Videos */}
              {mediaType === "video" && (
                <div className="space-y-6">
                    <div>
                        <label className="font-display font-bold text-sm mb-2 flex items-center gap-2">
                        {t("upload.video.title")}
                        {files.length > 1 && <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-normal">Optional for bulk</span>}
                        </label>
                        <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={files.length > 1 ? "Prefix title (e.g. My Trip) or leave blank to use filenames" : t("upload.title.placeholder")}
                        className="rounded-2xl"
                        required={files.length === 1 && uploadMode !== "url"}
                        />
                    </div>
    
                    <div>
                        <label className="font-display font-bold text-sm mb-2 block">
                        {t("upload.description")}
                        </label>
                        <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description for all selected videos"
                        className="rounded-2xl min-h-[100px]"
                        />
                    </div>
                </div>
              )}
              
              {/* Caption for Photos */}
              {mediaType === "photo" && (
                   <div>
                        <label className="font-display font-bold text-sm mb-2 block">
                        Photo Caption
                        </label>
                        <Textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        placeholder={files.length > 1 ? "Caption for all selected photos" : "Add a caption..."}
                        className="rounded-2xl min-h-[100px]"
                        />
                    </div>
              )}

              {/* Category (Videos only) */}
              {mediaType === "video" && (
                  <div>
                    <label className="font-display font-bold text-sm mb-2 block">
                      {t("upload.category")}
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
              )}
              
              {/* Thumbnail (Single Video only) */}
              {mediaType === "video" && files.length === 1 && uploadMode === "file" && (
                  <div>
                    <label className="font-display font-bold text-sm mb-2 block">
                      {t("upload.thumbnail")}
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
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        </label>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {t("upload.thumbnail.add")}
                      </span>
                    </div>
                  </div>
              )}

              {/* Who can watch */}
              <div className="bg-card rounded-3xl p-6 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-primary" />
                  <label className="font-display font-bold text-sm">
                    {t("upload.who.watch")}
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
                      {t("upload.select.all")}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("upload.no.children")} <Link to="/parent" className="text-primary underline">{t("upload.link.child")}</Link> first.
                  </p>
                )}
              </div>

              {/* Scheduling (Videos only) */}
              {mediaType === "video" && (
                  <div className="bg-card rounded-3xl p-6 shadow-card">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="h-5 w-5 text-primary" />
                      <label className="font-display font-bold text-sm">
                        {t("upload.when.watch")}
                      </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="available-from" className="text-sm text-muted-foreground">
                          {t("upload.available.from")}
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
                          {t("upload.available.until")}
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
                      {t("upload.no.restrict")}
                    </p>
                  </div>
              )}

              {/* Submit */}
              <div className="flex gap-4">
                <Button type="button" variant="outline" className="flex-1" onClick={clearAll} disabled={isUploading}>
                  {t("upload.cancel")}
                </Button>
                <Button 
                  type="submit"
                  variant="hero" 
                  className="flex-1 gap-2"
                  disabled={isUploading || (mediaType === "video" && !category) || selectedChildren.length === 0 || !hasMedia}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {uploadMode === "url" ? t("upload.saving") : t("upload.uploading")}
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      {uploadMode === "url" ? t("upload.add.video") : "Upload " + (files.length > 1 ? `${files.length} ` : "") + (mediaType === "video" ? "Video(s)" : "Photo(s)")}
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
