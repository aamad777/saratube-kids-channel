import { VideoItem, VideoCategory } from "@/data/videoData";

/**
 * Parse age range string like "2-8" into min/max numbers
 */
export const parseAgeRange = (ageRange: string): { min: number; max: number } => {
  const [min, max] = ageRange.split("-").map(Number);
  return { min: min || 0, max: max || 99 };
};

/**
 * Check if a child's age falls within a video's age recommendation
 */
export const isAgeAppropriate = (childAge: number | null, ageRange: string): boolean => {
  if (childAge === null) return true; // No age set = show everything
  const { min, max } = parseAgeRange(ageRange);
  return childAge >= min && childAge <= max;
};

/**
 * Get age suitability label for display
 */
export const getAgeSuitability = (
  childAge: number | null,
  ageRange: string
): "perfect" | "suitable" | "too-young" | "too-old" | "unknown" => {
  if (childAge === null) return "unknown";
  const { min, max } = parseAgeRange(ageRange);

  if (childAge >= min && childAge <= max) {
    // In the sweet spot of the range
    const midpoint = (min + max) / 2;
    return Math.abs(childAge - midpoint) <= (max - min) / 3 ? "perfect" : "suitable";
  }

  return childAge < min ? "too-young" : "too-old";
};

/**
 * Filter videos by child age
 */
export const filterVideosByAge = (
  videos: VideoItem[],
  childAge: number | null
): VideoItem[] => {
  if (childAge === null) return videos;
  return videos.filter((v) => isAgeAppropriate(childAge, v.ageRecommendation));
};

/**
 * Filter categories by child age (categories where at least part of age range overlaps)
 */
export const filterCategoriesByAge = (
  categories: VideoCategory[],
  childAge: number | null
): VideoCategory[] => {
  if (childAge === null) return categories;
  return categories.filter((c) => isAgeAppropriate(childAge, c.ageRange));
};

/**
 * Get age badge color based on suitability
 */
export const getAgeBadgeStyle = (
  suitability: ReturnType<typeof getAgeSuitability>
): { bg: string; text: string; icon: string } => {
  switch (suitability) {
    case "perfect":
      return { bg: "bg-green-100", text: "text-green-700", icon: "✅" };
    case "suitable":
      return { bg: "bg-green-50", text: "text-green-600", icon: "👍" };
    case "too-young":
      return { bg: "bg-amber-100", text: "text-amber-700", icon: "⚠️" };
    case "too-old":
      return { bg: "bg-blue-100", text: "text-blue-600", icon: "📘" };
    default:
      return { bg: "bg-muted", text: "text-muted-foreground", icon: "👶" };
  }
};
