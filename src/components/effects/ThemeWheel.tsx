import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { themeConfigs, AppTheme } from "@/hooks/useTheme";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

interface ThemeWheelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme?: AppTheme;
}

export const ThemeWheel = ({ isOpen, onClose, currentTheme = "rainbow" }: ThemeWheelProps) => {
  const setTheme = async (theme: AppTheme) => {
    const activeChildId = localStorage.getItem("activeChildId");

    localStorage.setItem("activeChildTheme", theme);

    if (activeChildId) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/child/${activeChildId}/theme`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ theme }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to save theme");
        }

        toast.success("Theme saved for this child.");
      } catch (error: any) {
        toast.error(error.message || "Theme saved locally only.");
      }
    }

    window.dispatchEvent(new Event("saratube-theme-changed"));
    onClose();
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Theme</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-auto">
          {(Object.keys(themeConfigs) as AppTheme[]).map((theme) => (
            <Button
              key={theme}
              variant={theme === currentTheme ? "default" : "outline"}
              onClick={() => setTheme(theme)}
              className="justify-start gap-2"
            >
              <span>{themeConfigs[theme].emoji}</span>
              <span>{themeConfigs[theme].name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeWheel;
