import { Music, Palette, BookOpen, FlaskConical, Gamepad2, Heart, Sparkles, PawPrint, Tv, Baby, Leaf, UtensilsCrossed, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { videoCategories } from "@/data/videoData";

const iconMap: Record<string, any> = {
  nursery: Baby,
  cartoons: Tv,
  music: Music,
  animals: PawPrint,
  stories: BookOpen,
  crafts: Palette,
  science: FlaskConical,
  games: Gamepad2,
  education: BookOpen,
  nature: Leaf,
  cooking: UtensilsCrossed,
  yoga: Dumbbell,
};

interface CategoryNavProps {
  onCategoryChange?: (category: string) => void;
  blockedCategories?: string[];
  defaultCategory?: string;
}

const CategoryNav = ({ onCategoryChange, blockedCategories = [], defaultCategory = "all" }: CategoryNavProps) => {
  const [active, setActive] = useState(defaultCategory);
  const { theme } = useTheme();

  // Sync active state when defaultCategory changes
  useEffect(() => {
    setActive(defaultCategory);
  }, [defaultCategory]);

  const handleClick = (id: string) => {
    setActive(id);
    onCategoryChange?.(id);
  };

  // Filter out blocked categories
  const visibleCategories = videoCategories.filter(
    (cat) => !blockedCategories.includes(cat.id)
  );

  return (
    <nav className="w-full overflow-x-auto scrollbar-hide py-4">
      <div className="flex gap-3 px-4 min-w-max">
        {/* All button - only show when no categories are blocked (parent view) */}
        {blockedCategories.length === 0 && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleClick("all")}
            className={`gap-2 rounded-full transition-all duration-300 ${
              active === "all"
                ? `bg-gradient-to-r ${theme.primary} text-white border-transparent scale-105`
                : "hover:scale-102"
            }`}
          >
            <Sparkles className={`h-5 w-5 ${active === "all" ? "animate-bounce-slow" : ""}`} />
            All
          </Button>
        )}

        {visibleCategories.map((cat) => {
          const Icon = iconMap[cat.id] || Sparkles;
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
              <span className="text-lg">{cat.emoji}</span>
              {cat.name}
            </Button>
          );
        })}

        {/* Favorites */}
        <Button
          variant="outline"
          size="lg"
          onClick={() => handleClick("favorites")}
          className={`gap-2 rounded-full transition-all duration-300 ${
            active === "favorites"
              ? `bg-gradient-to-r ${theme.primary} text-white border-transparent scale-105`
              : "hover:scale-102"
          }`}
        >
          <Heart className={`h-5 w-5 ${active === "favorites" ? "animate-bounce-slow" : ""}`} />
          My Favorites
        </Button>
      </div>
    </nav>
  );
};

export default CategoryNav;
