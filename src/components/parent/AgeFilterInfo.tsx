import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Baby, Star, ShieldCheck, AlertTriangle } from "lucide-react";
import { videoCategories } from "@/data/videoData";
import { isAgeAppropriate, parseAgeRange } from "@/utils/ageFilter";

interface AgeFilterInfoProps {
  childAge: number | null;
  childName: string;
}

const AgeFilterInfo = ({ childAge, childName }: AgeFilterInfoProps) => {
  if (childAge === null) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-amber-700 mb-1">Age not set</p>
            <p className="text-sm text-amber-600">
              Set {childName}'s age in their profile to automatically filter videos by age appropriateness.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const suitableCategories = videoCategories.filter(c => isAgeAppropriate(childAge, c.ageRange));
  const unsuitableCategories = videoCategories.filter(c => !isAgeAppropriate(childAge, c.ageRange));

  return (
    <div className="space-y-4">
      {/* Age Info Header */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Baby className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg">
              {childName} is {childAge} years old
            </p>
            <p className="text-sm text-muted-foreground">
              Videos are automatically filtered to show age-appropriate content
            </p>
          </div>
          <div className="text-3xl">
            {childAge <= 3 ? "👶" : childAge <= 6 ? "🧒" : childAge <= 9 ? "👦" : "🧑"}
          </div>
        </CardContent>
      </Card>

      {/* Suitable Categories */}
      <div>
        <h4 className="text-sm font-bold text-green-700 flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4" />
          Age-appropriate categories ({suitableCategories.length})
        </h4>
        <div className="flex flex-wrap gap-2">
          {suitableCategories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Badge
                variant="outline"
                className="px-3 py-1.5 bg-green-50 border-green-200 text-green-700 gap-1.5"
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
                <span className="text-green-500 text-xs">({cat.ageRange})</span>
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Unsuitable Categories */}
      {unsuitableCategories.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-amber-700 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Not recommended for this age ({unsuitableCategories.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {unsuitableCategories.map((cat) => {
              const range = parseAgeRange(cat.ageRange);
              const isTooYoung = childAge < range.min;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Badge
                    variant="outline"
                    className="px-3 py-1.5 bg-amber-50 border-amber-200 text-amber-700 gap-1.5 opacity-70"
                  >
                    <span>{cat.emoji}</span>
                    <span className="line-through">{cat.name}</span>
                    <span className="text-amber-500 text-xs">
                      ({isTooYoung ? `starts at ${range.min}` : `up to ${range.max}`})
                    </span>
                  </Badge>
                </motion.div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            These categories won't appear in {childName}'s video feed
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
        <Star className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Age filtering works automatically based on {childName}'s age. Each video and category has an age recommendation, and only age-appropriate content is shown.
        </p>
      </div>
    </div>
  );
};

export default AgeFilterInfo;
