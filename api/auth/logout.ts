import type { IncomingMessage, ServerResponse } from 'http';

const COOKIE_NAME = 'admin_token';

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Max-Age=0; Path=/`
  );
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true }));
}
