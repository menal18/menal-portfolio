import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import publicRoutes from './routes/publicRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';

// Strip Mongo operator keys ("$ne", "a.b") from user input (NoSQL injection)
const strip = (o) => {
  if (!o || typeof o !== 'object') return;
  for (const k of Object.keys(o)) {
    if (k.startsWith('$') || k.includes('.')) delete o[k];
    else strip(o[k]);
  }
};
const sanitize = (req, _res, next) => {
  strip(req.body);
  strip(req.params);
  strip(req.query);
  next();
};

export default function createApp() {
  const app = express();
  app.set('trust proxy', 1); // needed behind Render/Railway/Heroku proxies for correct rate limiting
  app.disable('x-powered-by');

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  const origins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
  // In development, localhost and 127.0.0.1 are interchangeable (a common gotcha when opening the site)
  if (process.env.NODE_ENV !== 'production') {
    for (const o of [...origins]) {
      if (o.includes('//localhost')) origins.push(o.replace('//localhost', '//127.0.0.1'));
    }
  }
  app.use(
    cors({
      origin: (origin, cb) => (!origin || origins.includes(origin) ? cb(null, true) : cb(Object.assign(new Error('Origin not allowed by CORS. Add it to CLIENT_URL in backend/.env.'), { status: 403 }))),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(sanitize);

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', publicRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
