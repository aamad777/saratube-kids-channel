import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { testDbConnection, pool } from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use("/uploads", express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeOriginal}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024,
  },
});


const PORT = process.env.PORT || 4000;
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET environment variable is required");
  process.exit(1);
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

app.use(cors());
app.use(express.json());

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      error: "Missing Authorization Bearer token"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: "Invalid or expired token"
    });
  }
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN
    }
  );
}

async function askOllama(prompt) {
  const ollamaResponse = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false
    })
  });

  if (!ollamaResponse.ok) {
    const errorText = await ollamaResponse.text();
    throw new Error(`Ollama request failed: ${errorText}`);
  }

  const data = await ollamaResponse.json();
  return data.response;
}

app.get("/api/health", async (req, res) => {
  try {
    const db = await testDbConnection();

    res.json({
      status: "ok",
      service: "saratube-backend-api",
      mode: "on-premise",
      database: {
        status: "ok",
        name: db.database,
        user: db.user
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      service: "saratube-backend-api",
      mode: "on-premise",
      database: {
        status: "error",
        message: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});


app.post("/api/auth/register", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const displayName = String(req.body?.displayName || "").trim();
    const role = req.body?.role || "parent";

    if (!email || !password || !displayName) {
      return res.status(400).json({
        error: "email, password, and displayName are required"
      });
    }

    if (!["parent", "child", "admin"].includes(role)) {
      return res.status(400).json({
        error: "Invalid role"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role, created_at`,
      [email, passwordHash, role]
    );

    const user = userResult.rows[0];

    await pool.query(
      `INSERT INTO profiles (user_id, display_name, is_parent)
       VALUES ($1, $2, $3)`,
      [user.id, displayName, role === "parent"]
    );

    const token = createToken(user);

    res.status(201).json({
      status: "ok",
      user,
      token
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Email already exists"
      });
    }

    console.error("Register error:", error);
    res.status(500).json({
      error: "Register failed",
      details: error.message
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email || !password) {
      return res.status(400).json({
        error: "email and password are required"
      });
    }

    const result = await pool.query(
      `SELECT id, email, password_hash, role, created_at
       FROM users
       WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    };

    const token = createToken(safeUser);

    res.json({
      status: "ok",
      user: safeUser,
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      details: error.message
    });
  }
});



app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json({
      status: "ok",
      user
    });
  } catch (error) {
    console.error("Auth me error:", error);
    res.status(500).json({
      error: "Failed to get current user",
      details: error.message
    });
  }
});



app.get("/api/parent/children", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "parent" && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Parent access required"
      });
    }

    const result = await pool.query(
      `SELECT
         id,
         user_id,
         display_name,
         avatar_url,
         age,
         selected_theme,
         created_by_parent,
         child_login_id,
         created_at
       FROM profiles
       WHERE created_by_parent = $1
         AND is_parent = false
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      status: "ok",
      children: result.rows
    });
  } catch (error) {
    console.error("Fetch children error:", error);
    res.status(500).json({
      error: "Failed to fetch children",
      details: error.message
    });
  }
});

app.post("/api/parent/children", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "parent" && req.user.role !== "admin") {
      return res.status(403).json({
        error: "Parent access required"
      });
    }

    const displayName = String(req.body?.displayName || "").trim();
    const age = req.body?.age ? Number(req.body.age) : null;
    const selectedTheme = req.body?.selectedTheme || "rainbow";
    const childLoginId = req.body?.childLoginId
      ? String(req.body.childLoginId).trim().toLowerCase()
      : null;
    const pin = req.body?.pin ? String(req.body.pin) : null;

    if (pin && !/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        error: "PIN must be 4 digits"
      });
    }

    const pinHash = pin
      ? await bcrypt.hash(pin, 12)
      : null;

    if (!displayName) {
      return res.status(400).json({
        error: "displayName is required"
      });
    }

    const childUserResult = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, 'child')
       RETURNING id, email, role, created_at`,
      [
        `${crypto.randomUUID()}@child.local`,
        pinHash || "child-login-disabled-for-now"
      ]
    );

    const childUser = childUserResult.rows[0];

    const profileResult = await pool.query(
      `INSERT INTO profiles
         (user_id, display_name, age, selected_theme, is_parent, created_by_parent, child_login_id, pin_hash)
       VALUES
         ($1, $2, $3, $4, false, $5, $6, $7)
       RETURNING
         id,
         user_id,
         display_name,
         avatar_url,
         age,
         selected_theme,
         created_by_parent,
         child_login_id,
         created_at`,
      [
        childUser.id,
        displayName,
        age,
        selectedTheme,
        req.user.id,
        childLoginId,
        pinHash
      ]
    );

    res.status(201).json({
      status: "ok",
      child: profileResult.rows[0]
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Child login ID already exists"
      });
    }

    console.error("Create child error:", error);
    res.status(500).json({
      error: "Failed to create child",
      details: error.message
    });
  }
});



