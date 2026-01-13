import { useState } from "react";
import ThemedLayout from "@/components/layout/ThemedLayout";
import HeroSection from "@/components/home/HeroSection";
import CategoryNav from "@/components/layout/CategoryNav";
import VideoGrid from "@/components/video/VideoGrid";
import { Sparkles } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const Index = () => {
  const [category, setCategory] = useState("all");
  const { theme } = useTheme();

  return (
    <ThemedLayout>
      <HeroSection />
      
      {/* Trending Section */}
      <section className="py-8">
        <div className="container">
          <div className="flex items-center gap-2 px-4 mb-4">
            <span className="text-2xl">{theme.emoji}</span>
            <h2 className={`font-display text-2xl md:text-3xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
              Trending Now ✨
            </h2>
          </div>
          
          <CategoryNav onCategoryChange={setCategory} />
          
          <div className="mt-6">
            <VideoGrid category={category} />
          </div>
        </div>
      </section>
    </ThemedLayout>
  );
};

export default Index;
