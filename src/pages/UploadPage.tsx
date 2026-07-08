import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ThemedLayout from "@/components/layout/ThemedLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Video, Image, Users, Trash2, LinkIcon, Unlink } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

type UploadType = "video" | "photo";
type LimitMode = "no_limit" | "daily_limit";

const getChildName = (child: any) =>
  child.name || child.displayName || child.display_name || "Unnamed child";

const getChildLogin = (child: any) =>
  child.childLoginId || child.child_login_id || "-";

const UploadPage = () => {
  const [uploadType, setUploadType] = useState<UploadType>("video");
  const [file, setFile] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");

  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);

  const [limitMode, setLimitMode] = useState<LimitMode>("no_limit");
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState("30");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");

  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [linkTarget, setLinkTarget] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("saratube_token");

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

  const loadMedia = async () => {
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/api/media/manage`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok) {
      setMediaFiles(data.media || []);
    }
  };

  useEffect(() => {
    loadChildren();
    loadMedia();
  }, []);

  const toggleChild = (childId: string) => {
    setSelectedChildren((current) =>
      current.includes(childId)
        ? current.filter((id) => id !== childId)
        : [...current, childId]
    );
  };

  const handleUpload = async () => {
    if (!token) {
      toast.error("Please sign in as parent first.");
      return;
    }

    if (!file) {
      toast.error("Choose a file first.");
      return;
    }

    if (selectedChildren.length === 0) {
      toast.error("Choose at least one child.");
      return;
    }

    if (uploadType === "video" && !file.type.startsWith("video/")) {
      toast.error("You are in Video tab. Choose a video file.");
      return;
    }

    if (uploadType === "photo" && !file.type.startsWith("image/")) {
      toast.error("You are in Photo tab. Choose an image file.");
      return;
    }

    const noLimit = limitMode === "no_limit";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title || file.name);
    formData.append("description", description);
    formData.append("category", category);
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

      if (!response.ok) throw new Error(data.message || "Upload failed");

      toast.success("Uploaded and linked to child.");
      setFile(null);
      setTitle("");
      setDescription("");
      setCategory("general");
      setSelectedChildren([]);

      await loadMedia();
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const linkChild = async (mediaId: string) => {
    if (!token) return;

    const childProfileId = linkTarget[mediaId];

    if (!childProfileId) {
      toast.error("Choose child to link.");
      return;
    }

    const noLimit = limitMode === "no_limit";

    const response = await fetch(`${API_BASE_URL}/api/media/${mediaId}/access`, {
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
    await loadMedia();
  };

  const unlinkChild = async (mediaId: string, childProfileId: string) => {
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/api/media/${mediaId}/access/${childProfileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to unlink child.");
      return;
    }

    toast.success("Child unlinked.");
    await loadMedia();
  };

  const deleteMedia = async (mediaId: string) => {
    if (!token) return;
    if (!confirm("Delete this media?")) return;

    const response = await fetch(`${API_BASE_URL}/api/media/${mediaId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to delete media.");
      return;
    }

    toast.success("Media deleted.");
    await loadMedia();
  };

  return (
    <ThemedLayout>
      <div className="container py-10 px-4">
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-6 h-6" />
              Local Media Manager
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={uploadType === "video" ? "default" : "outline"}
                onClick={() => {
                  setUploadType("video");
                  setFile(null);
                }}
                className="gap-2"
              >
                <Video className="w-4 h-4" />
                Upload Video
              </Button>

              <Button
                variant={uploadType === "photo" ? "default" : "outline"}
                onClick={() => {
                  setUploadType("photo");
                  setFile(null);
                }}
                className="gap-2"
              >
                <Image className="w-4 h-4" />
                Upload Photo
              </Button>
            </div>

            <div className="border rounded-xl p-4 space-y-4">
              <h3 className="font-semibold">
                New {uploadType === "video" ? "Video" : "Photo"} Upload
              </h3>

              <input
                type="file"
                accept={uploadType === "video" ? "video/*" : "image/*"}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full border rounded-lg p-2"
              />

              {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full border rounded-lg p-2"
                />

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  <option value="general">General</option>
                  <option value="education">Education</option>
                  <option value="cartoon">Cartoon</option>
                  <option value="music">Music</option>
                  <option value="family">Family</option>
                </select>
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
                className="w-full border rounded-lg p-2 min-h-20"
              />

              <div className="border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  <Users className="w-5 h-5" />
                  Choose child access
                </div>

                {children.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No children found.</p>
                ) : (
                  <div className="grid md:grid-cols-3 gap-3">
                    {children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => toggleChild(child.id)}
                        className={`border rounded-xl p-3 text-left ${
                          selectedChildren.includes(child.id)
                            ? "border-primary bg-primary/10"
                            : "hover:bg-muted"
                        }`}
                      >
                        <p className="font-semibold">{getChildName(child)}</p>
                        <p className="text-xs text-muted-foreground">
                          Age: {child.age ?? "-"} | Login: {getChildLogin(child)}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border rounded-xl p-4 space-y-3">
                <p className="font-semibold">Watch rule</p>

                <div className="grid md:grid-cols-2 gap-3">
                  <Button
                    variant={limitMode === "no_limit" ? "default" : "outline"}
                    onClick={() => setLimitMode("no_limit")}
                  >
                    No daily limit
                  </Button>

                  <Button
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

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  />

                  <input
                    type="datetime-local"
                    value={availableUntil}
                    onChange={(e) => setAvailableUntil(e.target.value)}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>

              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : `Upload ${uploadType === "video" ? "Video" : "Photo"}`}
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Uploaded Media</h3>
              <Link to="/parent">
                <Button variant="outline">Back to Parent Dashboard</Button>
              </Link>
            </div>

            <div className="grid gap-4">
              {mediaFiles.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No uploaded media yet.
                  </CardContent>
                </Card>
              ) : (
                mediaFiles.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4 space-y-4">
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.media_type} | {item.category} | {item.original_filename}
                          </p>
                        </div>

                        <Button variant="destructive" size="sm" onClick={() => deleteMedia(item.id)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>

                      {item.media_type === "photo" ? (
                        <img
                          src={getMediaUrl(item.public_url)}
                          alt={item.title}
                          className="max-h-64 rounded-lg border object-contain"
                        />
                      ) : (
                        <video
                          src={getMediaUrl(item.public_url)}
                          controls
                          className="w-full max-h-80 rounded-lg border"
                        />
                      )}

                      <div className="border rounded-xl p-3 space-y-2">
                        <p className="font-medium">Linked children</p>

                        {item.child_access?.length ? (
                          item.child_access.map((access: any) => (
                            <div
                              key={`${item.id}-${access.child_profile_id}`}
                              className="flex justify-between items-center border rounded-lg p-2"
                            >
                              <div>
                                <p className="font-medium">{access.display_name || "Unnamed child"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {access.no_limit
                                    ? "No daily limit"
                                    : `Daily limit: ${access.daily_limit_minutes} minutes`}
                                  {" | "}
                                  From: {access.available_from ? new Date(access.available_from).toLocaleString() : "Now"}
                                  {" | "}
                                  Until: {access.available_until ? new Date(access.available_until).toLocaleString() : "No end"}
                                </p>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => unlinkChild(item.id, access.child_profile_id)}
                              >
                                <Unlink className="w-4 h-4 mr-1" />
                                Unlink
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No child linked.</p>
                        )}
                      </div>

                      <div className="border rounded-xl p-3 space-y-3">
                        <p className="font-medium">Link another child</p>

                        <div className="flex gap-2">
                          <select
                            value={linkTarget[item.id] || ""}
                            onChange={(e) =>
                              setLinkTarget((current) => ({
                                ...current,
                                [item.id]: e.target.value,
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

                          <Button onClick={() => linkChild(item.id)}>
                            <LinkIcon className="w-4 h-4 mr-1" />
                            Link
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ThemedLayout>
  );
};

export default UploadPage;