app.post("/api/child/login", async (req, res) => {
  try {
    const childLoginId = String(req.body?.childLoginId || "").trim().toLowerCase();
    const pin = String(req.body?.pin || "");

    if (!childLoginId || !pin) {
      return res.status(400).json({
        error: "childLoginId and pin are required"
      });
    }

    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        error: "PIN must be 4 digits"
      });
    }

    const result = await pool.query(
      `SELECT
         p.id,
         p.user_id,
         p.display_name,
         p.avatar_url,
         p.age,
         p.selected_theme,
         p.child_login_id,
         p.pin_hash,
         p.created_by_parent,
         u.role
       FROM profiles p
       JOIN users u ON u.id = p.user_id
       WHERE lower(p.child_login_id) = $1
         AND p.is_parent = false
         AND u.role = 'child'
       LIMIT 1`,
      [childLoginId]
    );

    const child = result.rows[0];

    if (!child || !child.pin_hash) {
      return res.status(401).json({
        error: "Invalid child login ID or PIN"
      });
    }

    const pinOk = await bcrypt.compare(pin, child.pin_hash);

    if (!pinOk) {
      return res.status(401).json({
        error: "Invalid child login ID or PIN"
      });
    }

    res.json({
      status: "ok",
      child: {
        id: child.id,
        userId: child.user_id,
        name: child.display_name,
        avatarUrl: child.avatar_url,
        age: child.age,
        theme: child.selected_theme || "rainbow",
        childLoginId: child.child_login_id,
        parentId: child.created_by_parent
      }
    });
  } catch (error) {
    console.error("Child login error:", error);
    res.status(500).json({
      error: "Child login failed",
      details: error.message
    });
  }
});


app.post("/api/ai/test", async (req, res) => {
  try {
    const prompt = req.body?.prompt || "Say hello from SaraTube local AI.";
    const response = await askOllama(prompt);

    res.json({
      status: "ok",
      model: OLLAMA_MODEL,
      response
    });
  } catch (error) {
    console.error("AI test error:", error);
    res.status(500).json({
      error: "AI test failed",
      details: error.message
    });
  }
});

app.post("/api/ai/parent-advisor", async (req, res) => {
  try {
    const messages = req.body?.messages || [];
    const childInfo = req.body?.childInfo || null;

    const latestUserMessage =
      messages.length > 0
        ? messages[messages.length - 1].content
        : "Give general safe screen-time advice for parents.";

    const childContext = childInfo
      ? `Child information: name=${childInfo.name || "unknown"}, age=${childInfo.age || "unknown"}`
      : "Child information: not provided";

    const prompt = `
You are SaraTube Parent Advisor.
You help parents choose safe, educational, age-appropriate video content for children.

Rules:
- Give practical advice.
- Keep the answer short and clear.
- Do not provide medical diagnosis.
- Do not encourage unsafe or inappropriate content.
- Prefer educational, calm, family-safe recommendations.

${childContext}

Parent question:
${latestUserMessage}
`;

    const response = await askOllama(prompt);

    res.json({
      status: "ok",
      model: OLLAMA_MODEL,
      response
    });
  } catch (error) {
    console.error("Parent advisor error:", error);
    res.status(500).json({
      error: "Parent advisor failed",
      details: error.message
    });
  }
});


app.post("/api/ai/quiz-advisor", async (req, res) => {
  try {
    const answers = req.body?.answers || [];

    const formattedAnswers = answers
      .map((item, index) => `${index + 1}. ${item.question}: ${item.answer}`)
      .join("\n");

    const prompt = `
You are SaraTube Content Advisor.
You help parents choose safe, educational, age-appropriate video content for children.

The parent completed a quiz about their child.

Rules:
- Give short and practical recommendations.
- Recommend safe categories, not external websites.
- Keep the tone friendly.
- Focus on educational and family-safe content.
- Do not provide medical diagnosis.
- Do not encourage unsafe or inappropriate content.

Quiz answers:
${formattedAnswers || "No quiz answers provided."}

Give:
1. Recommended content types
2. Best time/length suggestion
3. Simple parent tip
`;

    const response = await askOllama(prompt);

    res.json({
      status: "ok",
      model: OLLAMA_MODEL,
      response
    });
  } catch (error) {
    console.error("Quiz advisor error:", error);
    res.status(500).json({
      error: "Quiz advisor failed",
      details: error.message
    });
  }
});



