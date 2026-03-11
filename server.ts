import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './src/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fly-key';

app.use(express.json());

// Helper to get today's date string
const getToday = () => new Date().toISOString().split('T')[0];

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- API Routes ---

app.post('/api/register', async (req, res) => {
  const { username, email, country, phoneNumber, password } = req.body;
  if (!username || !email || !country || !phoneNumber || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO users (id, username, email, phone_number, country, password_hash, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    stmt.run(id, username, email, phoneNumber, country, hash, new Date().toISOString());
    
    res.json({ success: true });
  } catch (err: any) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Username, email, or phone number already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? OR email = ? OR phone_number = ?');
    const user = stmt.get(identifier, identifier, identifier) as any;
    if (!user || user.is_guest) return res.status(401).json({ error: 'username or password mismatch' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'username or password mismatch' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, phoneNumber: user.phone_number, country: user.country } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/guest', (req, res) => {
  try {
    const id = uuidv4();
    const username = `Guest_${id.substring(0, 6)}`;
    const stmt = db.prepare('INSERT INTO users (id, username, is_guest, created_at) VALUES (?, ?, 1, ?)');
    stmt.run(id, username, new Date().toISOString());
    
    const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id, username, is_guest: 1 } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/submit-score', authenticate, (req: any, res: any) => {
  const { score, play_time, device_type, mode = 'beginner' } = req.body;
  const userId = req.user.id;
  const today = getToday();

  try {
    // Anti-cheat: max 10 taps per second
    if (score > play_time * 10) {
      return res.status(400).json({ error: 'Cheating detected: Impossible score' });
    }

    const userStmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = userStmt.get(userId) as any;
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Premium system check (Free: 5 games/day)
    let plays_today = user.plays_today;
    if (user.last_play_date !== today) {
      plays_today = 0;
    }
    
    if (plays_today >= 5) {
      return res.status(403).json({ error: 'Daily limit reached. Upgrade to Premium!' });
    }

    // Insert score
    const scoreId = uuidv4();
    const insertScore = db.prepare('INSERT INTO scores (id, user_id, score, mode, play_time, device_type, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertScore.run(scoreId, userId, score, mode, play_time, device_type, new Date().toISOString());

    // Update user stats
    const newTotal = user.total_score + score;
    const newHighest = Math.max(user.highest_score, score);
    
    let modeHighest = score;
    let updateQuery = 'UPDATE users SET total_score = ?, highest_score = ?, plays_today = ?, last_play_date = ? WHERE id = ?';
    let queryParams = [newTotal, newHighest, plays_today + 1, today, userId];

    if (mode === 'beginner') {
      modeHighest = Math.max(user.highest_score_beginner || 0, score);
      updateQuery = 'UPDATE users SET total_score = ?, highest_score = ?, highest_score_beginner = ?, plays_today = ?, last_play_date = ? WHERE id = ?';
      queryParams = [newTotal, newHighest, modeHighest, plays_today + 1, today, userId];
    } else if (mode === 'intermediate') {
      modeHighest = Math.max(user.highest_score_intermediate || 0, score);
      updateQuery = 'UPDATE users SET total_score = ?, highest_score = ?, highest_score_intermediate = ?, plays_today = ?, last_play_date = ? WHERE id = ?';
      queryParams = [newTotal, newHighest, modeHighest, plays_today + 1, today, userId];
    } else if (mode === 'advanced') {
      modeHighest = Math.max(user.highest_score_advanced || 0, score);
      updateQuery = 'UPDATE users SET total_score = ?, highest_score = ?, highest_score_advanced = ?, plays_today = ?, last_play_date = ? WHERE id = ?';
      queryParams = [newTotal, newHighest, modeHighest, plays_today + 1, today, userId];
    }

    const updateUser = db.prepare(updateQuery);
    updateUser.run(...queryParams);

    res.json({ success: true, newHighest, modeHighest, plays_today: plays_today + 1 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/leaderboard', (req, res) => {
  const mode = req.query.mode || 'all';
  try {
    let query = `
      SELECT username, highest_score, total_score 
      FROM users 
      ORDER BY highest_score DESC, total_score DESC 
      LIMIT 100
    `;

    if (mode === 'beginner') {
      query = `SELECT username, highest_score_beginner as highest_score, total_score FROM users ORDER BY highest_score_beginner DESC, total_score DESC LIMIT 100`;
    } else if (mode === 'intermediate') {
      query = `SELECT username, highest_score_intermediate as highest_score, total_score FROM users ORDER BY highest_score_intermediate DESC, total_score DESC LIMIT 100`;
    } else if (mode === 'advanced') {
      query = `SELECT username, highest_score_advanced as highest_score, total_score FROM users ORDER BY highest_score_advanced DESC, total_score DESC LIMIT 100`;
    }

    const stmt = db.prepare(query);
    const leaderboard = stmt.all();
    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/profile/:id', authenticate, (req: any, res: any) => {
  try {
    const stmt = db.prepare(`
      SELECT username, total_score, highest_score, highest_score_beginner,
      highest_score_intermediate, highest_score_advanced, plays_today,
      last_play_date, created_at
      FROM users WHERE id = ?
    `);

    const user = stmt.get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const today = getToday();

    if (user.last_play_date !== today) {
      user.plays_today = 0;
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
