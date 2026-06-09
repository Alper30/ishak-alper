import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH!;
const JWT_EXPIRES_IN = '7d';
const COOKIE_NAME = 'admin_token';

if (!JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
  console.error('Eksik env değişkeni: JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH gerekli');
  process.exit(1);
}

export interface AuthRequest extends Request {
  admin?: { email: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'Giriş yapılmamış' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email: string };
    req.admin = { email: payload.email };
    next();
  } catch {
    res.clearCookie(COOKIE_NAME);
    return res.status(401).json({ error: 'Oturum süresi doldu' });
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Cookie parser (manuel)
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const cookies: Record<string, string> = {};
    const cookieHeader = req.headers.cookie || '';
    cookieHeader.split(';').forEach(pair => {
      const [key, ...val] = pair.trim().split('=');
      if (key) cookies[key.trim()] = decodeURIComponent(val.join('='));
    });
    (req as any).cookies = cookies;
    next();
  });

  // ── Auth Routes ──────────────────────────────────────────────────────────

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!valid) {
      return res.status(401).json({ error: 'Geçersiz email veya şifre' });
    }

    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    return res.json({ ok: true, email });
  });

  app.post('/api/auth/logout', (_req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    return res.json({ ok: true });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
    return res.json({ email: req.admin!.email });
  });

  // ── Health ───────────────────────────────────────────────────────────────

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // ── Vite / Static ────────────────────────────────────────────────────────

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, __dirname.endsWith('dist') ? '.' : 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