app.post("/api/ai/kids-chat", async (req, res) => {
  try {
    const messages = req.body?.messages || [];

    const latestUserMessage =
      messages.length > 0
        ? messages[messages.length - 1].content
        : "Hello";

    const prompt = `
You are SaraTube Kids Helper.
You talk to children in a safe, kind, simple, and friendly way.

Very important safety rules:
- Keep answers very short.
- Use simple child-friendly words.
- Do not ask for personal information.
- Do not ask for name, address, school, phone, location, email, or passwords.
- Do not discuss adult topics.
- Do not suggest unsafe actions.
- Do not give medical, legal, or dangerous advice.
- If the child asks something unsafe or private, gently say to ask a parent.
- Prefer educational, creative, calm, and positive answers.

Child message:
${latestUserMessage}

Answer in 1 to 4 short sentences.
`;

    const response = await askOllama(prompt);

    res.json({
      status: "ok",
      model: OLLAMA_MODEL,
      response
    });
  } catch (error) {
    console.error("Kids chat error:", error);
    res.status(500).json({
      error: "Kids chat failed",
      details: error.message
    });
  }
});




app.delete("/api/parent/children/:profileId", requireAuth, async (req, res) => {
  const client = await pool.connect();

  try {
    if (!["parent", "admin"].includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "Only parents can delete child profiles",
      });
    }

    const { profileId } = req.params;

    await client.query("BEGIN");

    const childResult = await client.query(
      `SELECT p.id, p.user_id
       FROM profiles p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = $1
         AND p.created_by_parent = $2
         AND p.is_parent = false
         AND u.role = 'child'`,
      [profileId, req.user.id]
    );

    if (childResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        status: "error",
        message: "Child not found or not owned by this parent",
      });
    }

    const childUserId = childResult.rows[0].user_id;

    await client.query("DELETE FROM users WHERE id = $1", [childUserId]);

    await client.query("COMMIT");

    res.json({
      status: "ok",
      message: "Child deleted",
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Delete child error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete child",
    });
  } finally {
    client.release();
  }
});



app.patch("/api/child/:profileId/theme", async (req, res) => {
  try {
    const { profileId } = req.params;
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({
        status: "error",
        message: "Theme is required",
      });
    }

    const result = await pool.query(
      `UPDATE profiles
       SET selected_theme = $1,
           updated_at = now()
       WHERE id = $2
         AND is_parent = false
       RETURNING id, display_name, selected_theme`,
      [theme, profileId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Child profile not found",
      });
    }

    res.json({
      status: "ok",
      child: result.rows[0],
    });
  } catch (error) {
    console.error("Update child theme error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update child theme",
    });
  }
});

app.get("/api/child/:profileId/media", async (req, res) => {
  try {
    const { profileId } = req.params;

    const result = await pool.query(
      `SELECT
         m.id,
         m.media_type,
         m.title,
         m.description,
         m.category,
         m.public_url,
         m.thumbnail_url,
         m.original_filename,
         m.mime_type,
         m.size_bytes,
         m.created_at,
         mca.no_limit,
         mca.daily_limit_minutes,
         mca.available_from,
         mca.available_until
       FROM media_files m
       JOIN media_child_access mca ON mca.media_id = m.id
       WHERE mca.child_profile_id = $1
         AND mca.is_allowed = true
         AND (mca.available_from IS NULL OR mca.available_from <= now())
         AND (mca.available_until IS NULL OR mca.available_until >= now())
       ORDER BY m.created_at DESC`,
      [profileId]
    );

    res.json({
      status: "ok",
      media: result.rows,
    });
  } catch (error) {
    console.error("Child media error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to load child media",
    });
  }
});

