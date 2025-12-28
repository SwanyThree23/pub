import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// AI MVP Services (Step 2: Minimum AI Functionality)
import { AIService } from './services/AIService.js';
import { HITLService } from './services/HITLService.js';
import { MonitoringService } from './services/MonitoringService.js';
import { EVMuxService } from './services/EVMuxService.js';
import { PRISMService } from './services/PRISMService.js';
import { VDONinjaService } from './services/VDONinjaService.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

// PostgreSQL (Step 3: High-Quality Dataset Storage)
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

app.use(cors());
app.use(express.json());

// Service Hub
const services = {
  ai: new AIService(),
  hitl: new HITLService(),
  monitoring: new MonitoringService(),
  evmux: new EVMuxService(),
  prism: new PRISMService(),
  vdo: new VDONinjaService()
};

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ==================== AUTH ====================
app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email',
      [username, email, hash, 'user']
    );

    const token = jwt.sign({ id: result.rows[0].id, role: 'user' }, process.env.JWT_SECRET || 'default_secret');
    res.json({ user: result.rows[0], token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (!result.rows[0] || !await bcrypt.compare(password, result.rows[0].password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: result.rows[0].id, role: result.rows[0].role },
      process.env.JWT_SECRET || 'default_secret'
    );

    res.json({
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        role: result.rows[0].role
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== AI MODERATION (MVP Feature #1) ====================
app.post('/chat/moderate', auth, async (req, res) => {
  try {
    const { streamId, username, message } = req.body;

    // Step 1: AI Analysis (OpenAI Moderation)
    const analysis = await services.ai.moderateContent(message);

    // Step 2: HITL Decision (Low confidence → Human review)
    let finalDecision = analysis;
    if (analysis.confidence < 0.8) {
      finalDecision = await services.hitl.requestHumanReview({
        type: 'moderation',
        data: { message, username, aiAnalysis: analysis },
        priority: analysis.toxicity > 0.5 ? 'high' : 'normal'
      });
    }

    // Step 3: Store Ground Truth for Retraining
    await db.query(
      `INSERT INTO chat_messages
       (stream_id, username, message, toxicity_score, ai_confidence, human_reviewed, final_decision)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [streamId, username, message, finalDecision.toxicity, analysis.confidence, finalDecision.humanReviewed || false, finalDecision.toxic ? 'toxic' : 'safe']
    );

    // Step 4: Model Monitoring (Track Drift)
    services.monitoring.trackPrediction('moderation', {
      input: message,
      prediction: finalDecision.toxic,
      confidence: analysis.confidence
    });

    broadcast({ event: 'chat:moderated', data: { username, message, safe: !finalDecision.toxic, analysis: finalDecision } });

    res.json({ success: true, decision: finalDecision });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HITL QUEUE ====================
app.get('/hitl/queue', auth, async (req, res) => {
  try {
    const queue = await services.hitl.getReviewQueue(req.user.id);
    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/hitl/review/:id', auth, async (req, res) => {
  try {
    const { decision, feedback } = req.body;

    const result = await services.hitl.submitReview({
      reviewId: req.params.id,
      reviewerId: req.user.id,
      decision,
      feedback
    });

    // Log ground truth for model retraining
    await services.monitoring.logGroundTruth(result);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STREAMING ====================
app.post('/streams/create', auth, async (req, res) => {
  try {
    const stream = await services.evmux.createStream({
      name: req.body.name,
      userId: req.user.id
    });

    await db.query(
      'INSERT INTO streams (user_id, evmux_id, name, status) VALUES ($1, $2, $3, $4)',
      [req.user.id, stream.id, stream.name, 'created']
    );

    broadcast({ event: 'stream:created', data: stream });
    res.json(stream);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/streams/:id/start', auth, async (req, res) => {
  try {
    await services.evmux.startStream(req.params.id);
    await db.query('UPDATE streams SET status = $1, started_at = NOW() WHERE evmux_id = $2', ['live', req.params.id]);

    services.monitoring.trackEvent('stream_started', { streamId: req.params.id });
    broadcast({ event: 'stream:started', data: { id: req.params.id } });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/streams/:id/stop', auth, async (req, res) => {
  try {
    await services.evmux.stopStream(req.params.id);
    await db.query('UPDATE streams SET status = $1, ended_at = NOW() WHERE evmux_id = $2', ['ended', req.params.id]);

    broadcast({ event: 'stream:stopped', data: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/streams', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM streams WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PRISM MOBILE ====================
app.post('/prism/quick-setup', auth, async (req, res) => {
  try {
    const evmuxStream = await services.evmux.createStream({
      name: 'PRISM Mobile Stream',
      userId: req.user.id
    });

    const rtmpConfig = services.evmux.getStreamRTMPConfig(evmuxStream.id);
    const mobileUrl = services.prism.createMobileStreamURL(rtmpConfig);

    const sources = {
      rtmp: services.prism.createRTMPSource({
        name: 'PRISM Input',
        rtmpUrl: rtmpConfig.server,
        streamKey: rtmpConfig.key
      }),
      vdo: services.prism.createVDOSource({
        name: 'VDO.Ninja',
        url: 'https://vdo.ninja',
        isDirector: true
      })
    };

    res.json({
      evmuxStream,
      sources,
      mobileStream: mobileUrl,
      config: services.prism.generateStudioConfig()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== VDO.NINJA ====================
app.post('/vdo/room/create', auth, async (req, res) => {
  try {
    const { name, password } = req.body;
    const room = services.vdo.createRoom({ name, password });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/vdo/room/:id/guest-link', auth, async (req, res) => {
  try {
    const { guestName } = req.body;
    const link = services.vdo.generateGuestLink(req.params.id, guestName);
    res.json(link);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STRIPE SUBSCRIPTIONS ====================
app.post('/subscriptions/create', auth, async (req, res) => {
  try {
    const { priceId } = req.body;

    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel`,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await db.query(
      'UPDATE users SET subscription_status = $1 WHERE email = $2',
      ['active', session.customer_email]
    );
  }

  res.json({ received: true });
});

// ==================== ANALYTICS ====================
app.get('/analytics/overview', auth, async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT
        COUNT(DISTINCT s.id) as total_streams,
        COUNT(DISTINCT cm.id) as total_messages,
        COALESCE(AVG(cm.toxicity_score), 0) as avg_toxicity,
        COUNT(CASE WHEN cm.human_reviewed THEN 1 END) as human_reviews,
        COUNT(CASE WHEN s.status = 'live' THEN 1 END) as live_streams
      FROM streams s
      LEFT JOIN chat_messages cm ON s.id = cm.stream_id
      WHERE s.user_id = $1
    `, [req.user.id]);

    res.json(stats.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/monitoring/model-performance', auth, async (req, res) => {
  try {
    const metrics = await services.monitoring.getModelMetrics('moderation');
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN ====================
app.get('/admin/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const users = await db.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/admin/users/:id/role', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { role } = req.body;
    await db.query('UPDATE users SET role = $1 WHERE id = $2', [role, req.params.id]);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WEBSOCKET ====================
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('✅ WebSocket client connected');

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data);
      broadcast(parsed);
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });

  ws.on('close', () => {
    console.log('❌ WebSocket client disconnected');
  });
});

// ==================== HEALTH & METRICS ====================
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.get('/metrics', (req, res) => {
  res.json({
    ai: services.ai.getStats(),
    streams: services.evmux.streams.size,
    rooms: services.vdo.rooms.size
  });
});

// ==================== STARTUP ====================
const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
  console.log(`🚀 SwanyThree MVP running on :${PORT}`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`❤️  Health check at http://localhost:${PORT}/health`);
});
