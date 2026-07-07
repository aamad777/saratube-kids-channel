import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const TTL = '12h';

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'invalid or expired token' }); }
}

export function requireParent(req, res, next) {
  if (req.user?.role !== 'parent') return res.status(403).json({ error: 'parent role required' });
  next();
}

export function registerAuthRoutes(app, pool) {
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password, display_name } = req.body || {};
    if (!email || !password || password.length < 8)
      return res.status(400).json({ error: 'email and password (min 8 chars) required' });
    const hash = await bcrypt.hash(password, 12);
    try {
      const { rows } = await pool.query(
        `INSERT INTO parents (display_name, email, password_hash)
         VALUES ($1, LOWER($2), $3) RETURNING id, display_name, email`,
        [display_name || email.split('@')[0], email, hash]);
      res.status(201).json(rows[0]);
    } catch (e) {
      if (e.code === '23505') return res.status(409).json({ error: 'email already registered' });
      console.error(e); res.status(500).json({ error: 'signup failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body || {};
    const { rows } = await pool.query(
      `SELECT id, display_name, email, password_hash FROM parents WHERE email = LOWER($1)`,
      [email || '']);
    const u = rows[0];
    if (!u?.password_hash || !(await bcrypt.compare(password || '', u.password_hash)))
      return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ sub: u.id, role: 'parent', name: u.display_name }, JWT_SECRET, { expiresIn: TTL });
    res.json({ token, user: { id: u.id, display_name: u.display_name, email: u.email } });
  });

  app.post('/api/auth/kid-login', async (req, res) => {
    const { login_name } = req.body || {};
    const { rows } = await pool.query(
      `SELECT id, display_name, login_name, parent_id FROM children WHERE LOWER(login_name)=LOWER($1)`,
      [login_name || '']);
    const kid = rows[0];
    if (!kid) return res.status(401).json({ error: 'unknown login name' });
    const token = jwt.sign({ sub: kid.id, role: 'child', name: kid.display_name, parent_id: kid.parent_id }, JWT_SECRET, { expiresIn: TTL });
    res.json({ token, child: kid });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => res.json(req.user));
}
