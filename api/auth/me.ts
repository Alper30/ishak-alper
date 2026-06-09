import type { IncomingMessage, ServerResponse } from 'http';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'admin_token';

function parseCookies(header: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  header.split(';').forEach(pair => {
    const [k, ...v] = pair.trim().split('=');
    if (k) cookies[k.trim()] = decodeURIComponent(v.join('='));
  });
  return cookies;
}

export default function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Sunucu yapılandırma hatası' }));
    return;
  }

  const cookieHeader = req.headers.cookie || '';
  const cookies = parseCookies(cookieHeader);
  const token = cookies[COOKIE_NAME];

  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Giriş yapılmamış' }));
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email: string };
    res.statusCode = 200;
    res.end(JSON.stringify({ email: payload.email }));
  } catch {
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`
    );
    res.statusCode = 401;
    res.end(JSON.stringify({ error: 'Oturum süresi doldu' }));
  }
}
