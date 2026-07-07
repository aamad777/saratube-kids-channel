import express from "express";
import cors from "cors";
import pg from "pg";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const { Pool } = pg;

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadRoot = process.env.UPLOAD_ROOT || "/app/uploads";
const photosDir = path.join(uploadRoot, "photos");
const videosDir = path.join(uploadRoot, "videos");

fs.mkdirSync(photosDir, { recursive: true });
fs.mkdirSync(videosDir, { recursive: true });


function requireAdminKey(req, res, next) {
  const expectedKey = process.env.ADMIN_MEDIA_KEY || "dad123";

  const providedKey =
    req.query.key ||
    req.body?.adminKey ||
    req.headers["x-admin-key"];

  if (providedKey !== expectedKey) {
    return res.status(403).send(`
      <h1>Access denied</h1>
      <p>Admin key is missing or incorrect.</p>
      <p>Open the admin page using: <code>/api/admin/media-db-page?key=dad123</code></p>
    `);
  }

  next();
}

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
});

app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

function safeFileName(originalName) {
  const ext = path.extname(originalName || "").toLowerCase();
  const id = crypto.randomUUID();
  return `${id}${ext}`;
}

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, photosDir);
  },
  filename: (req, file, cb) => {
    cb(null, safeFileName(file.originalname));
  }
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    cb(null, safeFileName(file.originalname));
  }
});

const photoUpload = multer({
  storage: photoStorage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP, and GIF images are allowed"));
    }
    cb(null, true);
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 500 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only MP4, WEBM, and MOV videos are allowed"));
    }
    cb(null, true);
  }
});

app.use("/uploads", express.static(uploadRoot));

app.get("/health", async (req, res) => {
  res.json({
    status: "ok",
    service: "saratube-api",
    uploads: uploadRoot
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query(
      "select current_database() as database, current_user as user, now() as time"
    );

    res.json({
      status: "database connected",
      result: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      status: "database connection failed",
      error: error.message
    });
  }
});

app.get("/persistence-test", async (req, res) => {
  try {
    const result = await pool.query("select * from test_persistence order by id");
    res.json({
      status: "ok",
      rows: result.rows
    });
  } catch (error) {
    res.status(500).json({
      status: "query failed",
      error: error.message
    });
  }
});


function listMediaFiles(directory, type) {
  const allowedPhotoExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const allowedVideoExt = [".mp4", ".webm", ".mov"];

  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory)
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      if (type === "photo") return allowedPhotoExt.includes(ext);
      if (type === "video") return allowedVideoExt.includes(ext);
      return false;
    })
    .map((file) => {
      const stat = fs.statSync(path.join(directory, file));
      return {
        filename: file,
        size: stat.size,
        createdAt: stat.birthtime,
        modifiedAt: stat.mtime,
        url: `/uploads/${type === "photo" ? "photos" : "videos"}/${file}`,
        publicUrl: `/api/uploads/${type === "photo" ? "photos" : "videos"}/${file}`
      };
    })
    .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
}

app.get("/media/photos", (req, res) => {
  res.json({
    status: "ok",
    type: "photos",
    count: listMediaFiles(photosDir, "photo").length,
    files: listMediaFiles(photosDir, "photo")
  });
});

app.get("/media/videos", (req, res) => {
  res.json({
    status: "ok",
    type: "videos",
    count: listMediaFiles(videosDir, "video").length,
    files: listMediaFiles(videosDir, "video")
  });
});

app.post("/upload/photo", photoUpload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: "failed",
      message: "No photo uploaded. Use form field name: file"
    });
  }

  res.json({
    status: "uploaded",
    type: "photo",
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    url: `/uploads/photos/${req.file.filename}`,
    publicUrl: `/api/uploads/photos/${req.file.filename}`
  });
});

app.post("/upload/video", videoUpload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: "failed",
      message: "No video uploaded. Use form field name: file"
    });
  }

  res.json({
    status: "uploaded",
    type: "video",
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    url: `/uploads/videos/${req.file.filename}`,
    publicUrl: `/api/uploads/videos/${req.file.filename}`
  });
});


