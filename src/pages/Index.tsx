import { useState } from "react";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import CategoryNav from "@/components/layout/CategoryNav";
import VideoGrid from "@/components/video/VideoGrid";
import { Sparkles } from "lucide-react";

const Index = () => {
  const [category, setCategory] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        
        {/* Trending Section */}
        <section className="py-8">
          <div className="container">
            <div className="flex items-center gap-2 px-4 mb-4">
              <Sparkles className="h-6 w-6 text-sara-yellow animate-sparkle" />
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                Trending Now ✨
              </h2>
            </div>
            
            <CategoryNav onCategoryChange={setCategory} />
            
            <div className="mt-6">
              <VideoGrid category={category} />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-12">
        <div className="container px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-sara-pink animate-sparkle" />
            <span className="font-display text-xl font-bold text-gradient">
              SARATUBE
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Made with 💖 for kids everywhere!
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            A safe and fun place to watch and create videos
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
