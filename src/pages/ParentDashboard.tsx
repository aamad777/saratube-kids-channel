import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Shield, Clock, Activity, Users, Plus, Trash2, 
  Eye, Ban, ChevronRight, Sparkles, AlertTriangle,
  Video, Pencil, Calendar, Upload, Search, UserPlus, Unlink, Baby, Image
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import AddChildForm from "@/components/parent/AddChildForm";
import ScreenTimeChart from "@/components/parent/ScreenTimeChart";
import CategoryManager from "@/components/parent/CategoryManager";
import AgeFilterInfo from "@/components/parent/AgeFilterInfo";
import ParentAIAdvisor from "@/components/parent/ParentAIAdvisor";
import KidsPhotoGallery from "@/components/parent/KidsPhotoGallery";
import { videoCategories } from "@/data/videoData";

interface ChildProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  age: number | null;
  pin_hash: string | null;
  created_by_parent: string | null;
  selected_theme: string | null;
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

interface ParentVideo {
  id: string;
  title: string;
  description: string | null;
  category: string;
  video_url: string;
  thumbnail_url: string | null;
  available_from: string | null;
  available_until: string | null;
  created_at: string;
  child_access: { child_user_id: string; display_name: string }[];
}

const CATEGORY_OPTIONS = videoCategories.map(c => c.name);

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [timeLimit, setTimeLimit] = useState<TimeLimit | null>(null);
  const [dailyWatchTime, setDailyWatchTime] = useState<DailyWatchTime | null>(null);
  const [blockedCategories, setBlockedCategories] = useState<string[]>([]);
  const [childEmail, setChildEmail] = useState("");
  const [addingChild, setAddingChild] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [searchResults, setSearchResults] = useState<{ user_id: string; display_name: string; email: string | null }[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [createdChildren, setCreatedChildren] = useState<ChildProfile[]>([]);
  
  // My Videos state
  const [myVideos, setMyVideos] = useState<ParentVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ParentVideo | null>(null);
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    availableFrom: "",
    availableUntil: "",
    selectedChildren: [] as string[],
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/signin");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchChildren();
      fetchCreatedChildren();
      fetchMyVideos();
    }
  }, [user]);

  const fetchCreatedChildren = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("created_by_parent", user.id)
        .eq("is_parent", false);

      if (error) throw error;
      setCreatedChildren(data || []);
    } catch (error) {
      console.error("Error fetching created children:", error);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild);
    }
  }, [selectedChild]);

  const fetchMyVideos = async () => {
    if (!user) return;
    setLoadingVideos(true);
    try {
      const { data: videos, error } = await supabase
        .from("videos")
        .select("*")
        .eq("uploaded_by", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch child access for each video
      const videosWithAccess: ParentVideo[] = await Promise.all(
        (videos || []).map(async (video) => {
          const { data: access } = await supabase
            .from("video_child_access")
            .select("child_user_id")
            .eq("video_id", video.id);

          const childIds = access?.map(a => a.child_user_id) || [];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .in("user_id", childIds.length > 0 ? childIds : ["none"]);

          return {
            ...video,
            child_access: profiles?.map(p => ({
              child_user_id: p.user_id,
              display_name: p.display_name,
            })) || [],
          };
        })
      );

      setMyVideos(videosWithAccess);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const openEditDialog = (video: ParentVideo) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title,
      description: video.description || "",
      category: video.category,
      availableFrom: video.available_from ? video.available_from.slice(0, 16) : "",
      availableUntil: video.available_until ? video.available_until.slice(0, 16) : "",
      selectedChildren: video.child_access.map(c => c.child_user_id),
    });
  };

  const handleSaveVideo = async () => {
    if (!editingVideo || !user) return;

    setIsSaving(true);
    try {
      // Update video metadata
      const { error: updateError } = await supabase
        .from("videos")
        .update({
          title: editForm.title,
          description: editForm.description || null,
          category: editForm.category,
          available_from: editForm.availableFrom || null,
          available_until: editForm.availableUntil || null,
        })
        .eq("id", editingVideo.id);

      if (updateError) throw updateError;

      // Update child access - remove all then add selected
      await supabase
        .from("video_child_access")
        .delete()
        .eq("video_id", editingVideo.id);

      if (editForm.selectedChildren.length > 0) {
        const accessRecords = editForm.selectedChildren.map(childId => ({
          video_id: editingVideo.id,
          child_user_id: childId,
          granted_by: user.id,
        }));

        await supabase.from("video_child_access").insert(accessRecords);
      }

      toast.success("Video updated successfully! 🎉");
      setEditingVideo(null);
      fetchMyVideos();
    } catch (error: any) {
      toast.error(error.message || "Failed to update video");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!deleteVideoId) return;

    try {
      // Delete child access first
      await supabase
        .from("video_child_access")
        .delete()
        .eq("video_id", deleteVideoId);

      // Delete video record
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", deleteVideoId);

      if (error) throw error;

      toast.success("Video deleted successfully");
      setDeleteVideoId(null);
      fetchMyVideos();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete video");
    }
  };

  const toggleEditChildSelection = (childId: string) => {
    setEditForm(prev => ({
      ...prev,
      selectedChildren: prev.selectedChildren.includes(childId)
        ? prev.selectedChildren.filter(id => id !== childId)
        : [...prev.selectedChildren, childId],
    }));
  };

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

  const searchChildren = async () => {
    if (!childEmail.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Get already linked children
      const { data: existingLinks } = await supabase
        .from("parent_child_links")
        .select("child_user_id")
        .eq("parent_user_id", user?.id);

      const linkedIds = existingLinks?.map(l => l.child_user_id) || [];

      // Search for child accounts by email or display name
      const { data: results, error } = await supabase
        .from("profiles")
        .select("user_id, display_name, email")
        .eq("is_parent", false)
        .or(`email.ilike.%${childEmail}%,display_name.ilike.%${childEmail}%`)
        .limit(10);

      if (error) throw error;

      // Filter out already linked children
      const filteredResults = (results || []).filter(
        r => !linkedIds.includes(r.user_id) && r.user_id !== user?.id
      );

      setSearchResults(filteredResults);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const linkChild = async (childUserId: string) => {
    setAddingChild(true);
    try {
      const { error } = await supabase
        .from("parent_child_links")
        .insert({
          parent_user_id: user?.id,
          child_user_id: childUserId,
        });

      if (error) throw error;

      // Create default time limits
      await supabase
        .from("time_limits")
        .insert({
          child_user_id: childUserId,
          daily_limit_minutes: 60,
          is_enabled: true,
        });

      toast.success("Child account linked successfully! 🎉");
      setChildEmail("");
      setSearchResults([]);
      setShowLinkDialog(false);
      fetchChildren();
    } catch (error: any) {
      toast.error(error.message || "Failed to link child account");
    } finally {
      setAddingChild(false);
    }
  };

  const unlinkChild = async (childUserId: string) => {
    try {
      const { error } = await supabase
        .from("parent_child_links")
        .delete()
        .eq("parent_user_id", user?.id)
        .eq("child_user_id", childUserId);

      if (error) throw error;

      toast.success("Child account unlinked");
      if (selectedChild === childUserId) {
        setSelectedChild(null);
      }
      fetchChildren();
    } catch (error: any) {
      toast.error(error.message || "Failed to unlink child");
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
            {t("parent.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("parent.subtitle")}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Children Sidebar */}
          <Card className="lg:col-span-1 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t("parent.my.kids")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Created Children (with PIN) */}
              {createdChildren.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t("parent.kids.pin")}
                  </p>
                  {createdChildren.map((child) => (
                    <div
                      key={child.user_id}
                      className={`p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                        selectedChild === child.user_id
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                      }`}
                      onClick={() => setSelectedChild(child.user_id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-2xl">
                        {child.selected_theme === "princess" ? "👑" : 
                         child.selected_theme === "superhero" ? "⚡" :
                         child.selected_theme === "dinosaur" ? "🦖" :
                         child.selected_theme === "ocean" ? "🌊" :
                         child.selected_theme === "space" ? "🚀" :
                         child.selected_theme === "jungle" ? "🌴" :
                         child.selected_theme === "candy" ? "🍭" : "🌈"}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium">{child.display_name}</p>
                        {child.age && (
                          <p className="text-xs text-muted-foreground">{child.age} years old</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm("Delete this profile?")) {
                            await supabase.from("profiles").delete().eq("id", child.id);
                            toast.success("Profile deleted");
                            fetchCreatedChildren();
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Linked Children */}
              {children.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Linked Accounts
                  </p>
                  {children.map((child) => (
                    <div
                      key={child.user_id}
                      className={`p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${
                        selectedChild === child.user_id
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-muted hover:bg-muted/80 border-2 border-transparent"
                      }`}
                      onClick={() => setSelectedChild(child.user_id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-button flex items-center justify-center text-primary-foreground font-bold">
                        {child.display_name?.charAt(0) || "?"}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-medium">{child.display_name}</p>
                        {child.age && (
                          <p className="text-xs text-muted-foreground">{child.age} years old</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          unlinkChild(child.user_id);
                        }}
                      >
                        <Unlink className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {children.length === 0 && createdChildren.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No children added yet
                </p>
              )}

              <div className="pt-3 border-t space-y-2">
                <Button 
                  onClick={() => setShowAddChildForm(true)} 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  <Baby className="w-4 h-4 mr-2" />
                  Create Child Profile
                </Button>
                <Button 
                  onClick={() => setShowLinkDialog(true)} 
                  className="w-full"
                  variant="outline"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Link Existing Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="videos" className="space-y-6">
              <TabsList className="grid grid-cols-6 w-full max-w-3xl">
                <TabsTrigger value="videos" className="gap-2">
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline">My Videos</span>
                </TabsTrigger>
                <TabsTrigger value="photos" className="gap-2" disabled={!selectedChild}>
                  <Image className="w-4 h-4" />
                  <span className="hidden sm:inline">Photos</span>
                </TabsTrigger>
                <TabsTrigger value="advisor" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Advisor</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2" disabled={!selectedChild}>
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="limits" className="gap-2" disabled={!selectedChild}>
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Time Limits</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="gap-2" disabled={!selectedChild}>
                  <Ban className="w-4 h-4" />
                  <span className="hidden sm:inline">Content</span>
                </TabsTrigger>
              </TabsList>

              {/* My Videos Tab */}
              <TabsContent value="videos" className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        My Uploaded Videos
                      </span>
                      <Button asChild size="sm">
                        <Link to="/upload">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload New
                        </Link>
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingVideos ? (
                      <div className="flex justify-center py-8">
                        <Sparkles className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : myVideos.length > 0 ? (
                      <div className="space-y-4">
                        {myVideos.map((video) => (
                          <div
                            key={video.id}
                            className="flex items-start gap-4 p-4 bg-muted rounded-xl"
                          >
                            <div className="w-24 h-16 rounded-lg bg-gradient-hero flex items-center justify-center overflow-hidden flex-shrink-0">
                              {video.thumbnail_url ? (
                                <img
                                  src={video.thumbnail_url}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Video className="w-8 h-8 text-primary-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{video.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {video.category} • {new Date(video.created_at).toLocaleDateString()}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {video.child_access.map((child) => (
                                  <span
                                    key={child.child_user_id}
                                    className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                                  >
                                    {child.display_name}
                                  </span>
                                ))}
                                {video.child_access.length === 0 && (
                                  <span className="text-xs text-muted-foreground">No access granted</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => openEditDialog(video)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => setDeleteVideoId(video.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground mb-4">No videos uploaded yet</p>
                        <Button asChild>
                          <Link to="/upload">Upload Your First Video</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value="photos" className="space-y-6">
                <KidsPhotoGallery
                  selectedChildId={selectedChild}
                  childName={selectedChildProfile?.display_name}
                />
              </TabsContent>

              {/* AI Advisor Tab */}
              <TabsContent value="advisor" className="space-y-6">
                <ParentAIAdvisor
                  childInfo={
                    selectedChildProfile
                      ? { name: selectedChildProfile.display_name, age: selectedChildProfile.age }
                      : null
                  }
                />
              </TabsContent>

              {selectedChild && selectedChildProfile && (
                <>
                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-6">
                  {/* Screen Time Chart */}
                  <ScreenTimeChart 
                    childId={selectedChild} 
                    childName={selectedChildProfile.display_name} 
                  />

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

                <TabsContent value="content" className="space-y-6">
                  {/* Age-Based Filtering */}
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Baby className="w-5 h-5" />
                        Age-Based Filtering
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AgeFilterInfo
                        childAge={selectedChildProfile.age ?? null}
                        childName={selectedChildProfile.display_name}
                      />
                    </CardContent>
                  </Card>

                  {/* Category Controls */}
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Ban className="w-5 h-5" />
                        Category Controls for {selectedChildProfile.display_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CategoryManager
                        childId={selectedChild}
                        childName={selectedChildProfile.display_name}
                        blockedCategories={blockedCategories}
                        onBlockedChange={setBlockedCategories}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </div>
      </main>

      {/* Edit Video Dialog */}
      <Dialog open={!!editingVideo} onOpenChange={() => setEditingVideo(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>
              Update video details and access permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {CATEGORY_OPTIONS.map((cat) => (
                  <Button
                    key={cat}
                    type="button"
                    variant={editForm.category === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditForm({ ...editForm, category: cat })}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Who can watch?
              </Label>
              <div className="space-y-2 mt-2">
                {children.map((child) => (
                  <div key={child.user_id} className="flex items-center gap-2">
                    <Checkbox
                      id={`edit-child-${child.user_id}`}
                      checked={editForm.selectedChildren.includes(child.user_id)}
                      onCheckedChange={() => toggleEditChildSelection(child.user_id)}
                    />
                    <Label htmlFor={`edit-child-${child.user_id}`} className="cursor-pointer">
                      {child.display_name}
                    </Label>
                  </div>
                ))}
                {children.length === 0 && (
                  <p className="text-sm text-muted-foreground">No linked children</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-from" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Available from
                </Label>
                <Input
                  id="edit-from"
                  type="datetime-local"
                  value={editForm.availableFrom}
                  onChange={(e) => setEditForm({ ...editForm, availableFrom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-until" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Available until
                </Label>
                <Input
                  id="edit-until"
                  type="datetime-local"
                  value={editForm.availableUntil}
                  onChange={(e) => setEditForm({ ...editForm, availableUntil: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVideo(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVideo} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteVideoId} onOpenChange={() => setDeleteVideoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The video will be permanently deleted and children will lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVideo}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Link Child Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Link Child Account
            </DialogTitle>
            <DialogDescription>
              Search for your child's account by email or name to link it to your parent account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by email or name..."
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchChildren()}
              />
              <Button onClick={searchChildren} disabled={searching}>
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {searching && (
              <div className="flex justify-center py-4">
                <Sparkles className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result.user_id}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-button flex items-center justify-center text-primary-foreground font-bold">
                      {result.display_name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{result.display_name}</p>
                      {result.email && (
                        <p className="text-xs text-muted-foreground">{result.email}</p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => linkChild(result.user_id)}
                      disabled={addingChild}
                    >
                      {addingChild ? "Linking..." : "Link"}
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!searching && childEmail && searchResults.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p>No child accounts found.</p>
                <p className="text-sm mt-1">Make sure your child has signed up first!</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Child Form Dialog */}
      <Dialog open={showAddChildForm} onOpenChange={setShowAddChildForm}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none">
          <AddChildForm
            onSuccess={() => {
              setShowAddChildForm(false);
              fetchCreatedChildren();
            }}
            onCancel={() => setShowAddChildForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParentDashboard;
