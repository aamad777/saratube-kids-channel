import bcrypt from 'bcryptjs';
import { requireAuth, requireParent } from './auth.js';

export function registerDataRoutes(app, pool) {
  const own = (req) => Number(req.user.sub); // parent id from JWT

  // ---------- children ----------
  app.get('/api/children', requireAuth, requireParent, async (req, res) => {
    const { rows } = await pool.query(
      `SELECT id, display_name, login_name, age, avatar_url, selected_theme, login_code,
              pin_hash IS NOT NULL AS has_pin, created_at
       FROM children WHERE parent_id=$1 ORDER BY id`, [own(req)]);
    res.json(rows);
  });

  app.post('/api/children', requireAuth, requireParent, async (req, res) => {
    const { display_name, login_name, age, pin } = req.body || {};
    if (!display_name) return res.status(400).json({ error: 'display_name required' });
    const pin_hash = pin ? await bcrypt.hash(String(pin), 12) : null;
    try {
      const { rows } = await pool.query(
        `INSERT INTO children (parent_id, display_name, login_name, age, pin_hash)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id, display_name, login_name, age, avatar_url, selected_theme`,
        [own(req), display_name, login_name || display_name.toLowerCase(), age ?? null, pin_hash]);
      res.status(201).json(rows[0]);
    } catch (e) {
      if (e.code === '23505') return res.status(409).json({ error: 'login name already taken' });
      console.error(e); res.status(500).json({ error: 'create failed' });
    }
  });

  app.put('/api/children/:id', requireAuth, requireParent, async (req, res) => {
    const { display_name, login_name, age, avatar_url, selected_theme } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE children SET
         display_name = COALESCE($1, display_name),
         login_name   = COALESCE($2, login_name),
         age          = COALESCE($3, age),
         avatar_url   = COALESCE($4, avatar_url),
         selected_theme = COALESCE($5, selected_theme)
       WHERE id=$6 AND parent_id=$7
       RETURNING id, display_name, login_name, age, avatar_url, selected_theme`,
      [display_name, login_name, age, avatar_url, selected_theme, req.params.id, own(req)]);
    if (!rows[0]) return res.status(404).json({ error: 'child not found' });
    res.json(rows[0]);
  });

  app.delete('/api/children/:id', requireAuth, requireParent, async (req, res) => {
    const { rowCount } = await pool.query(
      `DELETE FROM children WHERE id=$1 AND parent_id=$2`, [req.params.id, own(req)]);
    if (!rowCount) return res.status(404).json({ error: 'child not found' });
    res.json({ ok: true });
  });

  // ---------- media (parent view) ----------
  app.get('/api/media', requireAuth, requireParent, async (req, res) => {
    const type = req.query.type; // photo | video | undefined
    const params = [own(req)];
    let where = `(m.uploaded_by_parent_id=$1 OR m.uploaded_by_parent_id IS NULL)`;
    if (type) { params.push(type); where += ` AND m.media_type=$2`; }
    const { rows } = await pool.query(
      `SELECT m.*,
        COALESCE(json_agg(json_build_object('child_id', a.child_id, 'name', c.display_name))
                 FILTER (WHERE a.child_id IS NOT NULL), '[]') AS access
       FROM media_files m
       LEFT JOIN media_child_access a ON a.media_id = m.id
       LEFT JOIN children c ON c.id = a.child_id
       WHERE ${where}
       GROUP BY m.id ORDER BY m.created_at DESC`, params);
    res.json(rows);
  });

  app.put('/api/media/:id', requireAuth, requireParent, async (req, res) => {
    const { original_name, visibility, title, description, category, available_from, available_until } = req.body || {};
    const { rows } = await pool.query(
      `UPDATE media_files SET
         original_name    = COALESCE($1, original_name),
         visibility       = COALESCE($2, visibility),
         title            = COALESCE($3, title),
         description      = COALESCE($4, description),
         category         = COALESCE($5, category),
         available_from   = $6,
         available_until  = $7
       WHERE id=$8 RETURNING *`,
      [original_name, visibility, title, description, category,
       available_from || null, available_until || null, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'media not found' });
    res.json(rows[0]);
  });

  // Add children to an item's access list WITHOUT removing existing ones (bulk assign)
  app.post('/api/media/:id/access/add', requireAuth, requireParent, async (req, res) => {
    const childIds = (req.body?.child_ids || []).map(Number).filter(Boolean);
    const mediaId = Number(req.params.id);
    for (const cid of childIds)
      await pool.query(
        `INSERT INTO media_child_access (media_id, child_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
        [mediaId, cid]);
    res.json({ ok: true });
  });

  app.delete('/api/media/:id', requireAuth, requireParent, async (req, res) => {
    const { rowCount } = await pool.query(`DELETE FROM media_files WHERE id=$1`, [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'media not found' });
    res.json({ ok: true });
  });

  app.put('/api/media/:id/access', requireAuth, requireParent, async (req, res) => {
    const childIds = (req.body?.child_ids || []).map(Number).filter(Boolean);
    const mediaId = Number(req.params.id);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM media_child_access WHERE media_id=$1`, [mediaId]);
      for (const cid of childIds)
        await client.query(
          `INSERT INTO media_child_access (media_id, child_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [mediaId, cid]);
      await client.query(
        `UPDATE media_files SET visibility = CASE WHEN $2::int > 0 THEN 'children' ELSE visibility END,
           assigned_child_id = $3 WHERE id=$1`,
        [mediaId, childIds.length, childIds[0] ?? null]);
      await client.query('COMMIT');
      res.json({ ok: true, child_ids: childIds });
    } catch (e) {
      await client.query('ROLLBACK'); console.error(e);
      res.status(500).json({ error: 'access update failed' });
    } finally { client.release(); }
  });

  // ---------- media (child view) ----------
  app.get('/api/my-media', requireAuth, async (req, res) => {
    if (req.user.role !== 'child') return res.status(403).json({ error: 'child token required' });
    const { rows } = await pool.query(
      `SELECT m.* FROM media_files m
       JOIN media_child_access a ON a.media_id=m.id
       WHERE a.child_id=$1 ORDER BY m.created_at DESC`, [req.user.sub]);
    res.json(rows);
  });

  // ---------- time limits ----------
  app.get('/api/children/:id/time-limit', requireAuth, async (req, res) => {
    const { rows } = await pool.query(
      `SELECT * FROM time_limits WHERE child_id=$1`, [req.params.id]);
    res.json(rows[0] || { child_id: Number(req.params.id), daily_minutes: null });
  });

  app.put('/api/children/:id/time-limit', requireAuth, requireParent, async (req, res) => {
    const { daily_minutes } = req.body || {};
    const { rows } = await pool.query(
      `INSERT INTO time_limits (child_id, daily_minutes) VALUES ($1,$2)
       ON CONFLICT (child_id) DO UPDATE SET daily_minutes=$2, updated_at=now()
       RETURNING *`, [req.params.id, daily_minutes]);
    res.json(rows[0]);
  });

  // ---------- watch time ----------
  app.get('/api/children/:id/watch-time', requireAuth, async (req, res) => {
    const days = Number(req.query.days || 7);
    const { rows } = await pool.query(
      `SELECT watch_date, minutes_watched FROM daily_watch_time
       WHERE child_id=$1 AND watch_date > CURRENT_DATE - $2::int
       ORDER BY watch_date`, [req.params.id, days]);
    res.json(rows);
  });

  app.post('/api/watch-time/tick', requireAuth, async (req, res) => {
    if (req.user.role !== 'child') return res.status(403).json({ error: 'child token required' });
    const minutes = Math.min(Number(req.body?.minutes || 1), 10);
    const { rows } = await pool.query(
      `INSERT INTO daily_watch_time (child_id, watch_date, minutes_watched)
       VALUES ($1, CURRENT_DATE, $2)
       ON CONFLICT (child_id, watch_date) DO UPDATE
         SET minutes_watched = daily_watch_time.minutes_watched + $2
       RETURNING *`, [req.user.sub, minutes]);
    res.json(rows[0]);
  });

  // ---------- blocked categories ----------
  app.get('/api/children/:id/blocked-categories', requireAuth, async (req, res) => {
    const { rows } = await pool.query(
      `SELECT category FROM blocked_categories WHERE child_id=$1`, [req.params.id]);
    res.json(rows.map(r => r.category));
  });

  app.put('/api/children/:id/blocked-categories', requireAuth, requireParent, async (req, res) => {
    const cats = req.body?.categories || [];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM blocked_categories WHERE child_id=$1`, [req.params.id]);
      for (const c of cats)
        await client.query(
          `INSERT INTO blocked_categories (child_id, category, blocked_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
          [req.params.id, c, own(req)]);
      await client.query('COMMIT');
      res.json({ ok: true, categories: cats });
    } catch (e) {
      await client.query('ROLLBACK'); console.error(e);
      res.status(500).json({ error: 'update failed' });
    } finally { client.release(); }
  });

  // ---------- activity ----------
  app.get('/api/children/:id/activity', requireAuth, requireParent, async (req, res) => {
    const { rows } = await pool.query(
      `SELECT * FROM activity_logs WHERE child_id=$1 ORDER BY created_at DESC LIMIT 50`,
      [req.params.id]);
    res.json(rows);
  });

  app.post('/api/activity', requireAuth, async (req, res) => {
    const { action, details } = req.body || {};
    const childId = req.user.role === 'child' ? req.user.sub : null;
    const parentId = req.user.role === 'parent' ? req.user.sub : req.user.parent_id;
    await pool.query(
      `INSERT INTO activity_logs (child_id, parent_id, action, details) VALUES ($1,$2,$3,$4)`,
      [childId, parentId, action || 'unknown', details || null]);
    res.json({ ok: true });
  });
}