app.get("/api/media/files", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         m.id,
         m.owner_user_id,
         m.media_type,
         m.title,
         m.description,
         m.category,
         m.public_url,
         m.thumbnail_url,
         m.original_filename,
         m.mime_type,
         m.size_bytes,
         m.created_at,
         COALESCE(
           json_agg(
             json_build_object(
               'child_profile_id', p.id,
               'display_name', p.display_name,
               'age', p.age
             )
           ) FILTER (WHERE p.id IS NOT NULL),
           '[]'
         ) AS child_access
       FROM media_files m
       LEFT JOIN media_child_access mca ON mca.media_id = m.id
       LEFT JOIN profiles p ON p.id = mca.child_profile_id
       GROUP BY m.id
       ORDER BY m.created_at DESC
       LIMIT 100`
    );

    res.json({
      status: "ok",
      media: result.rows,
    });
  } catch (error) {
    console.error("Media list error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to load media files",
    });
  }
});

app.post("/api/media/upload", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      });
    }

    const title = req.body.title || req.file.originalname;
    const description = req.body.description || null;
    const category = req.body.category || "general";

    const mimeType = req.file.mimetype || "";
    const mediaType = mimeType.startsWith("video/") ? "video" : "photo";

    const publicUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const result = await pool.query(
      `INSERT INTO media_files (
         owner_user_id,
         media_type,
         title,
         description,
         category,
         file_path,
         public_url,
         original_filename,
         mime_type,
         size_bytes
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        req.user.id,
        mediaType,
        title,
        description,
        category,
        req.file.path,
        publicUrl,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
      ]
    );

    const media = result.rows[0];

    let childProfileIds = [];
    try {
      childProfileIds = req.body.childProfileIds
        ? JSON.parse(req.body.childProfileIds)
        : [];
    } catch {
      childProfileIds = [];
    }

    if (Array.isArray(childProfileIds) && childProfileIds.length > 0) {
      const accessRows = childProfileIds.map((childProfileId) => [
        media.id,
        childProfileId,
        req.user.id,
      ]);

      for (const row of accessRows) {
        await pool.query(
          `INSERT INTO media_child_access (media_id, child_profile_id, granted_by)
           VALUES ($1, $2, $3)
           ON CONFLICT (media_id, child_profile_id) DO NOTHING`,
          row
        );
      }
    }

    res.json({
      status: "ok",
      media,
      childProfileIds,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      status: "error",
      message: "Upload failed",
    });
  }
});


app.post("/api/media/upload-v2", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file uploaded" });
    }

    const title = req.body.title || req.file.originalname;
    const description = req.body.description || null;
    const category = req.body.category || "general";

    const mimeType = req.file.mimetype || "";
    const mediaType = mimeType.startsWith("video/") ? "video" : "photo";

    const publicUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const mediaResult = await pool.query(
      `INSERT INTO media_files (
         owner_user_id,
         media_type,
         title,
         description,
         category,
         file_path,
         public_url,
         original_filename,
         mime_type,
         size_bytes
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        req.user.id,
        mediaType,
        title,
        description,
        category,
        req.file.path,
        publicUrl,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
      ]
    );

    const media = mediaResult.rows[0];

    let childProfileIds = [];
    try {
      childProfileIds = req.body.childProfileIds ? JSON.parse(req.body.childProfileIds) : [];
    } catch {
      childProfileIds = [];
    }

    const noLimit = req.body.noLimit === "true";
    const dailyLimitMinutes = req.body.dailyLimitMinutes ? Number(req.body.dailyLimitMinutes) : null;
    const availableFrom = req.body.availableFrom || null;
    const availableUntil = req.body.availableUntil || null;

    for (const childProfileId of childProfileIds) {
      await pool.query(
        `INSERT INTO media_child_access (
           media_id,
           child_profile_id,
           granted_by,
           is_allowed,
           no_limit,
           daily_limit_minutes,
           available_from,
           available_until,
           updated_at
         )
         VALUES ($1,$2,$3,true,$4,$5,$6,$7,now())
         ON CONFLICT (media_id, child_profile_id)
         DO UPDATE SET
           is_allowed = true,
           no_limit = EXCLUDED.no_limit,
           daily_limit_minutes = EXCLUDED.daily_limit_minutes,
           available_from = EXCLUDED.available_from,
           available_until = EXCLUDED.available_until,
           updated_at = now()`,
        [
          media.id,
          childProfileId,
          req.user.id,
          noLimit,
          dailyLimitMinutes,
          availableFrom,
          availableUntil,
        ]
      );
    }

    res.json({ status: "ok", media });
  } catch (error) {
    console.error("Upload v2 error:", error);
    res.status(500).json({ status: "error", message: "Upload failed" });
  }
});

app.get("/api/media/manage", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         m.id,
         m.owner_user_id,
         m.media_type,
         m.title,
         m.description,
         m.category,
         m.public_url,
         m.thumbnail_url,
         m.original_filename,
         m.mime_type,
         m.size_bytes,
         m.created_at,
         COALESCE(
           json_agg(
             json_build_object(
               'child_profile_id', p.id,
               'display_name', p.display_name,
               'age', p.age,
               'child_login_id', p.child_login_id,
               'no_limit', mca.no_limit,
               'daily_limit_minutes', mca.daily_limit_minutes,
               'available_from', mca.available_from,
               'available_until', mca.available_until
             )
           ) FILTER (WHERE p.id IS NOT NULL),
           '[]'
         ) AS child_access
       FROM media_files m
       LEFT JOIN media_child_access mca ON mca.media_id = m.id
       LEFT JOIN profiles p ON p.id = mca.child_profile_id
       WHERE m.owner_user_id = $1 OR $2 = 'admin'
       GROUP BY m.id
       ORDER BY m.created_at DESC`,
      [req.user.id, req.user.role]
    );

    res.json({ status: "ok", media: result.rows });
  } catch (error) {
    console.error("Media manage error:", error);
    res.status(500).json({ status: "error", message: "Failed to load media" });
  }
});

