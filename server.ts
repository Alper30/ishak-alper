import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Webhook endpoint (must be BEFORE any express.json() if you need row body, 
  // but for generic webhooks we can parse JSON or raw)
  // Let's configure raw body for stripe webhooks as an example, but we'll use json for now
  
  // Example for a generic webhook:
  app.post('/api/webhook', express.json(), (req, res) => {
    console.log('Webhook received!', req.body);
    // Process your webhook here
    
    res.status(200).json({ received: true });
  });

  // Example for stripe webhook (requires raw body):
  app.post('/api/webhook/stripe', express.raw({type: 'application/json'}), (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];
    
    console.log('Stripe webhook received!');
    // Verify signature with Stripe SDK...
    
    res.status(200).send('Webhook received');
  });

  // General API routes with JSON payload support
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    const distPath = path.resolve(__dirname, process.env.NODE_ENV === 'production' && __dirname.endsWith('dist') ? '.' : 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
