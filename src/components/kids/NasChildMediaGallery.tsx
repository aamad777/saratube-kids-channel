import { useEffect, useState } from "react";

type MediaFile = {
  id: number;
  filename: string;
  original_name?: string;
  media_type: "photo" | "video";
  public_url: string;
  assigned_child_name?: string;
  visibility?: string;
  created_at?: string;
};

type ChildInfo = {
  id: number;
  display_name: string;
  login_name: string;
};

type ApiResponse = {
  status: string;
  child: ChildInfo;
  count: number;
  media: MediaFile[];
  error?: string;
};

const API_URL = import.meta.env.VITE_API_URL || "/api";

type Props = {
  childLoginName?: string;
};

export default function NasChildMediaGallery({ childLoginName = "sasa" }: Props) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [child, setChild] = useState<ChildInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadMedia(name: string) {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(`${API_URL}/media/child/${encodeURIComponent(name)}`);
      const data: ApiResponse = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.error || "Failed to load media");
      }

      setChild(data.child);
      setFiles(data.media || []);
      setMessage(`Found ${data.count || 0} media file(s) for ${data.child?.display_name || name}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load media");
      setFiles([]);
      setChild(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedia(childLoginName);
  }, [childLoginName]);

  return (
    <section style={{
      margin: "32px auto",
      padding: "24px",
      maxWidth: "1200px",
      background: "linear-gradient(135deg, #fff7ed, #eef2ff)",
      borderRadius: "24px",
      boxShadow: "0 12px 30px rgba(0,0,0,0.08)"
    }}>
      <div style={{ marginBottom: "18px" }}>
        <h2 style={{ fontSize: "28px", margin: "0 0 8px" }}>
          📸 My Photos from Dad
        </h2>
        <p style={{ margin: 0, color: "#555" }}>
          {child ? `Showing photos for ${child.display_name}` : "Loading your photos..."}
        </p>
      </div>

      {loading && <p>Loading media...</p>}
      {message && <p style={{ color: "#444" }}>{message}</p>}

      {!loading && files.length === 0 && (
        <div style={{
          padding: "20px",
          background: "white",
          borderRadius: "16px",
          color: "#666"
        }}>
          No photos or videos found for this child yet.
        </div>
      )}

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "18px"
      }}>
        {files.map((file) => {
          const fullUrl = file.public_url.startsWith("http")
            ? file.public_url
            : `${API_URL.replace(/\/api$/, "")}${file.public_url}`;

          return (
            <div
              key={file.id}
              style={{
                background: "white",
                borderRadius: "18px",
                padding: "12px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.08)"
              }}
            >
              {file.media_type === "video" ? (
                <video
                  controls
                  src={fullUrl}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "14px",
                    background: "#eee"
                  }}
                />
              ) : (
                <img
                  src={fullUrl}
                  alt={file.filename}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "14px",
                    background: "#eee"
                  }}
                />
              )}

              <p style={{
                fontSize: "13px",
                wordBreak: "break-all",
                marginTop: "10px"
              }}>
                {file.original_name || file.filename}
              </p>

              <a href={fullUrl} target="_blank" rel="noreferrer">
                Open
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