app.get("/admin/media", requireAdminKey, (req, res) => {
  const photos = listMediaFiles(photosDir, "photo");
  const videos = listMediaFiles(videosDir, "video");

  const photoCards = photos.map(file => `
    <div class="card">
      <img src="${file.publicUrl}" alt="${file.filename}" />
      <p>${file.filename}</p>
      <a href="${file.publicUrl}" target="_blank">Open photo</a>
    </div>
  `).join("");

  const videoCards = videos.map(file => `
    <div class="card">
      <video controls>
        <source src="${file.publicUrl}">
      </video>
      <p>${file.filename}</p>
      <a href="${file.publicUrl}" target="_blank">Open video</a>
    </div>
  `).join("");

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SaraTube NAS Media Admin</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f5f7fb;
          margin: 0;
          padding: 24px;
        }
        h1 {
          color: #222;
        }
        h2 {
          margin-top: 40px;
          color: #333;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 18px;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        img, video {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 8px;
          background: #ddd;
        }
        p {
          font-size: 13px;
          word-break: break-all;
        }
        .assign-form {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #eee;
        }
        .assign-form label {
          display: block;
          font-size: 12px;
          font-weight: bold;
          margin-top: 8px;
        }
        .assign-form input, .assign-form select {
          width: 100%;
          padding: 8px;
          margin-top: 4px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .delete-form {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #f2caca;
        }
        .delete-form label {
          display: block;
          font-size: 12px;
          color: #7a1111;
        }
        .delete-form button {
          margin-top: 8px;
          width: 100%;
          padding: 9px;
          border: 0;
          border-radius: 6px;
          background: #b42318;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }
        .assign-form button {
          margin-top: 10px;
          width: 100%;
          padding: 9px;
          border: 0;
          border-radius: 6px;
          background: #0066cc;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }
        a {
          display: inline-block;
          margin-top: 6px;
          color: #0066cc;
          text-decoration: none;
          font-weight: bold;
        }
        .upload-box {
          background: white;
          padding: 18px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .upload-box label {
          display: block;
          font-size: 13px;
          font-weight: bold;
          margin-top: 10px;
        }
        .upload-box input, .upload-box select {
          width: 100%;
          padding: 9px;
          margin-top: 5px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .upload-box button {
          margin-top: 14px;
          padding: 10px 16px;
          border: 0;
          border-radius: 6px;
          background: #00875a;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }
        .summary {
          background: white;
          padding: 14px;
          border-radius: 10px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <h1>SaraTube NAS Media Admin</h1>

      <div class="summary">
        <p><strong>Photos:</strong> ${photos.length}</p>
        <p><strong>Videos:</strong> ${videos.length}</p>
        <p><strong>Storage path inside API:</strong> ${uploadRoot}</p>
      </div>

      <h2>Photos</h2>
      <div class="grid">
        ${photoCards || "<p>No photos found.</p>"}
      </div>

      <h2>Videos</h2>
      <div class="grid">
        ${videoCards || "<p>No videos found.</p>"}
      </div>
    </body>
    </html>
  `);
});


app.post("/media/register", async (req, res) => {
  try {
    const {
      filename,
      originalName,
      mediaType,
      storagePath,
      publicUrl,
      assignedChildName,
      uploadedBy,
      visibility
    } = req.body;

    if (!filename || !mediaType || !storagePath || !publicUrl) {
      return res.status(400).json({
        status: "failed",
        message: "filename, mediaType, storagePath, and publicUrl are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO media_files
        (filename, original_name, media_type, storage_path, public_url, assigned_child_name, uploaded_by, visibility)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        filename,
        originalName || filename,
        mediaType,
        storagePath,
        publicUrl,
        assignedChildName || null,
        uploadedBy || "admin",
        visibility || "admin_only"
      ]
    );

    res.json({
      status: "registered",
      file: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: error.message
    });
  }
});

app.get("/admin/media-db", requireAdminKey, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM media_files ORDER BY created_at DESC"
    );

    res.json({
      status: "ok",
      count: result.rows.length,
      files: result.rows
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: error.message
    });
  }
});

app.get("/media/child/:childName", async (req, res) => {
  try {
    const childLoginOrName = req.params.childName;

    const childResult = await pool.query(
      `SELECT id, display_name, login_name
       FROM children
       WHERE LOWER(login_name) = LOWER($1)
          OR LOWER(display_name) = LOWER($1)
       LIMIT 1`,
      [childLoginOrName]
    );

    if (childResult.rows.length === 0) {
      return res.status(404).json({
        status: "failed",
        error: `Child not found: ${childLoginOrName}`
      });
    }

    const child = childResult.rows[0];

    const result = await pool.query(
      `SELECT * FROM media_files
       WHERE assigned_child_id = $1
       AND visibility IN ('child_allowed', 'public')
       ORDER BY created_at DESC`,
      [child.id]
    );

    res.json({
      status: "success",
      child,
      count: result.rowCount,
      media: result.rows
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      error: error.message
    });
  }
});


function renderMediaCards(files, options = {}) {
  const adminKey = options.adminKey || "";
  const showAdminForm = options.showAdminForm || false;
  const children = options.children || [];

  return files.map(file => {
    const url = file.public_url || file.publicUrl;
    const filename = file.filename;
    const mediaType = file.media_type || file.mediaType;
    const id = file.id || "";
    const assignedChild = file.assigned_child_name || "";
    const assignedChildId = file.assigned_child_id || "";
    const visibility = file.visibility || "admin_only";
    const encodedKey = encodeURIComponent(adminKey);

    const childOptions = children.map(child => {
      const selected = String(child.id) === String(assignedChildId) ? "selected" : "";
      const label = `${child.display_name}${child.parent_name ? " - Parent: " + child.parent_name : ""}`;
      return `<option value="${child.id}" ${selected}>${label}</option>`;
    }).join("");

    const bulkCheckbox = showAdminForm ? `
      <label style="display:flex;gap:8px;align-items:center;background:#fff3cd;padding:8px;border-radius:10px;margin-bottom:10px;">
        <input type="checkbox" name="mediaIds" value="${id}" form="bulkUpdateForm" />
        Select for bulk update
      </label>
    ` : "";

    const adminForm = showAdminForm ? `
      <form method="POST" action="/api/admin/media/${id}/update?key=${encodedKey}" class="assign-form">
        <input type="hidden" name="adminKey" value="${adminKey}" />

        <label>Assign to real child</label>
        <select name="assignedChildId">
          <option value="">Not assigned</option>
          ${childOptions}
        </select>

        <label>Optional child name text</label>
        <input type="text" name="assignedChildName" value="${assignedChild}" placeholder="Optional display name" />

        <label>Visibility</label>
        <select name="visibility">
          <option value="admin_only" ${visibility === "admin_only" ? "selected" : ""}>admin_only</option>
          <option value="parent_only" ${visibility === "parent_only" ? "selected" : ""}>parent_only</option>
          <option value="child_allowed" ${visibility === "child_allowed" ? "selected" : ""}>child_allowed</option>
          <option value="public" ${visibility === "public" ? "selected" : ""}>public</option>
        </select>

        <button type="submit">Update permission</button>
      </form>

      <form method="POST" action="/api/admin/media/${id}/delete?key=${encodedKey}" class="delete-form" onsubmit="return confirm('Delete this media?');">
        <input type="hidden" name="adminKey" value="${adminKey}" />
        <label>
          <input type="checkbox" name="deleteFile" value="yes" />
          Also delete file from NAS
        </label>
        <button type="submit">Delete media</button>
      </form>
    ` : "";

    if (mediaType === "video") {
      return `
        <div class="card">
          ${bulkCheckbox}
          <video controls>
            <source src="${url}">
          </video>
          <p><strong>${filename}</strong></p>
          <p>ID: ${id}</p>
          <p>Child ID: ${assignedChildId || "Not assigned"}</p>
          <p>Child name: ${assignedChild || "Not assigned"}</p>
          <p>Visibility: ${visibility}</p>
          <a href="${url}" target="_blank">Open video</a>
          ${adminForm}
        </div>
      `;
    }

    return `
      <div class="card">
        ${bulkCheckbox}
        <img src="${url}" alt="${filename}" />
        <p><strong>${filename}</strong></p>
        <p>ID: ${id}</p>
        <p>Child ID: ${assignedChildId || "Not assigned"}</p>
        <p>Child name: ${assignedChild || "Not assigned"}</p>
        <p>Visibility: ${visibility}</p>
        <a href="${url}" target="_blank">Open photo</a>
        ${adminForm}
      </div>
    `;
  }).join("");
}
function renderMediaPage(title, files, options = {}) {
  const cards = renderMediaCards(files, options);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f5f7fb;
          margin: 0;
          padding: 24px;
        }
        h1 {
          color: #222;
        }
        .upload-box {
          background: white;
          padding: 18px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .upload-box label {
          display: block;
          font-size: 13px;
          font-weight: bold;
          margin-top: 10px;
        }
        .upload-box input, .upload-box select {
          width: 100%;
          padding: 9px;
          margin-top: 5px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .upload-box button {
          margin-top: 14px;
          padding: 10px 16px;
          border: 0;
          border-radius: 6px;
          background: #00875a;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }
        .summary {
          background: white;
          padding: 14px;
          border-radius: 10px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 18px;
        }
        .card {
          background: white;
          border-radius: 12px;
          padding: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        img, video {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 8px;
          background: #ddd;
        }
        p {
          font-size: 13px;
          word-break: break-all;
          margin: 6px 0;
        }
        .assign-form {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #eee;
        }
        .assign-form label {
          display: block;
          font-size: 12px;
          font-weight: bold;
          margin-top: 8px;
        }
        .assign-form input, .assign-form select {
          width: 100%;
          padding: 8px;
          margin-top: 4px;
          border: 1px solid #ccc;
          border-radius: 6px;
        }
        .delete-form {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #f2caca;
        }
        .delete-form label {
          display: block;
          font-size: 12px;
          color: #7a1111;
        }
        .delete-form button {
          margin-top: 8px;
          width: 100%;
          padding: 9px;
          border: 0;
          border-radius: 6px;
          background: #b42318;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }
        .assign-form button {
          margin-top: 10px;
          width: 100%;
          padding: 9px;
          border: 0;
          border-radius: 6px;
          background: #0066cc;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }
        a {
          display: inline-block;
          margin-top: 6px;
          color: #0066cc;
          text-decoration: none;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="summary">
        <p><strong>Total files:</strong> ${files.length}</p>
      </div>

      ${options.showAdminForm ? `
      <div class="upload-box">
        <h2>Admin tools</h2>

        ${options.reindexMessage ? `<p style="background:#e8fff1;border:1px solid #b7ebc6;padding:10px;border-radius:8px;">${options.reindexMessage}</p>` : ""}

        <form method="GET" action="/api/admin/media-db-page" style="margin-bottom:14px;">
          <input type="hidden" name="key" value="${options.adminKey || ""}" />

          <label>Media type filter</label>
          <select name="mediaType">
            <option value="all" ${(options.filters?.mediaType || "all") === "all" ? "selected" : ""}>All media</option>
            <option value="photo" ${(options.filters?.mediaType || "all") === "photo" ? "selected" : ""}>Photos only</option>
            <option value="video" ${(options.filters?.mediaType || "all") === "video" ? "selected" : ""}>Videos only</option>
          </select>

          <label>Assignment filter</label>
          <select name="assignment">
            <option value="all" ${(options.filters?.assignment || "all") === "all" ? "selected" : ""}>All</option>
            <option value="assigned" ${(options.filters?.assignment || "all") === "assigned" ? "selected" : ""}>Assigned only</option>
            <option value="unassigned" ${(options.filters?.assignment || "all") === "unassigned" ? "selected" : ""}>Not assigned only</option>
          </select>

          <button type="submit">Apply filters</button>
        </form>

        <form method="POST" action="/api/admin/media/reindex?key=${encodeURIComponent(options.adminKey || "")}" onsubmit="return confirm('Reindex copied NAS files now?');">
          <input type="hidden" name="adminKey" value="${options.adminKey || ""}" />
          <button type="submit">Reindex copied NAS files</button>
        </form>

        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;">
          <button type="button" onclick="setAllMediaCheckboxes(true)">Select all shown</button>
          <button type="button" onclick="setAllMediaCheckboxes(false)">Unselect all shown</button>
        </div>
      </div>

      <div class="upload-box">
        <h2>Bulk update selected media</h2>
        <form id="bulkUpdateForm" method="POST" action="/api/admin/media/bulk-update?key=${encodeURIComponent(options.adminKey || "")}">
          <input type="hidden" name="adminKey" value="${options.adminKey || ""}" />

          <label>Assign selected media to child</label>
          <select name="assignedChildId">
            <option value="">Not assigned</option>
            ${(options.children || []).map(child => {
              const label = `${child.display_name}${child.parent_name ? " - Parent: " + child.parent_name : ""}`;
              return `<option value="${child.id}">${label}</option>`;
            }).join("")}
          </select>

          <label>Visibility for selected media</label>
          <select name="visibility">
            <option value="admin_only">admin_only</option>
            <option value="parent_only">parent_only</option>
            <option value="child_allowed">child_allowed</option>
            <option value="public">public</option>
          </select>

          <button type="submit">Update selected media</button>
        </form>
        <p style="font-size:13px;color:#666;">Tick media cards below, choose child/visibility here, then click update selected media.</p>
      </div>

      <div class="upload-box">
        <h2>Bulk delete selected media</h2>
        <form id="bulkDeleteForm" method="POST" action="/api/admin/media/bulk-delete?key=${encodeURIComponent(options.adminKey || "")}" onsubmit="return prepareBulkDelete();">
          <input type="hidden" name="adminKey" value="${options.adminKey || ""}" />
          <label>
            <input type="checkbox" name="deleteFiles" value="yes" />
            Also delete selected files from NAS
          </label>
          <button type="submit" style="background:#b91c1c;">Delete selected media</button>
        </form>
        <p style="font-size:13px;color:#666;">This deletes selected database records. Tick the checkbox to also delete files from NAS.</p>
      </div>

      <div class="upload-box">
        <h2>Upload new photo/video</h2>
        <form method="POST" action="/api/admin/media/upload?key=${encodeURIComponent(options.adminKey || "")}" enctype="multipart/form-data">
          <input type="hidden" name="adminKey" value="${options.adminKey || ""}" />
          <label>Select photo or video</label>
          <input type="file" name="file" required />

          <label>Assign child name</label>
          <input type="text" name="assignedChildName" placeholder="Example: Ammar" />

          <label>Visibility</label>
          <select name="visibility">
            <option value="admin_only">admin_only</option>
            <option value="parent_only">parent_only</option>
            <option value="child_allowed">child_allowed</option>
            <option value="public">public</option>
          </select>

          <button type="submit">Upload to NAS and register</button>
        </form>
      </div>
      ` : ""}

      <div class="grid">
        ${cards || "<p>No media found.</p>"}
      </div>
      <script>
        function setAllMediaCheckboxes(checked) {
          document.querySelectorAll('input[name="mediaIds"]').forEach(function(cb) {
            cb.checked = checked;
          });
        }

        function prepareBulkDelete() {
          const selected = Array.from(document.querySelectorAll('input[name="mediaIds"]:checked'));
          if (selected.length === 0) {
            alert("Please select at least one media item.");
            return false;
          }

          const form = document.getElementById("bulkDeleteForm");
          form.querySelectorAll('input[data-generated="media-id"]').forEach(function(input) {
            input.remove();
          });

          selected.forEach(function(cb) {
            const hidden = document.createElement("input");
            hidden.type = "hidden";
            hidden.name = "mediaIds";
            hidden.value = cb.value;
            hidden.setAttribute("data-generated", "media-id");
            form.appendChild(hidden);
          });

          return confirm("Delete " + selected.length + " selected media item(s)?");
        }
      </script>
    </body>
    </html>
  `;
}

app.get("/admin/media-db-page", requireAdminKey, async (req, res) => {
  try {
    const adminKey = req.query.key || req.body?.adminKey || req.headers["x-admin-key"] || "";

    const mediaTypeFilter = req.query.mediaType || "all";
    const assignmentFilter = req.query.assignment || "all";

    const where = [];
    const params = [];

    if (["photo", "video"].includes(mediaTypeFilter)) {
      params.push(mediaTypeFilter);
      where.push(`media_type = $${params.length}`);
    }

    if (assignmentFilter === "assigned") {
      where.push(`(assigned_child_id IS NOT NULL OR NULLIF(assigned_child_name, '') IS NOT NULL)`);
    }

    if (assignmentFilter === "unassigned") {
      where.push(`(assigned_child_id IS NULL AND (assigned_child_name IS NULL OR assigned_child_name = ''))`);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const mediaResult = await pool.query(
      `SELECT * FROM media_files ${whereSql} ORDER BY created_at DESC`,
      params
    );

    const childrenResult = await pool.query(
      `SELECT
         c.id,
         c.display_name,
         c.login_name,
         p.display_name AS parent_name
       FROM children c
       LEFT JOIN parents p ON p.id = c.parent_id
       ORDER BY c.display_name`
    );

    console.log("ADMIN_PAGE_CHILDREN_DEBUG " + JSON.stringify({
      childCount: childrenResult.rowCount,
      children: childrenResult.rows,
      filters: {
        mediaType: mediaTypeFilter,
        assignment: assignmentFilter
      }
    }));

    res.send(renderMediaPage("Master Admin - Registered Media", mediaResult.rows, {
      showAdminForm: true,
      adminKey,
      children: childrenResult.rows,
      filters: {
        mediaType: mediaTypeFilter,
        assignment: assignmentFilter
      },
      reindexMessage: req.query.reindexed === "1"
        ? `Reindex completed. Imported photos: ${req.query.photosImported || 0}, imported videos: ${req.query.videosImported || 0}.`
        : ""
    }));
  } catch (error) {
    console.log("ADMIN_PAGE_ERROR", error);
    res.status(500).send(`<h1>Error</h1><pre>${error.message}</pre>`);
  }
});

app.get("/media/child-page/:childName", async (req, res) => {
  try {
    const childLoginOrName = req.params.childName;

    const childResult = await pool.query(
      `SELECT id, display_name, login_name
       FROM children
       WHERE LOWER(login_name) = LOWER($1)
          OR LOWER(display_name) = LOWER($1)
       LIMIT 1`,
      [childLoginOrName]
    );

    if (childResult.rows.length === 0) {
      return res.status(404).send(`<h1>Child not found: ${childLoginOrName}</h1>`);
    }

    const child = childResult.rows[0];

    const result = await pool.query(
      `SELECT * FROM media_files
       WHERE assigned_child_id = $1
       AND visibility IN ('child_allowed', 'public')
       ORDER BY created_at DESC`,
      [child.id]
    );

    console.log("CHILD_GALLERY_DEBUG_JSON " + JSON.stringify({
      requested: childLoginOrName,
      child,
      mediaCount: result.rowCount
    }));

    res.send(renderMediaPage(`Child Gallery - ${child.display_name}`, result.rows));
  } catch (error) {
    console.log("CHILD_GALLERY_ERROR", error);
    res.status(500).send(`<h1>Error</h1><pre>${error.message}</pre>`);
  }
});



const adminMediaUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.mimetype.startsWith("video/")) {
        cb(null, videosDir);
      } else {
        cb(null, photosDir);
      }
    },
    filename: (req, file, cb) => {
      cb(null, safeFileName(file.originalname));
    }
  }),
  limits: {
    fileSize: 500 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime"
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP, GIF, MP4, WEBM, and MOV files are allowed"));
    }

    cb(null, true);
  }
});


function isSupportedMediaFile(filename, mediaType) {
  const ext = path.extname(filename).toLowerCase();

  if (mediaType === "photo") {
    return [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"].includes(ext);
  }

  if (mediaType === "video") {
    return [".mp4", ".mov", ".webm", ".mkv", ".avi", ".m4v"].includes(ext);
  }

  return false;
}

async function reindexMediaFolder(folderPath, mediaType) {
  if (!fs.existsSync(folderPath)) {
    return { scanned: 0, imported: 0, skipped: 0 };
  }

  const files = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(item => item.isFile())
    .map(item => item.name)
    .filter(name => !name.startsWith("."))
    .filter(name => isSupportedMediaFile(name, mediaType))
    .sort();

  let imported = 0;
  let skipped = 0;

  for (const filename of files) {
    const storagePath = `/app/uploads/${mediaType}s/${filename}`;
    const publicUrl = `/api/uploads/${mediaType}s/${filename}`;

    const result = await pool.query(
      `
      INSERT INTO media_files (
        filename,
        original_name,
        media_type,
        storage_path,
        public_url,
        uploaded_by,
        visibility
      )
      SELECT
        $1,
        $2,
        $3,
        $4,
        $5,
        'admin-reindex',
        'admin_only'
      WHERE NOT EXISTS (
        SELECT 1
        FROM media_files
        WHERE filename = $1
          AND media_type = $3
      )
      RETURNING id
      `,
      [filename, filename, mediaType, storagePath, publicUrl]
    );

    if (result.rowCount > 0) {
      imported++;
    } else {
      skipped++;
    }
  }

  return {
    scanned: files.length,
    imported,
    skipped
  };
}

app.post("/admin/media/reindex", requireAdminKey, async (req, res) => {
  try {
    const adminKey = req.query.key || req.body?.adminKey || req.headers["x-admin-key"] || "";

    const photoResult = await reindexMediaFolder(photosDir, "photo");
    const videoResult = await reindexMediaFolder(videosDir, "video");

    console.log("MEDIA_REINDEX_RESULT_JSON " + JSON.stringify({
      photoResult,
      videoResult
    }));

    res.redirect(`/api/admin/media-db-page?key=${encodeURIComponent(adminKey)}&reindexed=1&photosImported=${photoResult.imported}&videosImported=${videoResult.imported}`);
  } catch (error) {
    console.log("MEDIA_REINDEX_ERROR", error);
    res.status(500).send(`<h1>Reindex failed</h1><pre>${error.message}</pre>`);
  }
});

app.post("/admin/media/bulk-delete", requireAdminKey, async (req, res) => {
  try {
    const adminKey = req.query.key || req.body?.adminKey || req.headers["x-admin-key"] || "";
    const deleteFiles = req.body?.deleteFiles === "yes";

    let mediaIds = req.body?.mediaIds || [];
    if (!Array.isArray(mediaIds)) {
      mediaIds = [mediaIds];
    }

    mediaIds = mediaIds
      .map(id => Number(id))
      .filter(id => Number.isInteger(id) && id > 0);

    if (mediaIds.length === 0) {
      return res.status(400).send(`
        <h1>No media selected</h1>
        <p>Please go back, select at least one media item, then try again.</p>
        <a href="/api/admin/media-db-page?key=${encodeURIComponent(adminKey)}">Back to admin media</a>
      `);
    }

    const existing = await pool.query(
      "SELECT * FROM media_files WHERE id = ANY($1::int[])",
      [mediaIds]
    );

    if (deleteFiles) {
      for (const file of existing.rows) {
        let realPath = null;

        if (file.media_type === "photo") {
          realPath = path.join(photosDir, file.filename);
        }

        if (file.media_type === "video") {
          realPath = path.join(videosDir, file.filename);
        }

        if (realPath && fs.existsSync(realPath)) {
          fs.unlinkSync(realPath);
        }
      }
    }

    const result = await pool.query(
      "DELETE FROM media_files WHERE id = ANY($1::int[]) RETURNING id, filename, media_type",
      [mediaIds]
    );

    console.log("MEDIA_BULK_DELETE_RESULT_JSON " + JSON.stringify({
      deleteFiles,
      requestedCount: mediaIds.length,
      deletedCount: result.rowCount,
      rows: result.rows
    }));

    res.redirect(`/api/admin/media-db-page?key=${encodeURIComponent(adminKey)}`);
  } catch (error) {
    console.log("MEDIA_BULK_DELETE_ERROR", error);
    res.status(500).send(`<h1>Bulk delete failed</h1><pre>${error.message}</pre>`);
  }
});


app.post("/admin/media/upload", requireAdminKey, adminMediaUpload.single("file"), async (req, res) => {
  try {
    const adminKey = req.query.key || req.body?.adminKey || req.headers["x-admin-key"] || "";
    const { assignedChildName, visibility } = req.body;

    if (!req.file) {
      return res.status(400).send("<h1>No file uploaded</h1>");
    }

    const isVideo = req.file.mimetype.startsWith("video/");
    const mediaType = isVideo ? "video" : "photo";
    const folder = isVideo ? "videos" : "photos";

    const publicUrl = `/api/uploads/${folder}/${req.file.filename}`;
    const storagePath = `/app/uploads/${folder}/${req.file.filename}`;

    await pool.query(
      `INSERT INTO media_files
        (filename, original_name, media_type, storage_path, public_url, assigned_child_name, uploaded_by, visibility)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        req.file.filename,
        req.file.originalname,
        mediaType,
        storagePath,
        publicUrl,
        assignedChildName || null,
        "admin",
        visibility || "admin_only"
      ]
    );

    res.redirect(`/api/admin/media-db-page?key=${encodeURIComponent(adminKey)}`);
  } catch (error) {
    res.status(500).send(`<h1>Upload failed</h1><pre>${error.message}</pre>`);
  }
});



app.post("/admin/media/bulk-update", requireAdminKey, async (req, res) => {
  try {
    const adminKey = req.query.key || req.body?.adminKey || req.headers["x-admin-key"] || "";

    let mediaIds = req.body?.mediaIds || [];
    if (!Array.isArray(mediaIds)) {
      mediaIds = [mediaIds];
    }

    mediaIds = mediaIds
      .map(id => Number(id))
      .filter(id => Number.isInteger(id) && id > 0);

    const assignedChildId =
      req.body?.assignedChildId && req.body.assignedChildId !== ""
        ? Number(req.body.assignedChildId)
        : null;

    const visibility = req.body?.visibility || "admin_only";

    if (mediaIds.length === 0) {
      return res.status(400).send(`
        <h1>No media selected</h1>
        <p>Please go back, tick at least one media item, then try again.</p>
        <a href="/api/admin/media-db-page?key=${encodeURIComponent(adminKey)}">Back to admin media</a>
      `);
    }

    let assignedChildName = null;

    if (assignedChildId) {
      const childResult = await pool.query(
        "SELECT display_name FROM children WHERE id = $1",
        [assignedChildId]
      );

      if (childResult.rows.length === 0) {
        return res.status(404).send(`<h1>Child ID ${assignedChildId} not found</h1>`);
      }

      assignedChildName = childResult.rows[0].display_name;
    }

    const result = await pool.query(
      `UPDATE media_files
       SET assigned_child_id = $1,
           assigned_child_name = $2,
           visibility = $3
       WHERE id = ANY($4::int[])
       RETURNING id, filename, assigned_child_id, assigned_child_name, visibility`,
      [assignedChildId, assignedChildName, visibility, mediaIds]
    );

    console.log("MEDIA_BULK_UPDATE_RESULT_JSON " + JSON.stringify({
      selectedIds: mediaIds,
      assignedChildId,
      assignedChildName,
      visibility,
      rowCount: result.rowCount,
      rows: result.rows
    }));

    res.redirect(`/api/admin/media-db-page?key=${encodeURIComponent(adminKey)}`);
  } catch (error) {
    console.log("MEDIA_BULK_UPDATE_ERROR", error);
    res.status(500).send(`<h1>Bulk update failed</h1><pre>${error.message}</pre>`);
  }
});

app.post("/admin/media/:id/delete", requireAdminKey, async (req, res) => {
  try {
    const id = req.params.id;
    const adminKey = req.query.key || req.body?.adminKey || req.headers["x-admin-key"] || "";
    const { deleteFile } = req.body;

    const existing = await pool.query(
      "SELECT * FROM media_files WHERE id = $1",
      [id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).send("<h1>Media record not found</h1>");
    }

    const file = existing.rows[0];

    if (deleteFile === "yes") {
      let realPath = null;

      if (file.media_type === "photo") {
        realPath = path.join(photosDir, file.filename);
      }

      if (file.media_type === "video") {
        realPath = path.join(videosDir, file.filename);
      }

      if (realPath && fs.existsSync(realPath)) {
        fs.unlinkSync(realPath);
      }
    }

    await pool.query(
      "DELETE FROM media_files WHERE id = $1",
      [id]
    );

    res.redirect(`/api/admin/media-db-page?key=${encodeURIComponent(adminKey)}`);
  } catch (error) {
    res.status(500).send(`<h1>Delete failed</h1><pre>${error.message}</pre>`);
  }
});

app.post("/admin/media/:id/update", requireAdminKey, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const adminKey = req.query.key || req.body?.adminKey || req.headers["x-admin-key"] || "";

    const assignedChildId =
      req.body?.assignedChildId && req.body.assignedChildId !== ""
        ? Number(req.body.assignedChildId)
        : null;

    let assignedChildName =
      req.body?.assignedChildName && req.body.assignedChildName.trim() !== ""
        ? req.body.assignedChildName.trim()
        : null;

    const visibility = req.body?.visibility || "admin_only";

    if (assignedChildId) {
      const childResult = await pool.query(
        "SELECT display_name FROM children WHERE id = $1",
        [assignedChildId]
      );

      if (childResult.rows.length === 0) {
        return res.status(404).send(`<h1>Child ID ${assignedChildId} not found</h1>`);
      }

      assignedChildName = childResult.rows[0].display_name;
    }

    console.log("MEDIA_UPDATE_DEBUG_JSON " + JSON.stringify({
      id,
      assignedChildId,
      assignedChildName,
      visibility,
      body: req.body
    }));

    const result = await pool.query(
      `UPDATE media_files
       SET assigned_child_id = $1,
           assigned_child_name = $2,
           visibility = $3
       WHERE id = $4
       RETURNING id, filename, assigned_child_id, assigned_child_name, visibility`,
      [assignedChildId, assignedChildName, visibility, id]
    );

    console.log("MEDIA_UPDATE_RESULT_JSON " + JSON.stringify({
      rowCount: result.rowCount,
      rows: result.rows
    }));

    if (result.rowCount === 0) {
      return res.status(404).send(`<h1>Media ID ${id} not found</h1>`);
    }

    res.redirect(`/api/admin/media-db-page?key=${encodeURIComponent(adminKey)}`);
  } catch (error) {
    console.log("MEDIA_UPDATE_ERROR", error);
    res.status(500).send(`<h1>Update failed</h1><pre>${error.message}</pre>`);
  }
});

app.use((error, req, res, next) => {
  res.status(400).json({
    status: "failed",
    error: error.message
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Saratube API listening on port ${port}`);
  console.log(`Upload root: ${uploadRoot}`);
});
