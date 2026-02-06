import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Ban, Check, ShieldCheck, ShieldAlert, Info } from "lucide-react";
import { videoCategories } from "@/data/videoData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CategoryManagerProps {
  childId: string;
  childName: string;
  blockedCategories: string[];
  onBlockedChange: (categories: string[]) => void;
}

const CategoryManager = ({ childId, childName, blockedCategories, onBlockedChange }: CategoryManagerProps) => {
  const { user } = useAuth();
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (categoryId: string) => {
    if (!user || toggling) return;
    
    setToggling(categoryId);
    const isBlocked = blockedCategories.includes(categoryId);

    try {
      if (isBlocked) {
        // Unblock
        await supabase
          .from("blocked_categories")
          .delete()
          .eq("child_user_id", childId)
          .eq("category", categoryId);
        
        const updated = blockedCategories.filter(c => c !== categoryId);
        onBlockedChange(updated);
        
        const cat = videoCategories.find(c => c.id === categoryId);
        toast.success(
          <span className="flex items-center gap-2">
            <span className="text-lg">{cat?.emoji}</span>
            <span>{cat?.name} is now allowed for {childName}!</span>
          </span>
        );
      } else {
        // Block
        await supabase
          .from("blocked_categories")
          .insert({
            child_user_id: childId,
            category: categoryId,
            blocked_by: user.id,
          });
        
        const updated = [...blockedCategories, categoryId];
        onBlockedChange(updated);
        
        const cat = videoCategories.find(c => c.id === categoryId);
        toast.success(
          <span className="flex items-center gap-2">
            <Ban className="w-4 h-4" />
            <span>{cat?.name} is now blocked for {childName}</span>
          </span>
        );
      }
    } catch (error) {
      toast.error("Failed to update category");
    } finally {
      setToggling(null);
    }
  };

  const allowedCount = videoCategories.length - blockedCategories.length;
  const blockedCount = blockedCategories.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{allowedCount}</p>
              <p className="text-xs text-green-600">Allowed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{blockedCount}</p>
              <p className="text-xs text-red-600">Blocked</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-muted rounded-xl">
        <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">How category blocking works</p>
          <p>Toggle categories on/off to control what {childName} can watch. Blocked categories won't appear in their video feed.</p>
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {videoCategories.map((category) => {
          const isBlocked = blockedCategories.includes(category.id);
          const isToggling = toggling === category.id;

          return (
            <motion.div
              key={category.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                isBlocked
                  ? "border-destructive/30 bg-destructive/5"
                  : "border-green-200 bg-green-50/30"
              }`}
            >
              {/* Category thumbnail & info */}
              <div className="relative">
                <img
                  src={category.thumbnail}
                  alt={category.name}
                  className={`w-16 h-12 rounded-xl object-cover transition-all ${
                    isBlocked ? "opacity-40 grayscale" : ""
                  }`}
                />
                {isBlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Ban className="w-6 h-6 text-destructive" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{category.emoji}</span>
                  <h4 className={`font-bold ${isBlocked ? "text-muted-foreground line-through" : ""}`}>
                    {category.name}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {category.description} • Ages {category.ageRange}
                </p>
              </div>

              {/* Status badge */}
              <AnimatePresence mode="wait">
                <motion.span
                  key={isBlocked ? "blocked" : "allowed"}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className={`px-3 py-1 rounded-full text-xs font-bold hidden sm:block ${
                    isBlocked
                      ? "bg-destructive/10 text-destructive"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isBlocked ? "Blocked" : "Allowed"}
                </motion.span>
              </AnimatePresence>

              {/* Toggle */}
              <Switch
                checked={!isBlocked}
                onCheckedChange={() => handleToggle(category.id)}
                disabled={isToggling}
                className="data-[state=checked]:bg-green-500"
              />
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (!user) return;
            // Block all
            for (const cat of videoCategories) {
              if (!blockedCategories.includes(cat.id)) {
                await supabase.from("blocked_categories").insert({
                  child_user_id: childId,
                  category: cat.id,
                  blocked_by: user.id,
                });
              }
            }
            onBlockedChange(videoCategories.map(c => c.id));
            toast.success("All categories blocked");
          }}
          className="gap-2 text-destructive hover:bg-destructive/10"
        >
          <Ban className="w-4 h-4" />
          Block All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            // Unblock all
            await supabase
              .from("blocked_categories")
              .delete()
              .eq("child_user_id", childId);
            onBlockedChange([]);
            toast.success("All categories allowed");
          }}
          className="gap-2 text-green-600 hover:bg-green-50"
        >
          <Check className="w-4 h-4" />
          Allow All
        </Button>
      </div>
    </div>
  );
};

export default CategoryManager;
