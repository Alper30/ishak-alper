import type { IncomingMessage, ServerResponse } from 'http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'admin_token';

function parseCookies(header: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  header.split(';').forEach(pair => {
    const [k, ...v] = pair.trim().split('=');
    if (k) cookies[k.trim()] = decodeURIComponent(v.join('='));
  });
  return cookies;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

  if (!JWT_SECRET || !ADMIN_EMAIL || !ADMIN_PASSWORD_HASH) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Sunucu yapılandırma hatası' }));
    return;
  }

  let body: { email?: string; password?: string } = {};
  try {
    const raw = await new Promise<string>((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    body = JSON.parse(raw);
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Geçersiz istek' }));
    return;
  }

  const { email, password } = body;

  if (!email || !password) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Email ve şifre gerekli' }));
    return;
  }

  if (email !== ADMIN_EMAIL) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Geçersiz email veya şifre' }));
    return;
  }

  const valid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!valid) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Geçersiz email veya şifre' }));
    return;
  }

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '7d' });
  const maxAge = 7 * 24 * 60 * 60;

  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}; Path=/`
  );
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, email }));
}
