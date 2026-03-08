import { useState } from "react";
import ThemedLayout from "@/components/layout/ThemedLayout";
import HeroSection from "@/components/home/HeroSection";
import CategoryNav from "@/components/layout/CategoryNav";
import VideoGrid from "@/components/video/VideoGrid";
import GuidedQuizBot from "@/components/ai/GuidedQuizBot";
import { useTheme } from "@/hooks/useTheme";
import { motion } from "framer-motion";

const Index = () => {
  const [category, setCategory] = useState("all");
  const { theme } = useTheme();

  return (
    <ThemedLayout>
      <HeroSection />
      
      {/* Trending Section */}
      <section id="videos" className="py-16 relative overflow-hidden">
        {/* Fun background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(var(--primary)/0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,hsl(var(--secondary)/0.15)_0%,transparent_50%)]" />
        </div>
        
        <div className="container space-y-6 relative z-10">
          <motion.div 
            className="flex items-center gap-3 px-4 mb-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <motion.span 
              className="text-3xl"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {theme.emoji}
            </motion.span>
            <h2 className={`font-display text-3xl md:text-4xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
              Trending Now ✨
            </h2>
          </motion.div>
          
          <CategoryNav onCategoryChange={setCategory} />
          
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <VideoGrid category={category} />
          </motion.div>
        </div>
      </section>

      {/* Floating AI Quiz Bot */}
      <GuidedQuizBot />
    </ThemedLayout>
  );
};

export default Index;
