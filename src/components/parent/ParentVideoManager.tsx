import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Upload, Trash2, LinkIcon, Unlink, Save, Users } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

interface ParentVideoManagerProps {
  childId?: string | null;
}

type LimitMode = "no_limit" | "daily_limit";

const getChildName = (child: any) =>
  child.name || child.displayName || child.display_name || "Unnamed child";

const getChildLogin = (child: any) =>
  child.childLoginId || child.child_login_id || "-";

const ParentVideoManager = ({ childId }: ParentVideoManagerProps) => {
  const token = localStorage.getItem("saratube_token");

  const [videos, setVideos] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCategory, setUploadCategory] = useState("general");
  const [selectedChildren, setSelectedChildren] = useState<string[]>(childId ? [childId] : []);

  const [limitMode, setLimitMode] = useState<LimitMode>("no_limit");
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState("30");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");

  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const [linkTarget, setLinkTarget] = useState<Record<string, string>>({});

  const getMediaUrl = (url: string) => {
    if (!url) return "";
    return url.replace("http://localhost:4000", API_BASE_URL);
  };

  const loadChildren = async () => {
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/api/parent/children`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok) {
      setChildren(data.children || []);
    }
  };

  const loadVideos = async () => {
    if (!token) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/media/manage`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        const allVideos = (data.media || []).filter((item: any) => item.media_type === "video");

        const visibleVideos = childId
          ? allVideos.filter((item: any) =>
              (item.child_access || []).some((access: any) => access.child_profile_id === childId)
            )
          : allVideos;

        setVideos(visibleVideos);
      }
    } catch (error) {
      console.error("Failed to load local videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedChildren(childId ? [childId] : []);
    loadChildren();
    loadVideos();
  }, [childId]);

  const toggleChild = (id: string) => {
    setSelectedChildren((current) =>
      current.includes(id)
        ? current.filter((childId) => childId !== id)
        : [...current, id]
    );
  };

  const uploadVideo = async () => {
    if (!token) {
      toast.error("Please sign in again.");
      return;
    }

    if (!file) {
      toast.error("Choose a video first.");
      return;
    }

    if (!file.type.startsWith("video/")) {
      toast.error("Please choose a video file.");
      return;
    }

    if (selectedChildren.length === 0) {
      toast.error("Choose at least one child.");
      return;
    }

    const noLimit = limitMode === "no_limit";

    if (!noLimit && (!dailyLimitMinutes || Number(dailyLimitMinutes) <= 0)) {
      toast.error("Enter a valid daily limit.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", uploadTitle || file.name);
    formData.append("description", uploadDescription);
    formData.append("category", uploadCategory);
    formData.append("childProfileIds", JSON.stringify(selectedChildren));
    formData.append("noLimit", String(noLimit));
    formData.append("dailyLimitMinutes", noLimit ? "" : dailyLimitMinutes);
    formData.append("availableFrom", availableFrom);
    formData.append("availableUntil", availableUntil);

    setUploading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/media/upload-v2`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      toast.success("Video uploaded.");
      setFile(null);
      setUploadTitle("");
      setUploadDescription("");
      setUploadCategory("general");
      setSelectedChildren(childId ? [childId] : []);
      setLimitMode("no_limit");
      setDailyLimitMinutes("30");
      setAvailableFrom("");
      setAvailableUntil("");
      await loadVideos();
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (video: any) => {
    setEditingId(video.id);
    setEditForm({
      title: video.title || "",
      description: video.description || "",
      category: video.category || "general",
    });
  };

  const saveEdit = async (videoId: string) => {
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/api/media/${videoId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editForm),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to save video.");
      return;
    }

    toast.success("Video updated.");
    setEditingId(null);
    setEditForm({});
    await loadVideos();
  };

  const deleteVideo = async (videoId: string) => {
    if (!token) return;
    if (!confirm("Delete this video?")) return;

    const response = await fetch(`${API_BASE_URL}/api/media/${videoId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to delete video.");
      return;
    }

    toast.success("Video deleted.");
    await loadVideos();
  };

  const linkChild = async (videoId: string) => {
    if (!token) return;

    const childProfileId = linkTarget[videoId];

    if (!childProfileId) {
      toast.error("Choose child to link.");
      return;
    }

    const noLimit = limitMode === "no_limit";

    const response = await fetch(`${API_BASE_URL}/api/media/${videoId}/access`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        childProfileId,
        noLimit,
        dailyLimitMinutes: noLimit ? null : Number(dailyLimitMinutes),
        availableFrom: availableFrom || null,
        availableUntil: availableUntil || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to link child.");
      return;
    }

    toast.success("Child linked.");
    await loadVideos();
  };

  const unlinkChild = async (videoId: string, childProfileId: string) => {
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/api/media/${videoId}/access/${childProfileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to unlink child.");
      return;
    }

    toast.success("Child unlinked.");
    await loadVideos();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Upload className="w-5 h-5" />
            Upload Video
          </div>

          <input
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full border rounded-lg p-2"
          />

          {file && (
            <p className="text-sm text-muted-foreground">
              Selected: {file.name}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            <input
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Video title"
              className="border rounded-lg p-2"
            />

            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="general">General</option>
              <option value="family">Family</option>
              <option value="education">Education</option>
              <option value="cartoon">Cartoon</option>
              <option value="music">Music</option>
            </select>
          </div>

          <textarea
            value={uploadDescription}
            onChange={(e) => setUploadDescription(e.target.value)}
            placeholder="Description"
            className="w-full border rounded-lg p-2 min-h-20"
          />

          <div className="border rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <Users className="w-4 h-4" />
              Choose child access
            </div>

            <div className="grid md:grid-cols-3 gap-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => toggleChild(child.id)}
                  className={`border rounded-xl p-2 text-left ${
                    selectedChildren.includes(child.id)
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                >
                  <p className="font-medium">{getChildName(child)}</p>
                  <p className="text-xs text-muted-foreground">
                    Login: {getChildLogin(child)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="border rounded-xl p-3 space-y-3">
            <p className="font-medium">Watch rule</p>

            <div className="grid md:grid-cols-2 gap-2">
              <Button
                type="button"
                variant={limitMode === "no_limit" ? "default" : "outline"}
                onClick={() => setLimitMode("no_limit")}
              >
                No daily limit
              </Button>

              <Button
                type="button"
                variant={limitMode === "daily_limit" ? "default" : "outline"}
                onClick={() => setLimitMode("daily_limit")}
              >
                Set daily limit
              </Button>
            </div>

            {limitMode === "daily_limit" && (
              <input
                type="number"
                min="1"
                value={dailyLimitMinutes}
                onChange={(e) => setDailyLimitMinutes(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="Daily minutes"
              />
            )}

            <div className="grid md:grid-cols-2 gap-3">
              <input
                type="datetime-local"
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
                className="border rounded-lg p-2"
              />

              <input
                type="datetime-local"
                value={availableUntil}
                onChange={(e) => setAvailableUntil(e.target.value)}
                className="border rounded-lg p-2"
              />
            </div>
          </div>

          <Button onClick={uploadVideo} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload Video"}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Loading local videos...
          </CardContent>
        </Card>
      ) : videos.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No local videos linked to this child yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {videos.map((video) => (
            <Card key={video.id}>
              <CardContent className="p-4 space-y-3">
                <video
                  src={getMediaUrl(video.public_url)}
                  controls
                  className="w-full max-h-80 rounded-xl border"
                />

                {editingId === video.id ? (
                  <div className="space-y-2">
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    />

                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="general">General</option>
                      <option value="family">Family</option>
                      <option value="education">Education</option>
                      <option value="cartoon">Cartoon</option>
                      <option value="music">Music</option>
                    </select>

                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full border rounded-lg p-2 min-h-20"
                    />

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(video.id)}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>

                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">{video.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {video.category} | {video.original_filename}
                    </p>

                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(video)}>
                        Edit
                      </Button>

                      <Button size="sm" variant="destructive" onClick={() => deleteVideo(video.id)}>
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}

                <div className="border rounded-xl p-2 space-y-2">
                  <p className="font-medium text-sm">Linked children</p>

                  {(video.child_access || []).length === 0 ? (
                    <p className="text-xs text-muted-foreground">No child linked.</p>
                  ) : (
                    (video.child_access || []).map((access: any) => (
                      <div
                        key={`${video.id}-${access.child_profile_id}`}
                        className="flex justify-between items-center border rounded-lg p-2"
                      >
                        <div>
                          <p className="text-sm font-medium">{access.display_name || "Unnamed"}</p>
                          <p className="text-xs text-muted-foreground">
                            {access.no_limit
                              ? "No daily limit"
                              : `Daily limit: ${access.daily_limit_minutes} min`}
                          </p>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => unlinkChild(video.id, access.child_profile_id)}
                        >
                          <Unlink className="w-4 h-4 mr-1" />
                          Unlink
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <div className="border rounded-xl p-2 space-y-2">
                  <p className="font-medium text-sm">Link another child</p>

                  <div className="flex gap-2">
                    <select
                      value={linkTarget[video.id] || ""}
                      onChange={(e) =>
                        setLinkTarget((current) => ({
                          ...current,
                          [video.id]: e.target.value,
                        }))
                      }
                      className="flex-1 border rounded-lg p-2"
                    >
                      <option value="">Choose child</option>
                      {children.map((child) => (
                        <option key={child.id} value={child.id}>
                          {getChildName(child)}
                        </option>
                      ))}
                    </select>

                    <Button size="sm" onClick={() => linkChild(video.id)}>
                      <LinkIcon className="w-4 h-4 mr-1" />
                      Link
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentVideoManager;