app.post("/api/media/:mediaId/access", requireAuth, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { childProfileId, noLimit, dailyLimitMinutes, availableFrom, availableUntil } = req.body;

    if (!childProfileId) {
      return res.status(400).json({ status: "error", message: "childProfileId is required" });
    }

    await pool.query(
      `INSERT INTO media_child_access (
         media_id,
         child_profile_id,
         granted_by,
         is_allowed,
         no_limit,
         daily_limit_minutes,
         available_from,
         available_until,
         updated_at
       )
       VALUES ($1,$2,$3,true,$4,$5,$6,$7,now())
       ON CONFLICT (media_id, child_profile_id)
       DO UPDATE SET
         is_allowed = true,
         no_limit = EXCLUDED.no_limit,
         daily_limit_minutes = EXCLUDED.daily_limit_minutes,
         available_from = EXCLUDED.available_from,
         available_until = EXCLUDED.available_until,
         updated_at = now()`,
      [
        mediaId,
        childProfileId,
        req.user.id,
        !!noLimit,
        dailyLimitMinutes || null,
        availableFrom || null,
        availableUntil || null,
      ]
    );

    res.json({ status: "ok", message: "Child linked" });
  } catch (error) {
    console.error("Link media error:", error);
    res.status(500).json({ status: "error", message: "Failed to link child" });
  }
});


app.patch("/api/media/:mediaId", requireAuth, async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { title, description, category } = req.body;

    const result = await pool.query(
      `UPDATE media_files
       SET
         title = COALESCE($1, title),
         description = $2,
         category = COALESCE($3, category),
         updated_at = now()
       WHERE id = $4
         AND (owner_user_id = $5 OR $6 = 'admin')
       RETURNING *`,
      [
        title || null,
        description || null,
        category || null,
        mediaId,
        req.user.id,
        req.user.role,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Media not found or not owned by you",
      });
    }

    res.json({
      status: "ok",
      media: result.rows[0],
    });
  } catch (error) {
    console.error("Edit media error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to edit media",
    });
  }
});

app.delete("/api/media/:mediaId/access/:childProfileId", requireAuth, async (req, res) => {
  try {
    const { mediaId, childProfileId } = req.params;

    await pool.query(
      `DELETE FROM media_child_access
       WHERE media_id = $1 AND child_profile_id = $2`,
      [mediaId, childProfileId]
    );

    res.json({ status: "ok", message: "Child unlinked" });
  } catch (error) {
    console.error("Unlink media error:", error);
    res.status(500).json({ status: "error", message: "Failed to unlink child" });
  }
});

app.delete("/api/media/:mediaId", requireAuth, async (req, res) => {
  try {
    const { mediaId } = req.params;

    await pool.query(
      `DELETE FROM media_files
       WHERE id = $1 AND (owner_user_id = $2 OR $3 = 'admin')`,
      [mediaId, req.user.id, req.user.role]
    );

    res.json({ status: "ok", message: "Media deleted" });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({ status: "error", message: "Failed to delete media" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SaraTube backend API running on port ${PORT}`);
  console.log(`Using Ollama at ${OLLAMA_URL}`);
  console.log(`Using model ${OLLAMA_MODEL}`);
});
