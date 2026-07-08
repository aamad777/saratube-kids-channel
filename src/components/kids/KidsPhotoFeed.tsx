import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";

interface KidsPhotoFeedProps {
  blockedMediaIds?: string[];
}

const KidsPhotoFeed = (_props: KidsPhotoFeedProps) => {
  const childName = localStorage.getItem("activeChildName");

  return (
    <div className="px-4">
      <Card className="border-dashed border-2">
        <CardContent className="py-12 text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>

          <h3 className="text-xl font-display font-bold">
            Photos are not migrated yet
          </h3>

          <p className="text-muted-foreground max-w-md mx-auto">
            {childName ? `${childName}'s photo feed` : "Photo feed"} will be connected to local storage in the next media phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KidsPhotoFeed;
