import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { themeConfigs, AppTheme, themeCategoryMap } from "@/hooks/useTheme";
import { videoCategories } from "@/data/videoData";
import { User, Lock, Palette, Check, X, Heart } from "lucide-react";

interface AddChildFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const themeOptions: AppTheme[] = [
  "rainbow", "princess", "ocean", "space", 
  "jungle", "candy", "superhero", "dinosaur",
  "unicorn", "fairy", "robot", "pirate",
  "quran_stories", "nasheed", "ramadan", "dua_prayer",
  "farm", "sports", "cars", "magic",
];

const INTEREST_OPTIONS = [
  { id: "music", label: "Music & Dance", emoji: "🎵" },
  { id: "animals", label: "Animals & Nature", emoji: "🐾" },
  { id: "crafts", label: "Arts & Crafts", emoji: "🎨" },
  { id: "stories", label: "Stories & Reading", emoji: "📚" },
  { id: "science", label: "Science & Experiments", emoji: "🔬" },
  { id: "games", label: "Games & Play", emoji: "🎮" },
  { id: "cooking", label: "Cooking & Food", emoji: "🍳" },
  { id: "yoga", label: "Yoga & Mindfulness", emoji: "🧘" },
  { id: "cartoons", label: "Cartoons", emoji: "📺" },
  { id: "education", label: "Education & Learning", emoji: "🎓" },
  { id: "nursery", label: "Nursery Rhymes", emoji: "🎶" },
  { id: "nature", label: "Nature Docs", emoji: "🌿" },
];

const AddChildForm = ({ onSuccess, onCancel }: AddChildFormProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>("rainbow");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast.error("PIN must be 4 digits");
      return;
    }
    
    if (pin !== confirmPin) {
      toast.error("PINs don't match");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }

    setLoading(true);
    
    try {
      const childUserId = crypto.randomUUID();
      const dummyEmail = `child-${childUserId}@kids.saratube`;
      
      // Calculate blocked categories based on theme
      const themeDefaultCategory = themeCategoryMap[selectedTheme];
      let blockedCategories: string[] = [];
      if (themeDefaultCategory) {
        blockedCategories = videoCategories
          .filter((cat) => cat.id !== themeDefaultCategory)
          .map((cat) => cat.id);
      }

      // Filter valid interests
      const validCategories = ["music", "animals", "crafts", "stories", "science", "games",
        "quran_stories", "nasheed", "ramadan", "dua_prayer", "farm", "sports", "cars", "magic"];
      const interestsToSave = selectedInterests.filter((i) => validCategories.includes(i));
      
      // Use the Super Mega-Fix RPC to create everything in one secure transaction
      const { error: rpcError } = await (supabase.rpc as any)("create_child_auth_user", {
        p_id: childUserId,
        p_email: dummyEmail,
        p_password: pin,
        p_display_name: name.trim(),
        p_pin_hash: pin,
        p_age: age ? parseInt(age) : null,
        p_selected_theme: selectedTheme,
        p_created_by_parent: user.id,
        p_parent_email: user.email,
        p_blocked_categories: blockedCategories,
        p_interests: interestsToSave
      });

      if (rpcError) throw rpcError;

      toast.success(
        <span className="flex items-center gap-2">
          <span className="text-xl">{themeConfigs[selectedTheme].emoji}</span>
          <span>{name}'s profile created and linked!</span>
        </span>
      );
      
      onSuccess();
    } catch (error: any) {
      console.error("Error creating child profile:", error);
      toast.error(error.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-xl max-w-md mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Add New Child 👶
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full transition-all ${
              step >= s ? "bg-purple-500 scale-110" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <motion.div
          key="step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="name" className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" />
              Child's Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
              className="rounded-xl"
            />
          </div>
          
          <div>
            <Label htmlFor="age" className="flex items-center gap-2 mb-2">
              🎂 Age (optional)
            </Label>
            <Input
              id="age"
              type="number"
              min="1"
              max="17"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age..."
              className="rounded-xl"
            />
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={!name.trim()}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl h-12"
          >
            Next: Choose Theme
          </Button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <Label className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4" />
            Choose a Theme
          </Label>
          
          <div className="grid grid-cols-4 gap-3">
            {themeOptions.map((theme) => {
              const config = themeConfigs[theme];
              const isSelected = selectedTheme === theme;
              
              return (
                <motion.button
                  key={theme}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTheme(theme)}
                  className={`relative p-3 rounded-2xl bg-gradient-to-br ${config.primary} transition-all ${
                    isSelected ? "ring-4 ring-yellow-400 ring-offset-2" : ""
                  }`}
                >
                  <span className="text-2xl">{config.emoji}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-yellow-800" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Selected: <span className="font-bold">{themeConfigs[selectedTheme].name}</span> {themeConfigs[selectedTheme].emoji}
          </p>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1 rounded-xl">
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl"
            >
              Next: Interests
            </Button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          key="step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <Label className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4" />
            What does {name || "your child"} enjoy?
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            Pick as many as you like — we'll personalize their experience!
          </p>

          <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {INTEREST_OPTIONS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <motion.button
                  key={interest.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left text-sm transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-50 shadow-sm"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <span className="text-lg">{interest.emoji}</span>
                  <span className={`font-medium ${isSelected ? "text-purple-700" : "text-gray-700"}`}>
                    {interest.label}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-purple-500 ml-auto flex-shrink-0" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {selectedInterests.length > 0 && (
            <p className="text-xs text-center text-purple-600 font-medium">
              {selectedInterests.length} interest{selectedInterests.length > 1 ? "s" : ""} selected ✨
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1 rounded-xl">
              Back
            </Button>
            <Button
              onClick={() => setStep(4)}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl"
            >
              Next: Set PIN
            </Button>
          </div>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div
          key="step4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="pin" className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              Create 4-Digit PIN
            </Label>
            <Input
              id="pin"
              type="password"
              maxLength={4}
              pattern="\d{4}"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className="rounded-xl text-center text-2xl tracking-widest"
            />
          </div>
          
          <div>
            <Label htmlFor="confirmPin" className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4" />
              Confirm PIN
            </Label>
            <Input
              id="confirmPin"
              type="password"
              maxLength={4}
              pattern="\d{4}"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className="rounded-xl text-center text-2xl tracking-widest"
            />
          </div>

          {pin.length === 4 && confirmPin.length === 4 && pin !== confirmPin && (
            <p className="text-red-500 text-sm text-center">PINs don't match!</p>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1 rounded-xl">
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || pin.length !== 4 || pin !== confirmPin}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl"
            >
              {loading ? "Creating..." : "Create Profile ✨"}
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AddChildForm;
