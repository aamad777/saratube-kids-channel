import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Clock, Activity, Users, Plus, Trash2, 
  Eye, Ban, ChevronRight, Sparkles, AlertTriangle 
} from "lucide-react";
import { toast } from "sonner";

interface ChildProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  age: number | null;
}

interface ActivityLog {
  id: string;
  video_id: string;
  video_title: string;
  watch_duration_seconds: number;
  category: string | null;
  watched_at: string;
}

interface TimeLimit {
  id: string;
  child_user_id: string;
  daily_limit_minutes: number;
  bedtime_start: string;
  bedtime_end: string;
  is_enabled: boolean;
}

interface DailyWatchTime {
  user_id: string;
  watch_date: string;
  total_seconds: number;
}

const categories = [
  { id: "music", name: "Music", emoji: "🎵" },
  { id: "animals", name: "Animals", emoji: "🐾" },
  { id: "crafts", name: "Crafts", emoji: "🎨" },
  { id: "stories", name: "Stories", emoji: "🏰" },
  { id: "science", name: "Science", emoji: "🔬" },
  { id: "games", name: "Games", emoji: "🎮" },
];

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [timeLimit, setTimeLimit] = useState<TimeLimit | null>(null);
  const [dailyWatchTime, setDailyWatchTime] = useState<DailyWatchTime | null>(null);
  const [blockedCategories, setBlockedCategories] = useState<string[]>([]);
  const [childEmail, setChildEmail] = useState("");
  const [addingChild, setAddingChild] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchChildren();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const { data: links, error } = await supabase
        .from("parent_child_links")
        .select("child_user_id")
        .eq("parent_user_id", user?.id);

      if (error) throw error;

      if (links && links.length > 0) {
        const childIds = links.map(l => l.child_user_id);
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .in("user_id", childIds);

        if (profileError) throw profileError;
        setChildren(profiles || []);
        if (profiles && profiles.length > 0 && !selectedChild) {
          setSelectedChild(profiles[0].user_id);
        }
      }
    } catch (error: any) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildData = async (childId: string) => {
    try {
      // Fetch activity logs
      const { data: logs } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", childId)
        .order("watched_at", { ascending: false })
        .limit(20);
      setActivityLogs(logs || []);

      // Fetch time limits
      const { data: limits } = await supabase
        .from("time_limits")
        .select("*")
        .eq("child_user_id", childId)
        .single();
      setTimeLimit(limits);

      // Fetch today's watch time
      const today = new Date().toISOString().split("T")[0];
      const { data: watchTime } = await supabase
        .from("daily_watch_time")
        .select("*")
        .eq("user_id", childId)
        .eq("watch_date", today)
        .single();
      setDailyWatchTime(watchTime);

      // Fetch blocked categories
      const { data: blocked } = await supabase
        .from("blocked_categories")
        .select("category")
        .eq("child_user_id", childId);
      setBlockedCategories(blocked?.map(b => b.category) || []);
    } catch (error) {
      console.error("Error fetching child data:", error);
    }
  };

  const addChild = async () => {
    if (!childEmail.trim()) {
      toast.error("Please enter child's email");
      return;
    }

    setAddingChild(true);
    try {
      // Find child user by email (this is simplified - in production you'd use a lookup)
      const { data: childUser } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("display_name", `%${childEmail}%`)
        .single();

      if (!childUser) {
        toast.error("Child account not found. Make sure they've signed up first!");
        return;
      }

      const { error } = await supabase
        .from("parent_child_links")
        .insert({
          parent_user_id: user?.id,
          child_user_id: childUser.user_id,
        });

      if (error) throw error;

      // Create default time limits
      await supabase
        .from("time_limits")
        .insert({
          child_user_id: childUser.user_id,
          daily_limit_minutes: 60,
          is_enabled: true,
        });

      toast.success("Child account linked successfully! 🎉");
      setChildEmail("");
      fetchChildren();
    } catch (error: any) {
      toast.error(error.message || "Failed to link child account");
    } finally {
      setAddingChild(false);
    }
  };

  const updateTimeLimit = async (field: string, value: any) => {
    if (!selectedChild || !timeLimit) return;

    try {
      const { error } = await supabase
        .from("time_limits")
        .update({ [field]: value })
        .eq("child_user_id", selectedChild);

      if (error) throw error;
      setTimeLimit({ ...timeLimit, [field]: value });
      toast.success("Time limit updated! ⏰");
    } catch (error: any) {
      toast.error("Failed to update time limit");
    }
  };

  const toggleBlockedCategory = async (category: string) => {
    if (!selectedChild || !user) return;

    const isBlocked = blockedCategories.includes(category);

    try {
      if (isBlocked) {
        await supabase
          .from("blocked_categories")
          .delete()
          .eq("child_user_id", selectedChild)
          .eq("category", category);
        setBlockedCategories(blockedCategories.filter(c => c !== category));
      } else {
        await supabase
          .from("blocked_categories")
          .insert({
            child_user_id: selectedChild,
            category,
            blocked_by: user.id,
          });
        setBlockedCategories([...blockedCategories, category]);
      }
      toast.success(isBlocked ? "Category unblocked" : "Category blocked");
    } catch (error) {
      toast.error("Failed to update blocked categories");
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const selectedChildProfile = children.find(c => c.user_id === selectedChild);
  const watchProgress = timeLimit && dailyWatchTime 
    ? Math.min((dailyWatchTime.total_seconds / 60 / timeLimit.daily_limit_minutes) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      <main className="container py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Parent Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage your children's viewing experience 👨‍👩‍👧‍👦
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Children Sidebar */}
          <Card className="lg:col-span-1 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Kids
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {children.map((child) => (
                <button
                  key={child.user_id}
                  onClick={() => setSelectedChild(child.user_id)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                    selectedChild === child.user_id
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-button flex items-center justify-center text-primary-foreground font-bold">
                    {child.display_name?.charAt(0) || "?"}
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{child.display_name}</p>
                    {child.age && (
                      <p className="text-xs text-muted-foreground">{child.age} years old</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                </button>
              ))}

              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground mb-2">Link a child account:</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="Child's name..."
                    value={childEmail}
                    onChange={(e) => setChildEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={addChild} 
                    size="icon"
                    disabled={addingChild}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedChild && selectedChildProfile ? (
              <Tabs defaultValue="activity" className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full max-w-md">
                  <TabsTrigger value="activity" className="gap-2">
                    <Activity className="w-4 h-4" />
                    Activity
                  </TabsTrigger>
                  <TabsTrigger value="limits" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Time Limits
                  </TabsTrigger>
                  <TabsTrigger value="content" className="gap-2">
                    <Ban className="w-4 h-4" />
                    Content
                  </TabsTrigger>
                </TabsList>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-6">
                  {/* Today's Summary */}
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Today's Watch Time</span>
                        <span className="text-2xl font-bold text-primary">
                          {dailyWatchTime ? formatDuration(dailyWatchTime.total_seconds) : "0m"}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Daily limit: {timeLimit?.daily_limit_minutes || 60} minutes</span>
                          <span>{Math.round(watchProgress)}%</span>
                        </div>
                        <div className="h-4 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              watchProgress >= 90 ? "bg-destructive" : 
                              watchProgress >= 70 ? "bg-accent" : "bg-primary"
                            }`}
                            style={{ width: `${watchProgress}%` }}
                          />
                        </div>
                        {watchProgress >= 90 && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Almost at daily limit!
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Activity */}
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Recent Videos Watched
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {activityLogs.length > 0 ? (
                        <div className="space-y-3">
                          {activityLogs.map((log) => (
                            <div 
                              key={log.id}
                              className="flex items-center justify-between p-3 bg-muted rounded-xl"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-sm">{log.video_title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(log.watched_at).toLocaleDateString()} • 
                                  {formatDuration(log.watch_duration_seconds)}
                                </p>
                              </div>
                              {log.category && (
                                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                  {log.category}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">
                          No activity yet! 📺
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Time Limits Tab */}
                <TabsContent value="limits" className="space-y-6">
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Time Controls
                        </span>
                        <Switch
                          checked={timeLimit?.is_enabled ?? true}
                          onCheckedChange={(checked) => updateTimeLimit("is_enabled", checked)}
                        />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Daily Watch Limit
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min={15}
                            max={180}
                            step={15}
                            value={timeLimit?.daily_limit_minutes ?? 60}
                            onChange={(e) => updateTimeLimit("daily_limit_minutes", parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="w-20 text-center font-bold text-primary">
                            {timeLimit?.daily_limit_minutes ?? 60} min
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>15 min</span>
                          <span>3 hours</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Bedtime Starts 🌙
                          </label>
                          <Input
                            type="time"
                            value={timeLimit?.bedtime_start ?? "20:00"}
                            onChange={(e) => updateTimeLimit("bedtime_start", e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(timeLimit?.bedtime_start ?? "20:00")}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Bedtime Ends ☀️
                          </label>
                          <Input
                            type="time"
                            value={timeLimit?.bedtime_end ?? "07:00"}
                            onChange={(e) => updateTimeLimit("bedtime_end", e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(timeLimit?.bedtime_end ?? "07:00")}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-muted rounded-xl">
                        <p className="text-sm text-muted-foreground">
                          💡 During bedtime, {selectedChildProfile.display_name} won't be able to watch videos.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Content Control Tab */}
                <TabsContent value="content" className="space-y-6">
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Ban className="w-5 h-5" />
                        Blocked Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select categories to block for {selectedChildProfile.display_name}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categories.map((category) => {
                          const isBlocked = blockedCategories.includes(category.id);
                          return (
                            <button
                              key={category.id}
                              onClick={() => toggleBlockedCategory(category.id)}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                isBlocked
                                  ? "border-destructive bg-destructive/10"
                                  : "border-muted hover:border-primary/50"
                              }`}
                            >
                              <span className="text-2xl">{category.emoji}</span>
                              <p className="font-medium mt-1">{category.name}</p>
                              {isBlocked && (
                                <p className="text-xs text-destructive mt-1">Blocked</p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="shadow-card">
                <CardContent className="py-16 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-display font-bold mb-2">No Children Linked</h3>
                  <p className="text-muted-foreground mb-4">
                    Link your child's account to start monitoring their activity
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
