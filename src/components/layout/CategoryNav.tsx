import { Music, Palette, BookOpen, FlaskConical, Gamepad2, Heart, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const categories = [
  { id: "all", label: "All", icon: Sparkles, color: "hero" },
  { id: "music", label: "Music & Dance", icon: Music, color: "fun" },
  { id: "stories", label: "Stories", icon: BookOpen, color: "purple" },
  { id: "crafts", label: "Art & Crafts", icon: Palette, color: "coral" },
  { id: "science", label: "Science", icon: FlaskConical, color: "mint" },
  { id: "games", label: "Games", icon: Gamepad2, color: "fun" },
  { id: "favorites", label: "My Favorites", icon: Heart, color: "hero" },
];

interface CategoryNavProps {
  onCategoryChange?: (category: string) => void;
}

const CategoryNav = ({ onCategoryChange }: CategoryNavProps) => {
  const [active, setActive] = useState("all");

  const handleClick = (id: string) => {
    setActive(id);
    onCategoryChange?.(id);
  };

  return (
    <nav className="w-full overflow-x-auto scrollbar-hide py-4">
      <div className="flex gap-3 px-4 min-w-max">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = active === cat.id;
          return (
            <Button
              key={cat.id}
              variant={isActive ? (cat.color as any) : "outline"}
              size="lg"
              onClick={() => handleClick(cat.id)}
              className={`gap-2 rounded-full transition-all duration-300 ${
                isActive ? "scale-105" : "hover:scale-102"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "animate-bounce-slow" : ""}`} />
              {cat.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default CategoryNav;
