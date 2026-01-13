import { Music, Palette, BookOpen, FlaskConical, Gamepad2, Heart, Sparkles, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";

const categories = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "music", label: "Music & Dance", icon: Music },
  { id: "animals", label: "Animals", icon: PawPrint },
  { id: "stories", label: "Stories", icon: BookOpen },
  { id: "crafts", label: "Art & Crafts", icon: Palette },
  { id: "science", label: "Science", icon: FlaskConical },
  { id: "games", label: "Games", icon: Gamepad2 },
  { id: "favorites", label: "My Favorites", icon: Heart },
];

interface CategoryNavProps {
  onCategoryChange?: (category: string) => void;
}

const CategoryNav = ({ onCategoryChange }: CategoryNavProps) => {
  const [active, setActive] = useState("all");
  const { theme } = useTheme();

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
              variant="outline"
              size="lg"
              onClick={() => handleClick(cat.id)}
              className={`gap-2 rounded-full transition-all duration-300 ${
                isActive 
                  ? `bg-gradient-to-r ${theme.primary} text-white border-transparent scale-105` 
                  : "hover:scale-102"
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
