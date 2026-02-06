import { useState, useEffect } from "react";
import { Search, Play, Clock, TrendingUp } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "react-router-dom";
import { sampleVideos, videoCategories } from "@/data/videoData";

const recentSearches = ["dinosaurs", "princess songs", "baby shark", "crafts for kids"];
const trendingSearches = ["nursery rhymes", "peppa pig", "yoga for kids", "cooking"];

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredVideos = search.length > 0
    ? sampleVideos.filter(v =>
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.creator.toLowerCase().includes(search.toLowerCase()) ||
        v.category.toLowerCase().includes(search.toLowerCase()) ||
        v.description.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const filteredCategories = search.length > 0
    ? videoCategories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleSelect = (videoId: string) => {
    navigate(`/watch/${videoId}`);
    onOpenChange(false);
    setSearch("");
  };

  const handleSearchSelect = (term: string) => {
    setSearch(term);
  };

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className={`border-b-4 border-transparent bg-gradient-to-r ${theme.primary} bg-clip-border`}>
        <CommandInput
          placeholder={`Search fun videos... ${theme.emoji}`}
          value={search}
          onValueChange={setSearch}
          className="h-14 text-lg"
        />
      </div>
      <CommandList className="max-h-[400px]">
        <CommandEmpty className="py-8 text-center">
          <span className="text-4xl mb-2 block">{theme.emoji}</span>
          <p className="text-muted-foreground">No videos found. Try another search!</p>
        </CommandEmpty>

        {search.length === 0 && (
          <>
            <CommandGroup heading="🕐 Recent Searches">
              {recentSearches.map((term) => (
                <CommandItem key={term} onSelect={() => handleSearchSelect(term)} className="gap-3 py-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{term}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="🔥 Trending Now">
              {trendingSearches.map((term) => (
                <CommandItem key={term} onSelect={() => handleSearchSelect(term)} className="gap-3 py-3">
                  <TrendingUp className="h-4 w-4 text-destructive" />
                  <span>{term}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {filteredCategories.length > 0 && (
          <CommandGroup heading="📂 Categories">
            {filteredCategories.map((cat) => (
              <CommandItem
                key={cat.id}
                onSelect={() => handleSearchSelect(cat.name.toLowerCase())}
                className="gap-3 py-3"
              >
                <span className="text-xl">{cat.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredVideos.length > 0 && (
          <CommandGroup heading={`🎬 Videos (${filteredVideos.length})`}>
            {filteredVideos.map((video) => (
              <CommandItem
                key={video.id}
                onSelect={() => handleSelect(video.id)}
                className="gap-3 py-3"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-16 h-10 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{video.title}</p>
                  <p className="text-sm text-muted-foreground">{video.creator}</p>
                </div>
                <Play className="h-5 w-5 opacity-50" />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      <div className="border-t p-2 text-xs text-muted-foreground flex items-center justify-between bg-muted/30">
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">⌘K</kbd> to toggle search</span>
        <span>{theme.emoji} Happy searching!</span>
      </div>
    </CommandDialog>
  );
};

export default SearchDialog;
