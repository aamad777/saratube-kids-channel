import { useState } from "react";
import { Upload, Video, Image, Sparkles, X, Check } from "lucide-react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";

const UploadPage = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploaded(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Would handle actual upload here
  };

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

          {!uploaded ? (
            /* Upload area */
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
              onClick={() => setUploaded(true)}
            >
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
            /* Upload form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Video preview */}
              <div className="relative bg-card rounded-3xl p-4 shadow-card">
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 rounded-xl bg-gradient-hero flex items-center justify-center">
                    <Video className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold">my_awesome_video.mp4</p>
                    <p className="text-sm text-muted-foreground">15.3 MB • 2:34</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-button rounded-full w-full" />
                      </div>
                      <Check className="h-4 w-4 text-sara-mint" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploaded(false)}
                    className="p-2 hover:bg-muted rounded-full transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
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
                  className="rounded-2xl min-h-[120px]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="font-display font-bold text-sm mb-2 block">
                  Category 🎨
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Music & Dance", "Stories", "Art & Crafts", "Science", "Games"].map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/">Cancel</Link>
                </Button>
                <Button variant="hero" className="flex-1 gap-2">
                  <Upload className="h-5 w-5" />
                  Publish Video!
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
