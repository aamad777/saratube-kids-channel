import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";
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
  Video, Pencil, Calendar, Upload, Search, UserPlus, Unlink, Baby, Image,
  Play, Edit2, X
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { themeConfigs, AppTheme } from "@/hooks/useTheme";
import AddChildForm from "@/components/parent/AddChildForm";
import ScreenTimeChart from "@/components/parent/ScreenTimeChart";
import CategoryManager from "@/components/parent/CategoryManager";
import AgeFilterInfo from "@/components/parent/AgeFilterInfo";
import ParentAIAdvisor from "@/components/parent/ParentAIAdvisor";
import KidsPhotoGallery from "@/components/parent/KidsPhotoGallery";
import NASSetupGuide from "@/components/parent/NASSetupGuide";
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
  child_login_id?: string | null;
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
  const [deleteChildId, setDeleteChildId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    availableFrom: "",
    availableUntil: "",
    selectedChildren: [] as string[],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
  const [bulkTargetChildren, setBulkTargetChildren] = useState<string[]>([]);
  const [isBulkLinking, setIsBulkLinking] = useState(false);

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
      const data = await api.get<any[]>("/children");
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
      const media = await api.get<any[]>("/media?type=video");
      const videosWithAccess: ParentVideo[] = media.map((m: any) => ({
        ...m,
        child_access: (m.access || []).map((a: any) => ({
          child_user_id: String(a.child_id),
          display_name: a.name,
        })),
      }));
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
      await api.put(`/media/${editingVideo.id}`, {
        title: editForm.title,
        description: editForm.description || null,
        category: editForm.category,
        available_from: editForm.availableFrom || null,
        available_until: editForm.availableUntil || null,
      });

      await api.put(`/media/${editingVideo.id}/access`, {
        child_ids: editForm.selectedChildren,
      });

      toast.success("Video updated successfully! 🎉");
      setEditingVideo(null);
      fetchMyVideos();
    } catch (error: any) {
      toast.error(error.message || "Failed to update video");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleBulkAssign = async () => {
    if (selectedVideos.length === 0 || bulkTargetChildren.length === 0 || !user) return;
    
    setIsBulkLinking(true);
    try {
      const promises = [];
      for (const videoId of selectedVideos) {
        promises.push(api.post(`/media/${videoId}/access/add`, { child_ids: bulkTargetChildren }));
      }
      await Promise.all(promises);

      toast.success(`Successfully linked ${selectedVideos.length} videos to children! ✨`);
      setSelectedVideos([]);
      setBulkTargetChildren([]);
      setShowBulkAssignDialog(false);
      fetchMyVideos();
    } catch (error: any) {
      console.error("Error in bulk assignment:", error);
      toast.error(error.message || "Failed to assign videos");
    } finally {
      setIsBulkLinking(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!deleteVideoId) return;

    try {
      await api.del(`/media/${deleteVideoId}`);

      toast.success("Video deleted successfully");
      setDeleteVideoId(null);
      fetchMyVideos();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete video");
    }
  };

  const handleDeleteChild = async () => {
    if (!deleteChildId) return;
    
    try {
      await api.del(`/children/${deleteChildId}`);
      
      toast.success("Child profile deleted successfully! 🗑️");
      setDeleteChildId(null);
      fetchCreatedChildren();
      fetchChildren();
      if (selectedChild === deleteChildId) {
        setSelectedChild(null);
      }
    } catch (error: any) {
      console.error("Error deleting profile:", error);
      toast.error(error.message || "Failed to delete profile");
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
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${themeConfigs[child.selected_theme as AppTheme]?.primary || "from-pink-500 to-purple-500"} flex items-center justify-center text-2xl overflow-hidden`}>
                        {themeConfigs[child.selected_theme as AppTheme]?.iconUrl ? (
                          <img src={themeConfigs[child.selected_theme as AppTheme]?.iconUrl} alt={child.selected_theme || ""} className="w-8 h-8 object-contain" />
                        ) : (
                          child.selected_theme === "princess" ? "👑" : 
                          child.selected_theme === "superhero" ? "⚡" :
                          child.selected_theme === "dinosaur" ? "🦖" :
                          child.selected_theme === "ocean" ? "🌊" :
                          child.selected_theme === "space" ? "🚀" :
                          child.selected_theme === "jungle" ? "🌴" :
                          child.selected_theme === "bunny" ? "🐰" :
                          child.selected_theme === "candy" ? "🍭" : "🌈"
                        )}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-medium truncate">{child.display_name}</p>
                        <div className="flex flex-wrap gap-1.5 mt-0.5">
                          {child.age && (
                            <span className="text-[10px] bg-muted-foreground/10 px-1.5 py-0.5 rounded text-muted-foreground whitespace-nowrap">
                              {child.age} yrs
                            </span>
                          )}
                          {child.child_login_id && (
                            <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-mono border border-accent/20 whitespace-nowrap">
                              ID: {child.child_login_id}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteChildId(child.id);
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
                    {t("parent.linked.accounts")}
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
                          <p className="text-xs text-muted-foreground">{child.age} {t("parent.years.old")}</p>
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
                  {t("parent.no.children")}
                </p>
              )}

              <div className="pt-3 border-t space-y-2">
                <Button 
                  onClick={() => setShowAddChildForm(true)} 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  <Baby className="w-4 h-4 mr-2" />
                  {t("parent.create.child")}
                </Button>
                <Button 
                  onClick={() => setShowLinkDialog(true)} 
                  className="w-full"
                  variant="outline"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t("parent.link.account")}
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
                  <span className="hidden sm:inline">{t("parent.my.videos")}</span>
                </TabsTrigger>
                <TabsTrigger value="photos" className="gap-2" disabled={!selectedChild}>
                  <Image className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("parent.photos")}</span>
                </TabsTrigger>
                <TabsTrigger value="advisor" className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("parent.ai.advisor")}</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2" disabled={!selectedChild}>
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("parent.activity")}</span>
                </TabsTrigger>
                <TabsTrigger value="limits" className="gap-2" disabled={!selectedChild}>
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("parent.time.limits")}</span>
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
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2">
                          <Video className="w-5 h-5 text-primary" />
                          My Uploaded Videos
                        </span>
                        {selectedVideos.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 mt-2 bg-primary/5 p-1.5 rounded-lg border border-primary/10"
                          >
                            <span className="text-xs font-bold text-primary pl-1">{selectedVideos.length} Selected</span>
                            <Button 
                              size="sm" 
                              onClick={() => setShowBulkAssignDialog(true)}
                              className="h-7 px-3 text-xs bg-primary hover:bg-primary/90"
                            >
                              <Users className="w-3 h-3 mr-1" />
                              Link to Kids
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => setSelectedVideos([])}
                              className="h-7 w-7 text-muted-foreground"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        )}
                      </div>
                      <Button asChild size="sm" className="rounded-xl">
                        <Link to="/upload">
                          <Plus className="w-4 h-4 mr-2" />
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
                        <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/20">
                          <Checkbox 
                            id="selectAll"
                            checked={selectedVideos.length === myVideos.length && myVideos.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedVideos(myVideos.map(v => v.id));
                              else setSelectedVideos([]);
                            }}
                          />
                          <Label htmlFor="selectAll" className="text-sm font-medium text-muted-foreground cursor-pointer">
                            Select All Videos
                          </Label>
                        </div>
                        {myVideos.map((video) => (
                          <div
                            key={video.id}
                            className={`flex items-start gap-4 p-4 rounded-xl transition-all border-2 ${
                              selectedVideos.includes(video.id)
                                ? "bg-primary/5 border-primary/20 shadow-sm"
                                : "bg-muted border-transparent"
                            }`}
                          >
                            <div className="pt-5 mr-1">
                              <Checkbox 
                                checked={selectedVideos.includes(video.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) setSelectedVideos([...selectedVideos, video.id]);
                                  else setSelectedVideos(selectedVideos.filter(id => id !== video.id));
                                }}
                              />
                            </div>
                            <div className="w-24 h-16 rounded-lg bg-gradient-hero flex items-center justify-center overflow-hidden flex-shrink-0 relative group">
                              {video.thumbnail_url ? (
                                <img
                                  src={video.thumbnail_url}
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Video className="w-8 h-8 text-primary-foreground" />
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Play className="w-6 h-6 text-white fill-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold truncate text-base">{video.title}</h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {video.category} • {new Date(video.created_at).toLocaleDateString()}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {video.child_access.map((child) => (
                                  <span
                                    key={child.child_user_id}
                                    className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-full border border-primary/10"
                                  >
                                    {child.display_name}
                                  </span>
                                ))}
                                {video.child_access.length === 0 && (
                                  <span className="text-[10px] text-muted-foreground italic">No access yet</span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 hover:bg-primary/10 hover:text-primary rounded-lg"
                                onClick={() => openEditDialog(video)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-lg"
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

            {/* NAS Setup Guide Section */}
            <div className="mt-12 mb-8">
              <NASSetupGuide />
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Left Column: Access Control */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-lg font-bold">
                <Users className="w-5 h-5 text-primary" />
                Who can watch?
              </Label>
              <div className="space-y-3 p-4 bg-muted/50 rounded-2xl border border-border/50">
                {children.map((child) => (
                  <div key={child.user_id} className="flex items-center gap-3 p-2 hover:bg-background/50 rounded-xl transition-colors">
                    <Checkbox
                      id={`edit-child-${child.user_id}`}
                      checked={editForm.selectedChildren.includes(child.user_id)}
                      onCheckedChange={() => toggleEditChildSelection(child.user_id)}
                      className="h-5 w-5 rounded-md"
                    />
                    <Label htmlFor={`edit-child-${child.user_id}`} className="cursor-pointer font-medium">
                      {child.display_name}
                    </Label>
                  </div>
                ))}
                {children.length === 0 && (
                  <p className="text-sm text-muted-foreground italic p-2">No linked children found</p>
                )}
              </div>
            </div>

            {/* Right Column: Video Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title" className="font-bold">Title</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="rounded-xl mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="font-bold">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="rounded-xl mt-1.5 min-h-[100px]"
                />
              </div>
              <div>
                <Label className="font-bold">Category</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={editForm.category === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditForm({ ...editForm, category: cat })}
                      className="rounded-full h-8 text-xs"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 pt-2">
                <div>
                  <Label htmlFor="edit-from" className="flex items-center gap-2 font-bold mb-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    Available from
                  </Label>
                  <Input
                    id="edit-from"
                    type="datetime-local"
                    value={editForm.availableFrom}
                    onChange={(e) => setEditForm({ ...editForm, availableFrom: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-until" className="flex items-center gap-2 font-bold mb-1.5">
                    <Calendar className="w-4 h-4 text-primary" />
                    Available until
                  </Label>
                  <Input
                    id="edit-until"
                    type="datetime-local"
                    value={editForm.availableUntil}
                    onChange={(e) => setEditForm({ ...editForm, availableUntil: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
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

      {/* Delete Child Dialog */}
      <AlertDialog open={!!deleteChildId} onOpenChange={(open) => !open && setDeleteChildId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Child Profile?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the child's profile, including their watch history, 
              settings, and their login access. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteChild}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Profile
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

      <Dialog open={showBulkAssignDialog} onOpenChange={setShowBulkAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Assign {selectedVideos.length} Videos
            </DialogTitle>
            <DialogDescription>
              Select children who should have access to these videos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              {children.map((child) => (
                <div 
                  key={child.user_id} 
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                    bulkTargetChildren.includes(child.user_id) 
                      ? "border-primary bg-primary/5 shadow-sm" 
                      : "border-muted hover:border-primary/20"
                  }`}
                  onClick={() => {
                    if (bulkTargetChildren.includes(child.user_id)) {
                      setBulkTargetChildren(bulkTargetChildren.filter(id => id !== child.user_id));
                    } else {
                      setBulkTargetChildren([...bulkTargetChildren, child.user_id]);
                    }
                  }}
                >
                  <Checkbox 
                    checked={bulkTargetChildren.includes(child.user_id)}
                    className="h-5 w-5"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {child.display_name.charAt(0)}
                    </div>
                    <span className="font-medium">{child.display_name}</span>
                  </div>
                </div>
              ))}
              {children.length === 0 && (
                <p className="text-center text-muted-foreground py-4 italic">No children found</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setShowBulkAssignDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkAssign} 
              disabled={isBulkLinking || bulkTargetChildren.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              {isBulkLinking ? "Linking..." : `Link to ${bulkTargetChildren.length} Children`}
            </Button>
          </DialogFooter>
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

// ... inside the component, add the handleBulkAssign function
// I'll insert it near other handlers

export default ParentDashboard;
